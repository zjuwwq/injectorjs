(function(root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof module === 'object' && typeof exports === 'object' && module.exports === exports) {
		module.exports = factory();
	} else {
		root.Injector = factory();
	}
})(this, function() {
	if (!Array.prototype.forEach) {
		Array.prototype.forEach = function(fn, scope) {
			for (var i = 0, length = this.length; i < length; i++) {
				fn.call(scope, this[i], i, this);
			}
		};
	}
	var TYPE_REGEX = /\s+(\w+)\]$/,
		COMMENT_REGEX = /\/\/.*$|\/\*[\s\S]*?\*\//mg,
		ARGS_REGEX = /\(([\s\S]*?)\)/m,
		INJECT_PREFIX = '$',
		CLASS_PREFIX = '$';
	var storage = {};
	/**
	 * 获取对象的类型
	 * @param  {Object} obj 对象
	 * @return {String}     类型
	 */
	function type(obj) {
		return Object.prototype.toString.call(obj).match(TYPE_REGEX)[1].toLowerCase();
	}
	/**
	 * 解析名称（去除前缀）
	 * @param  {String} name 名称
	 * @param  {String} prefix 前缀
	 * @return {String}      解析后的名称
	 */
	function resolveName(name, prefix) {
		if (type(name) !== 'string') return;
		prefix = prefix || '';
		return name.indexOf(prefix) === 0 ? name.substring(prefix.length) : name;
	}
	/**
	 * 注册对象
	 * @param  {String} name 名称
	 * @param  {Object} obj  对象
	 * @return {Void}
	 */
	function register(name, obj) {
		storage[name] = obj;
	}
	/**
	 * 解析函数(类)，注入对象
	 * @param  {Function} fn 函数
	 * @return {Function}    解析后的函数
	 */
	function resolve(fn) {
		if (type(fn) !== 'function') return;
		var injectPrefix = this.config.injectPrefix || INJECT_PREFIX,
			classPrefix = this.config.classPrefix || CLASS_PREFIX,
			fnStr = fn.toString().replace(COMMENT_REGEX, ''), //	去除注释
			argStr = fnStr.match(ARGS_REGEX)[1].replace(/\s*/g, ''), //	获取参数
			index = argStr.indexOf(injectPrefix),
			injectStr,
			names,
			$injects = [];
			
		if (index !== -1) {
			injectStr = argStr.substring(index); //	获取需要注入的参数
			names = injectStr.split(',');
			// 检查是否所有的注入对象都写在参数的尾部
			for (var i = 0, name; name = names[i]; i++) {
				if (name.indexOf(injectPrefix) !== 0) {
					throw new Error('Resolve failed: all injected must at the end of arguments');
				}
			}

			names.forEach(function(name) {
				$injects.push(resolveName(name, injectPrefix));
			});
		}
		// 解析后的函数
		function injectedFn() {
			var names = injectedFn.$injects || [],
				injects = [],
				inject,
				obj;
			names.forEach(function(name) {
				var isClass;
				if(name.indexOf(classPrefix) === 0){
					// depend on class
					isClass = 1;
					name = resolveName(name, classPrefix);
				}
				if (name in storage) {
					inject = storage[name];
					if (isClass) {
						// 如果注册的是构造函数，实例化
						try{
							inject = new inject();
						}catch(e){
							throw new Error('Resolve failed: ' + name + ' can\'t be instantiated' );
						}
					}
					injects.push(inject);
				} else {
					throw new Error('Resolve failed: ' + name + ' is not registered');
				}
			});

			return fn.apply(this, Array.prototype.slice.call(arguments).concat(injects));
		}

		injectedFn.$injects = fn.$injects || $injects;
		injectedFn.prototype = fn.prototype;
		injectedFn.prototype.constructor = injectedFn;
		return injectedFn;
	}
	return {
		register: register,
		resolve: resolve,
		config: {
			injectPrefix: INJECT_PREFIX,
			classPrefix: CLASS_PREFIX
		}
	};
});
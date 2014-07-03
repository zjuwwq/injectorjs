describe('dependency injection', function() {
	function type(obj) {
		return Object.prototype.toString.call(obj).match(/\s+(\w+)\]/)[1];
	}

	// register object
	var util = {
		map: function map(obj, cb) {
			if (type(obj) !== 'Object' || type(cb) !== 'Function') return;
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					cb(p, obj[p], obj);
				}
			}
		},
		each: function(arr, cb) {
			if (!arr || !arr.length || type(cb) !== 'Function') return;
			for (var i = 0, length = arr.length; i < length; i++) {
				cb(arr[i], i, arr);
			}
		}
	};
	injector.register('util', util);

	// register class
	function DAO() {
		this._data = [{
			name: 'tom',
			age: 10
		}, {
			name: 'jimmy',
			age: 9
		}];
	}
	DAO.prototype.getStudents = function(grade) {
		return this._data;
	};
	injector.register('dao', DAO);


	it('Method injection', function() {
		var keys = injector.resolve(function(obj, $util) {
			if (type(obj) !== 'Object') return;
			var arr = [];
			$util.map(obj, function(p) {
				arr.push(p);
			});
			var arr1 = [];
			$util.each(arr, function(v) {
				arr1.push(v.toUpperCase());
			});
			return arr1.join(',');
		});
		expect(keys({
			name: 'wwq',
			age: 30
		})).toEqual('NAME,AGE');
	});
	it('inject class', function() {
		var fn = injector.resolve(function($util, $$dao){
			var names = [];
			$util.each($$dao.getStudents(), function(student){
				names.push(student.name);
			});
			return names.join(',');
		});
		expect(fn()).toEqual('tom,jimmy');
	});
	it('Constructor injection', function() {

		injector.register('person', {
			name: 'wwq',
			age: 30
		});
		function Teacher(id, $person, $$dao) {
			this._id = id;
			this._person = $person;
			this._dao = $$dao;
		}
		Teacher.prototype.toString = function() {
			return 'I am ' + this._person.name;
		};
		Teacher.prototype.students = function() {
			return this._dao.getStudents();
		};

		var T = injector.resolve(Teacher),
			t = new T(1);
		expect(t.toString()).toEqual('I am wwq');
		expect(t.students().length).toBe(2);
	});
	
	it('explicitly injection', function() {
		injector.register('tom', {
			name: 'tom',
			age: 12
		});
		injector.register('jack', {
			name: 'jack',
			age: 8
		});
		var foo = injector.resolve(function foo(a, b, c) {
			return a + b.name + c.name;
		});
		foo.$injects = ['tom', 'jack'];
		expect(foo('a')).toEqual('atomjack');
	});
	it('all injected must at the end of arguments', function() {
		injector.register('aaa');

		function fn() {
			return injector.resolve(function($aaa, b, c) {});
		}
		expect(fn).toThrow();
	});
	it('throw error when inject argument which has not registered', function() {
		function fn() {
			var foo = injector.resolve(function($bbb) {});
			return foo();
		}
		expect(fn).toThrow();
	});
	it('throw error when depend on a class but register not', function() {
		injector.register('bbb', 1);
		function fn() {
			var foo = function(b){};
			foo.$injects = ['$bbb'];
			var foo1 = injector.resolve(foo);
			return foo1();
		}
		expect(fn).toThrow();
	});
});
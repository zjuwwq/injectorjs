describe('dependency injection', function() {
	function type(obj) {
		return Object.prototype.toString.call(obj).match(/\s+(\w+)\]/)[1];
	}
	var util0 = {
		map: function map(obj, cb) {
			if (type(obj) !== 'Object' || type(cb) !== 'Function') return;
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					cb(p, obj[p], obj);
				}
			}
		}
	};
	var util1 = {
		each: function(arr, cb) {
			if (!arr || !arr.length || type(cb) !== 'Function') return;
			for (var i = 0, length = arr.length; i < length; i++) {
				cb(arr[i], i, arr);
			}
		}
	};
	it('Method injection', function() {
		injector.register('util0', util0);
		injector.register('util1', util1);
		var keys = injector.resolve(function(obj, $util0, $util1) {
			if (type(obj) !== 'Object') return;
			var arr = [];
			$util0.map(obj, function(p) {
				arr.push(p);
			});
			var arr1 = [];
			$util1.each(arr, function(v) {
				arr1.push(v.toUpperCase());
			});
			return arr1.join(',');
		});
		expect(keys({
			name: 'wwq',
			age: 30
		})).toEqual('NAME,AGE');
	});
	it('Constructor injection', function() {
		function DAO() {
			this._data = [{
				name: 'tom',
				age: 10
			}, {
				name: 'jimmy',
				age: 9
			}, {
				name: 'jack',
				age: 10
			}];
		}
		DAO.prototype.getStudents = function(grade) {
			return this._data;
		};
		injector.register('person', {
			name: 'wwq',
			age: 30
		});
		injector.register('dao', DAO);

		function Teacher(id, $person, $dao) {
			this._id = id;
			this._person = $person;
			this._dao = $dao;
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
		expect(t.students().length).toBe(3);
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
});
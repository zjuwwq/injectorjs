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
	it('method injection', function() {
		Injector.register('util0', util0);
		Injector.register('util1', util1);
		var keys = Injector.resolve(function(obj, $util0, $util1) {
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
	it('constructor injection', function() {
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
		Injector.register('person', {
			name: 'wwq',
			age: 30
		});
		Injector.register('dao', DAO);

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

	});
	it('all injected must at the end of arguments', function() {
		Injector.register('aaa');

		function fn() {
			return Injector.resolve(function($aaa, b, c) {});
		}
		expect(fn).toThrow();
	});
	it('throw error when inject argument which has not registered', function() {
		function fn() {
			var foo = Injector.resolve(function($bbb) {});
			return foo();
		}
		expect(fn).toThrow();
	});
	it('explicitly injection', function() {
		Injector.register('tom', {
			name: 'tom',
			age: 12
		});
		Injector.register('jack', {
			name: 'jack',
			age: 8
		});
		var foo = Injector.resolve(function foo(a, b, c) {
			return a + b.name + c.name;
		});
		foo.$injects = ['tom', 'jack'];
		expect(foo('a')).toEqual('atomjack');		
	});
});
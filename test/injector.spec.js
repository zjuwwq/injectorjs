describe('dependency injection', function() {
	// register object
	Injector.register('util', {
		map: function map(obj, cb) {
			if (typeof obj !== 'object' || typeof cb !== 'function') return;
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					cb(p, obj[p], obj);
				}
			}
		},
		each: function(arr, cb) {
			if (!arr || !arr.length || typeof cb !== 'function') return;
			for (var i = 0, length = arr.length; i < length; i++) {
				cb(arr[i], i, arr);
			}
		}
	});

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
	Injector.register('dao', DAO);


	it('Method injection', function() {
		var keys = Injector.resolve(function(obj, $util) {
			if (typeof obj  !== 'object') return;
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
		var fn = Injector.resolve(function($util, $$dao) {
			var names = [];
			$util.each($$dao.getStudents(), function(student) {
				names.push(student.name);
			});
			return names.join(',');
		});
		expect(fn()).toEqual('tom,jimmy');
	});
	it('Constructor injection', function() {

		Injector.register('person', {
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

		var T = Injector.resolve(Teacher),
			t = new T(1);
		expect(t.toString()).toEqual('I am wwq');
		expect(t.students().length).toBe(2);
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
	it('throw error when depend on a class but register not', function() {
		Injector.register('bbb', 1);

		function fn() {
			var foo = function(b) {};
			foo.$injects = ['$bbb'];
			var foo1 = Injector.resolve(foo);
			return foo1();
		}
		expect(fn).toThrow();
	});
});
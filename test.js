var Injector = require('./injector.js');
// register
// Register Object
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
// register a class, which will be resolved to a instance of class.
Injector.register('dao', DAO);

// Method Injection
// Depend on Object
var keys = Injector.resolve(function(obj, $util) {
	if (typeof obj !== 'object') return;
	var arr = [];
	$util.map(obj, function(p) {
		arr.push(p);
	});
	return arr;
});
keys({
	name: 'wwq',
	age: 30
}); // ['name', 'age']

// Depend on Class
// depend on a object:$util and a instance of class:$$dao
var fn = Injector.resolve(function($util, $$dao) {
	var names = [];
	$util.each($$dao.getStudents(), function(student) {
		names.push(student.name);
	});
	return names.join(',');
});
fn(); // 'tom,jimmy'


// Constructor Injection
Injector.register('person', {
	name: 'wwq',
	age: 30
});

// Teacher depend on a object:$person and a instance of class:$$dao
function Teacher(id, $person, $$dao) {
	this._id = id;
	this._person = $person;
	this._dao = $$dao; // resolve to a DAO instance
}

Teacher.prototype.toString = function() {
	return 'I am ' + this._person.name;
};
Teacher.prototype.students = function() {
	return this._dao.getStudents();
};

var T = Injector.resolve(Teacher),
	t = new T(1);
t.toString(); //'I am wwq'
t.students(); // [{name: 'tom', age: 10}, {name: 'jimmy',age: 9}];

// Explicitly Injection
Injector.register('tom', {
	name: 'tom',
	age: 12
});
Injector.register('class', function() {
	this.name = 'jack';
});
var foo = Injector.resolve(function foo(a, b, c) {
	return a + ',' + b.name + ',' + c.name;
});
foo.$injects = ['tom', '$class'];
foo('a'); // "a,tom,jack"
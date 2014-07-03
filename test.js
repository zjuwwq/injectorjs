var injector = require('./injector.js');
// register
// register a object
injector.register('util', {
	map: function(obj, cb) {
		if (typeof obj !== 'object' || typeof cb !== 'function') return;
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				cb(p, obj[p], obj);
			}
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
// register a class, which will be resolve to a instance of class.
injector.register('dao', DAO);

// Method Injection
// depend on object
var keys = injector.resolve(function(obj, $util) {
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

// Constructor Injection
injector.register('person', {
	name: 'wwq',
	age: 30
});

// Teacher depend on a object:$person and a instance of class:$dao
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

var T = injector.resolve(Teacher),
	t = new T(1);
t.toString(); //'I am wwq'
t.students(); // [{name: 'tom', age: 10}, {name: 'jimmy',age: 9}];

injector.register('tom', {
	name: 'tom',
	age: 12
});
injector.register('class', function(){
	this.name = 'jack';
});
var foo = injector.resolve(function foo(a, b, c) {
	return a + ',' + b.name + ',' + c.name;
});
foo.$injects = ['tom', '$class'];
foo('a'); // "a,tom,jack"
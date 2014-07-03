var injector = require('./injector.js');
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
injector.register('person', {
	name: 'wwq',
	age: 30
});
// register a class, which will be resolve to a instance of class.
injector.register('dao', DAO);
// Teacher depend on a object:$person and a instance of class:$dao
function Teacher(id, $person, $dao) {
	this._id = id;
	this._person = $person;
	this._dao = $dao; // resolve to a DAO instance
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
injector.register('jack', {
	name: 'jack',
	age: 8
});
var foo = injector.resolve(function foo(a, b, c) {
	return a + ',' + b.name + ',' + c.name;
});
foo.$injects = ['tom', 'jack'];
foo('a');	// "a,tom,jack"
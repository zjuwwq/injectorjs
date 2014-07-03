var injector = require('./injector.js');
injector.register('tom', {age: 12});
var fn = injector.resolve(function(a, $tom){
	return a + ',' + $tom.age;
});
console.log(fn(1));
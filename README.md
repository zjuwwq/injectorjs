injectorjs
===========

a javascript dependency injection library

## Installtion
Download:[Source](https://raw.githubusercontent.com/zjuwwq/injectorjs/master/injector.js) | [Minified](https://raw.githubusercontent.com/zjuwwq/injectorjs/master/injector.min.js)

Npm: `npm install injectorjs`

Bower: `bower install injectorjs`

## Case
```
	var node = html2dom('<td><span>123</span></td>');
	node.tagName; 	// 'td'
	node.innerHTML; // '<span>123</span>'

	var nodes = html2dom('<div>1</div><p>2</p>');
	nodes.length; 	// 2
	nodes[1].tagName; // 'p'
```
## [LICENSE](https://github.com/zjuwwq/injectorjs/blob/master/LICENSE)
MIT
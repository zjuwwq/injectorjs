function getName(name){
	if(typeof name === 'string'){
		return name.replace(/js$/, '');
	}
}
module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');
	pkg.name = pkg.name.replace(/js$/, '');
	// Project configuration.
	grunt.initConfig({
		pkg: pkg,
		uglify: {
			options: {
				banner: '// <%= pkg.name %>.js v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) //\n'
			},
			build: {
				src: '<%= pkg.name %>.js',
				dest: '<%= pkg.name %>.min.js'
			}
		},
		watch: {
			scripts: {
				files: ['injector.js'],
				tasks: ['uglify']
			}
		}
	});

	// Load the plugin that provides tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['uglify', 'watch']);

};
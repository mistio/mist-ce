module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		emberTemplates: {
			compile: {
				options: {
					templateName: function(sourceFile) {
						return sourceFile.split('/').slice(-1).pop();
					}
				},
				files: {
					'dist/templates.js': 'src/mist/io/static/js/app/templates/*.hbs',
				}
			}
		},
		bower_concat: {
			all: {
				dest: 'dist/vendor.js',
                exclude: ['requirejs', 'requirejs-text'],
				bowerOptions: {
					relative: false
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-ember-templates');
	grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    //grunt.registerTask('js', ['requirejs:accountJS', 'requirejs:manageJS']);
    //grunt.registerTask('css', ['requirejs:accountCSS', 'requirejs:manageCSS']);

	grunt.registerTask('default', ['bower_concat:all', 'emberTemplates']);
};

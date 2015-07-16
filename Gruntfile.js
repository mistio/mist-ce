module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		emberTemplates: {
	        compile: {
	            options: {
	                amd: false,
	                templateName: function(sourceFile) {
	                    return sourceFile.split('/').slice(-1).pop();
	                },
	                templateCompilerPath: './bower_components/ember/ember-template-compiler.js',
	                handlebarsPath: 'node_modules/handlebars/dist/handlebars.js'
	            },
	            files: {
					'dist/templates.js': 'src/mist/io/static/js/app/templates/*.hbs'
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
		},
		symlink: {
  			jquery: {
    			target: '../bower_components/jquery/',
    			link: 'dist/jquery',
				type: 'dir',
				options: {
					overwrite: true,
					force: true
				}
			},
			jqm: {
				target: '../bower_components/jquery-mobile-bower/',
				link: 'dist/jqm',
				options: {
					overwrite: true,
					force: true
				}
			},
			ember: {
				target: '../bower_components/ember/',
				link: 'dist/ember',
				options: {
					overwrite: true,
					force: true
				}
			},
			requirejs_text: {
				target: '../bower_components/requirejs-text/',
				link: 'dist/requirejs-text',
				options: {
					overwrite: true,
					force: true
				}
			},
			sockjs: {
				target: '../bower_components/sockjs/',
				link: 'dist/sockjs',
				options: {
					overwrite: true,
					force: true
				}
			},
			md5: {
				target: '../bower_components/md5/',
				link: 'dist/md5',
				options: {
					overwrite: true,
					force: true
				}
			},
			d3: {
				target: '../bower_components/d3/',
				link: 'dist/d3',
				options: {
					overwrite: true,
					force: true
				}
			},
			c3: {
				target: '../bower_components/c3/',
				link: 'dist/c3',
				options: {
					overwrite: true,
					force: true
				}
			},
			term: {
				target: '../bower_components/term.js/',
				link: 'dist/term.js',
				options: {
					overwrite: true,
					force: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-ember-templates');
	grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-symbolic-link');

    //grunt.registerTask('js', ['requirejs:accountJS', 'requirejs:manageJS']);
    //grunt.registerTask('css', ['requirejs:accountCSS', 'requirejs:manageCSS']);

	grunt.registerTask('default', ['bower_concat:all', 'emberTemplates', 'symlink']);
};

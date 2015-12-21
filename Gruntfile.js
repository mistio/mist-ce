module.exports = function(grunt) {
    var timestamp = Math.floor(Date.now() / 1000);
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
        requirejs: {
            mistjs: {
                options: {
                    name: 'app',
                    baseUrl: 'src/mist/io/static/js',
                    mainConfigFile: 'src/mist/io/static/js/app.js',
                    out: 'dist/mist.js'
                }
            },
            mistcss: {
                options: {
                    cssIn: 'src/mist/io/static/main.css',
                    out: 'dist/mist.css',
                    optimizeCss: 'standard'
                }
            }
        },
        symlink: {
            dist: {
                target: '../../../../dist/',
                link: 'src/mist/io/static/dist',
                type: 'dir',
                options: {
                    overwrite: true,
                    force: true
                }
            },
            jquery: {
                target: '../bower_components/jquery/dist/',
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
            requirejs: {
                target: '../bower_components/requirejs/',
                link: 'dist/requirejs',
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
            },
            yamljs: {
                target: '../node_modules/yamljs/',
                link: 'dist/yamljs',
                options: {
                    overwrite: true,
                    force: true
                }
            },
            images: {
                target: '../src/mist/io/static/images',
                link: 'dist/images',
                type: 'dir',
                options: {
                    overwrite: true,
                    force: true
                }
            },
            fonts: {
                target: '../src/mist/io/static/fonts',
                link: 'dist/fonts',
                type: 'dir',
                options: {
                    overwrite: true,
                    force: true
                }
            },
            states: {
                target: '../src/mist/io/static/states',
                link: 'dist/states',
                type: 'dir',
                options: {
                    overwrite: true,
                    force: true
                }
            },
            mistjs: {
                target: 'dist/mist.js',
                link: 'dist/mist' + timestamp + '.js'
            },
            mistcss: {
                target: 'dist/mist.css',
                link: 'dist/mist' + timestamp + '.css'
            }
        },
        'string-replace': {
            version: {
                files: {
                    'settings.py': 'settings.py',
                    'db.yaml': 'db.yaml',
                },
                options: {
                    replacements: [{
                        pattern: /LAST_BUILD = .*/,
                        replacement: 'LAST_BUILD = ' + timestamp
                    },
                    {
                        pattern: 'backend',
                        replacement: 'cloud'
                    }
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-ember-templates');
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-symbolic-link');
    grunt.loadNpmTasks('grunt-string-replace');

    //grunt.registerTask('js', ['requirejs:accountJS', 'requirejs:manageJS']);
    //grunt.registerTask('css', ['requirejs:accountCSS', 'requirejs:manageCSS']);

    grunt.registerTask('default', [
		'emberTemplates',
		'symlink:dist',
		'symlink:jquery',
		'symlink:jqm',
		'symlink:ember',
		'symlink:requirejs',
		'symlink:requirejs_text',
		'symlink:sockjs',
		'symlink:md5',
		'symlink:d3',
		'symlink:c3',
		'symlink:term',
		'symlink:images',
		'symlink:fonts',
		'symlink:states',
		'symlink:yamljs',
		'requirejs',
		'symlink:mistjs',
		'symlink:mistcss',
		'string-replace'
	]);
};

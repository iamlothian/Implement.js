
module.exports = function(grunt) {

    grunt.config('env', grunt.option('env') || process.env.GRUNT_ENV || 'development');
    grunt.config('compress', grunt.config('env') === 'production');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                laxcomma: true,
                '-W083': true,
                proto: true
            },
            files: ['src/**/*.js']
        },
        jasmine: {
            pivotal: {
                src: 'src/**/*.js',
                options: {
                    specs: 'spec/*.spec.js',
                    helpers: 'spec/*.spec.helper.js'
                }
            }
        },
        bowercopy: {
            scripts: {
                options: {
                    srcPrefix: 'src',
                    destPrefix: 'dist'

                },
                files:{ '':'' },
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: {},
                beautify: false,
                sourceMap: true
            },
            build: {
                files: {
                    'dist/Implement.min.js': 'dist/Implement.js'
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js'], // which files to watch
                tasks: ['build'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    // Load the plugin that provides the
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //tasks.
    grunt.registerTask('default', ['jshint', 'jasmine', 'bowercopy','uglify']);

    //grunt.registerTask('default', ['bowercopy', 'less', 'uglify', 'watch']);

    //grunt.registerTask('rebuild', ['bowercopy','less','uglify'])

};
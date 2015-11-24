var startTime = Date.now();

window.App = new Object();

DEBUG_SOCKET = false;
DEBUG_STATS = false;
DEBUG_LOGS = false;

// Limit the amount of datapoints to
// preserve memory (especially on mobile)
MAX_DATAPOINTS = 60;
DATASOURCES_PER_GRAPH = 8;

// Define libraries
require.config({
    baseUrl: 'resources/js/',
    waitSeconds: 200,
    paths: {
        jquery: '../dist/jquery/jquery',
        jqm: '../dist/jqm/js/jquery.mobile-1.4.5.min',
        text: '../dist/requirejs-text/text',
        ember: '../dist/ember/ember.prod',
        elv: '../dist/ember-legacy-views',
        templates: '../dist/templates',
        socket: '../dist/sockjs/sockjs.min',
        md5: '../dist/md5/build/md5.min',
        d3: '../dist/d3/d3.min',
        c3: '../dist/c3/c3.min',
        term: '../dist/term.js/src/term',
        init: 'init',
        common: 'common',
        multiplex: 'multiplex'
    },
    deps: ['jquery', 'common', 'init'],
    callback: function () {
        fontTest = $('#font-test')
        handleMobileInit();
        appLoader.init(LOADER_STEPS);
    },
    shim: {
        'ember': {
            deps: ['jquery']
        },
        'd3': {
            deps: ['jquery']
        },
        'c3': {
            deps: ['d3']
        }
    }
});

var LOADER_STEPS = {
    'load ember': {
        before: [],
        exec: function () {
            require(['ember'], function () {
                Ember.ENV._ENABLE_LEGACY_VIEW_SUPPORT = true;
                appLoader.complete('load ember');
            });
        },
    },
    'load files': {
        before: ['load ember'],
        exec: function () {
            loadFiles(function () {
                appLoader.buffer.files = Array.prototype.slice.call(arguments);
                appLoader.complete('load files');
            });
        }
    },
    'load images': {
        before: [],
        exec: function () {
            loadImages(function () {
                appLoader.complete('load images');
            });
        }
    },
    'load socket': {
        before: [],
        exec: function () {
            require(['socket'], function () {
                SockJS.websocket.roundTrips = 5;
                appLoader.complete('load socket');
            });
        }
    },
    'load multiplex': {
        before: [],
        exec: function () {
            require(['multiplex'], function () {
                appLoader.complete('load multiplex');
            });
        }
    },
    'load jqm': {
        before: ['load ember'],
        exec: function () {
            require(['jqm'], function () {
                appLoader.complete('load jqm');
            });
        }
    },
    'load templates': {
        before: ['load ember', 'load files'],
        exec: function () {
            //appLoader.buffer.files[0](function () {
                appLoader.complete('load templates');
            //});
        }
    },
    'init app': {
        before: ['load templates'],
        exec: function () {
            loadApp.apply(null, [function () {
                appLoader.complete('init app');
            }].concat(appLoader.buffer.files));
        }
    },
    'init connections': {
        before: ['load socket', 'load ember', 'init app'],
        exec: function () {
            Mist.set('ajax', Ajax(CSRF_TOKEN));
            Mist.set('main', new Socket({
                namespace: 'main',
                onConnect: function (socket) {
                    Mist.set('logs', new Socket({
                        namespace: 'logs'
                    }));
                },
            }));
            if (appLoader)
                appLoader.complete('init connections');
        }
    },
    'fetch first data': {
        before: ['init connections'],
        exec: function () {
            appLoader.complete('fetch first data');
        }
    }
};


var loadFiles = function (callback) {
    require([
        'templates',
        'app/controllers/cloud_add',
        'app/controllers/cloud_edit',
        'app/controllers/clouds',
        'app/controllers/cookies',
        'app/controllers/datasources',
        'app/controllers/dialog',
        'app/controllers/file_upload',
        'app/controllers/graphs',
        'app/controllers/images',
        'app/controllers/image_search',
        'app/controllers/key_add',
        'app/controllers/key_edit',
        'app/controllers/keys',
        'app/controllers/login',
        'app/controllers/logs',
        'app/controllers/machines',
        'app/controllers/machine_add',
        'app/controllers/machine_keys',
        'app/controllers/machine_power',
        'app/controllers/machine_edit',
        'app/controllers/machine_shell',
        'app/controllers/machine_tags',
        'app/controllers/machine_run_script',
        'app/controllers/metric_add',
        'app/controllers/metric_add_custom',
        'app/controllers/metrics',
        'app/controllers/monitoring',
        'app/controllers/network_create',
        'app/controllers/notification',
        'app/controllers/rule_edit',
        'app/controllers/rules',
        'app/controllers/script_add',
        'app/controllers/script_edit',
        'app/controllers/script_run',
        'app/controllers/scripts',

        'app/routes/image',
        'app/routes/images',
        'app/routes/index',
        'app/routes/key',
        'app/routes/keys',
        'app/routes/machine',
        'app/routes/machines',
        'app/routes/missing',
        'app/routes/network',
        'app/routes/networks',
        'app/routes/script',
        'app/routes/scripts',

        'app/views/home',
        'app/views/cloud_add',
        'app/views/cloud_button',
        'app/views/cloud_edit',
        'app/views/dialog',
        'app/views/file_upload',
        'app/views/graph_button',
        'app/views/graph_list',
        'app/views/graph_list_bar',
        'app/views/graph_list_control',
        'app/views/graph_list_item',
        'app/views/image',
        'app/views/image_list_item',
        'app/views/image_list',
        'app/views/ip_address_list_item',
        'app/views/key',
        'app/views/key_add',
        'app/views/key_edit',
        'app/views/key_list',
        'app/views/key_list_item',
        'app/views/log_list',
        'app/views/log_list_item',
        'app/views/login',
        'app/views/machine',
        'app/views/machine_add',
        'app/views/machine_keys',
        'app/views/machine_keys_list_item',
        'app/views/machine_list',
        'app/views/machine_list_item',
        'app/views/machine_monitoring',
        'app/views/machine_power',
        'app/views/machine_edit',
        'app/views/machine_shell',
        'app/views/machine_tags',
        'app/views/machine_tags_list_item',
        'app/views/machine_run_script',
        'app/views/messagebox',
        'app/views/metric_add',
        'app/views/metric_add_custom',
        'app/views/missing',
        'app/views/metric_node',
        'app/views/network',
        'app/views/network_create',
        'app/views/network_list',
        'app/views/network_list_item',
        'app/views/rule',
        'app/views/rule_edit',
        'app/views/rule_list',
        'app/views/script',
        'app/views/script_add',
        'app/views/script_edit',
        'app/views/script_list',
        'app/views/script_run',
        'app/views/script_list_item',
        'app/views/script_log_list',
        'app/views/subnet_list_item',
        'app/views/user_menu',

        'app/helpers/forIn'
    ], callback);
};

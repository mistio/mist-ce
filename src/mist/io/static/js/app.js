startTimer();
var a;
// Define libraries
require.config({
    baseUrl: 'resources/js/',
    waitSeconds: 200,
    paths: {
        text: 'lib/require/text',
        ember: 'lib/ember-1.5.1.min',
        jquery: 'lib/jquery-2.1.1.min',
        jqm: 'lib/jquery.mobile-1.4.2.min',
        handlebars: 'lib/handlebars-1.3.0.min',
        md5: 'lib/md5',
        d3: 'lib/d3.min',
        sha256: 'lib/sha256',
        socket: 'lib/socket.io',
        term: 'lib/term'
    },
    deps: ['jquery'],
    callback: function () {
        fontTest = $('#font-test')
        handleMobileInit();
        appLoader.init();
    },
    shim: {
        'ember': {
            deps: ['jquery', 'handlebars']
        },
        'd3': {
            deps: ['jquery']
        }
    }
});


//
//  Application Loader
//
//
//  Problem: Before hidding the splash screen (the black screen with the logo
//      that appears when the app loads) a series of steps must be completed.
//      Due to the many dependencies of mist.io and the serial loading
//      approach (all steps get executed one by one) the loading time skyrokets.
//
//
//  Solution: A parallel step execution mechanism. Each step gets executed
//      when only it's own dependencies (which are steps) are completed.
//
//
//  More info: Into the "appLoader" object are defined the steps that need
//      to be completed in order to hide the splash screen.
//
//      Every step defines an "exec" function which is called once all of the
//      steps in it's "before" array are executed and completed.
//


var appLoader = {


    //
    //
    //  Properties
    //
    //


    buffer: null,
    progress: null,
    progressStep: null,


    //
    //
    //  Initialization
    //
    //


    init: function () {
        this.buffer = {};
        this.progress = 0;
        this.progressStep = 100 / Object.keys(this.steps).length;
        this.start();
    },


    //
    //
    //  Methods
    //
    //


    start: function () {
        forIn(this.steps, function (step) {
            if (step.before.length == 0)
                step.exec();
        });
    },


    complete: function (completedStep) {

        // Update progress bar
        this.progress += this.progressStep;
        changeLoadProgress(Math.ceil(this.progress))

        // Update other steps
        forIn(this.steps, function (step, stepName) {

            // Check if "completedStep" is a dependency of "step"
            var index = step.before.indexOf(completedStep);

            if (index == -1) return;

            // Remove dependency from array
            step.before.splice(index, 1);

            // If "step" has no more dependencies, execute it
            if (step.before.length == 0)
                step.exec();
        });
    },


    finish: function () {

        // Clean up variables to save up some memory
        loadApp = null;
        loadFiles = null;
        loadImages = null;
        handleMobileInit = null;
        setupSocketEvents = null;
        changeLoadProgress = null;
        appLoader = null;

        info('Loaded in', getTime(), 'ms');
    },


    //
    //
    //  Steps
    //
    //


    steps: {
        'load ember': {
            before: [],
            exec: function () {
                require(['ember'], function () {
                    appLoader.complete('load ember');
                });
            },
        },
        'load files': {
            before: [],
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
                    appLoader.complete('load socket');
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
                appLoader.buffer.files[0](function () {
                    appLoader.complete('load templates');
                });
            }
        },
        'init app': {
            before: ['load templates'],
            exec: function () {
                loadApp.apply(null, appLoader.buffer.files.concat([function () {
                    appLoader.complete('init app');
                }]));
            }
        },
        'init connections': {
            before: ['load socket'],
            exec: function () {
                appLoader.buffer.ajax = Ajax(CSRF_TOKEN);
                appLoader.buffer.socket = Socket({
                    namespace: '/mist',
                    onInit: function () {
                        appLoader.complete('init connections');
                    },
                    onConnect: function (socket) {
                        if (!appLoader)
                            socket.emit('ready');
                    },
                });
            }
        },
        'init socket events': {
            before: ['init connections', 'init app'],
            exec: function () {
                Mist.set('ajax', appLoader.buffer.ajax);
                Mist.set('socket', appLoader.buffer.socket);
                appLoader.complete('init socket events');
            }
        },
        'fetch first data': {
            before: ['init socket events'],
            exec: function () {
                setupSocketEvents(Mist.socket, function () {
                    appLoader.complete('fetch first data');
                });
            }
        },
    }
};



var loadFiles = function (callback) {
    require([
        'app/templates/templates',
        'app/controllers/backend_add',
        'app/controllers/backend_edit',
        'app/controllers/backends',
        'app/controllers/confirmation',
        'app/controllers/cookies',
        'app/controllers/datasources',
        'app/controllers/dialog',
        'app/controllers/file_upload',
        'app/controllers/graphs',
        'app/controllers/image_search',
        'app/controllers/key_add',
        'app/controllers/key_edit',
        'app/controllers/keys',
        'app/controllers/login',
        'app/controllers/machine_add',
        'app/controllers/machine_keys',
        'app/controllers/machine_power',
        'app/controllers/machine_shell',
        'app/controllers/machine_tags',
        'app/controllers/metric_add',
        'app/controllers/metric_add_custom',
        'app/controllers/metrics',
        'app/controllers/monitoring',
        'app/controllers/network_create',
        'app/controllers/notification',
        'app/controllers/rule_edit',
        'app/controllers/rules',
        'app/views/backend_add',
        'app/views/backend_button',
        'app/views/backend_edit',
        'app/views/confirmation_dialog',
        'app/views/dialog',
        'app/views/file_upload',
        'app/views/graph_button',
        'app/views/graph_list',
        'app/views/graph_list_bar',
        'app/views/graph_list_control',
        'app/views/graph_list_item',
        'app/views/home',
        'app/views/image_list',
        'app/views/image_list_item',
        'app/views/key',
        'app/views/key_add',
        'app/views/key_edit',
        'app/views/key_list',
        'app/views/key_list_item',
        'app/views/login',
        'app/views/machine',
        'app/views/machine_add',
        'app/views/machine_keys',
        'app/views/machine_keys_list_item',
        'app/views/machine_list',
        'app/views/machine_list_item',
        'app/views/machine_monitoring',
        'app/views/machine_power',
        'app/views/machine_shell',
        'app/views/machine_tags',
        'app/views/machine_tags_list_item',
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
        'app/views/user_menu',
    ], callback);
};

var loadApp = function (
    TemplatesBuild,
    BackendAddController,
    BackendEditController,
    BackendsController,
    ConfirmationController,
    CookiesController,
    DatasourcesController,
    DialogController,
    FileUploadController,
    GraphsController,
    ImageSearchController,
    KeyAddController,
    KeyEditController,
    KeysController,
    LoginController,
    MachineAddController,
    MachineKeysController,
    MachinePowerController,
    MachineShellController,
    MachineTagsController,
    MetricAddController,
    MetricAddCustomController,
    MetricsController,
    MonitoringController,
    NetworkCreateController,
    NotificationController,
    RuleEditController,
    RulesController,
    BackendAdd,
    BackendButton,
    BackendEdit,
    ConfirmationDialog,
    DialogView,
    FileUploadView,
    GraphButtonView,
    GraphListView,
    GraphListBarView,
    GraphListControlView,
    GraphListItemView,
    Home,
    ImageListView,
    ImageListItem,
    SingleKeyView,
    KeyAddView,
    KeyEditDialog,
    KeyListView,
    KeyListItemView,
    LoginView,
    SingleMachineView,
    MachineAddDialog,
    MachineKeysView,
    MachineKeysListItemView,
    MachineListView,
    MachineListItem,
    MachineMonitoringView,
    MachinePowerView,
    MachineShellView,
    MachineTagsView,
    MachineTagsListItemView,
    MessageBoxView,
    MetricAddView,
    MetricAddCustomView,
    MissingView,
    MetricNodeView,
    NetworkView,
    NetworkCreateView,
    NetworkListView,
    NetworkListItemView,
    RuleView,
    RuleEditView,
    RuleListView,
    UserMenuView,
    callback) {

    // Hide error boxes on page unload
    window.onbeforeunload = function() {
        $('.ui-loader').hide();
    };

    // Ember Application
    App = Ember.Application.create({
        ready: callback
    });

    // Globals
    App.set('debugSocket', false);
    App.set('debugStats', false);
    App.set('isCore', !!IS_CORE);
    App.set('authenticated', AUTH || IS_CORE);
    App.set('email', EMAIL);
    App.set('password', '');
    App.set('isClientMobile',
        (/iPhone|iPod|iPad|Android|BlackBerry|Windows Phone/)
        .test(navigator.userAgent)
    );
    window.Mist = App;

    // Parse PROVIDER_MAP to generate template friendly fields
    forIn(PROVIDER_MAP, function (fields, title) {
        fields.forEach(function (field, index) {
            field = PROVIDER_MAP[title][index] = Ember.Object.create(field);
            field.value = field.defaultValue || '';
            if (field.type == 'text' ||
                field.type == 'password')
                field.isText = true;
            if (field.type == 'file')
                field.isFile = true;
            if (field.type == 'ssh_key')
                field.isKey = true;
            if (field.type == 'region')
                field.isRegion = true;
            if (field.optional)
                field.placeholder = '(optional)';
            if (!field.label)
                field.label = field.name.split('_').map(function (word) {
                    if (word == 'api' ||
                        word == 'url' ||
                        word == 'id')
                        return word.toUpperCase();
                    return word.capitalize()
                }).join(' ');
        });
    });

    // Ember routes and routers

    App.Router.map(function() {
        this.route('machines');
        this.route('images');
        this.route('networks');
        this.route('network', {
            path: '/networks/:network_id',
        });
        this.route('machine', {
            path : '/machines/:machine_id',
        });
        this.route('keys');
        this.route('key', {
            path : '/keys/:key_id'
        });
        this.route('missing', { path: "/*path" });
    });

    App.IndexRoute = Ember.Route.extend({
        activate: function () {
            Ember.run.next(function () {
                document.title = 'mist.io - home';
            });
        }
    });

    App.ImagesRoute = Ember.Route.extend({
        activate: function() {
            Ember.run.next(function() {
                document.title = 'mist.io - images';
            });
        }
    });

    App.NetworksRoute = Ember.Route.extend({
        activate: function () {
            Ember.run.next(function () {
                document.title = 'mist.io - networks';
            });
        },
        exit: function() {
            Mist.backendsController.forEach(function (backend) {
                backend.networks.forEach(function (network) {
                    network.set('selected', false);
                });
            });
        }
    });

    App.NetworkRoute = Ember.Route.extend({
        activate: function () {
            Ember.run.next(this, function () {
                var model = this.modelFor('network');
                var id = model._id || model.id;
                var network = Mist.backendsController.getNetwork(id);
                document.title = 'mist.io - ' + (network ? network.name : id);
            });
        },
        redirect: function (network) {
            Mist.backendsController.set('networkRequest', network._id);
        },
        model: function (args) {
            var id = args.network_id;
            if (Mist.backendsController.loading ||
                Mist.backendsController.loadingNetworks)
                    return {_id: id, backend: {}};
            return Mist.backendsController.getNetwork(id);
        }
    });


    App.MachinesRoute = Ember.Route.extend({
        activate: function() {
            Ember.run.next(function() {
                document.title = 'mist.io - machines';
            });
        },
        exit: function() {
            Mist.backendsController.forEach(function(backend) {
                backend.machines.forEach(function(machine) {
                    machine.set('selected', false);
                });
            });
        }
    });

    App.MachineRoute = Ember.Route.extend({
        activate: function () {
            Ember.run.next(this, function () {
                var model = this.modelFor('machine');
                var id = model._id || model.id;
                var machine = Mist.backendsController.getMachine(id);
                document.title = 'mist.io - ' + (machine ? machine.name : id);
            });
        },
        redirect: function (machine) {
            Mist.backendsController.set('machineRequest', machine._id);
        },
        model: function (args) {
            var id = args.machine_id;
            if (Mist.backendsController.loading ||
                Mist.backendsController.loadingMachines)
                    return {_id: id, backend: {}};
            return Mist.backendsController.getMachine(id);
        }
    });

    App.KeysRoute = Ember.Route.extend({
        activate: function () {
            Ember.run.next(function () {
                document.title = 'mist.io - keys';
            });
        },
        exit: function () {
            Mist.keysController.content.forEach(function (key) {
                 key.set('selected', false);
            });
        }
    });

    App.KeyRoute = Ember.Route.extend({
        activate: function () {
            Ember.run.next(this, function () {
                var model = this.modelFor('key');
                var id = model._id || model.id;
                var key = Mist.keysController.getKey(id);
                document.title = 'mist.io - ' + (key ? key.id : id);
            });
        },
        redirect: function (key) {
            Mist.keysController.set('keyRequest', key._id);
        },
        model: function (args) {
            var id = args.key_id;
            if (Mist.keysController.loading)
                return {_id: id, machines: []};
            return Mist.keysController.getKey(id);
        }
    });

    App.MissingRoute = Ember.Route.extend({
        activate: function () {
            Ember.run.next(function () {
                document.title = 'mist.io - 404';
            });
        },
    });

    // Ember views

    App.set('homeView', Home);
    App.set('ruleView', RuleView);
    App.set('loginView', LoginView);
    App.set('keyAddView', KeyAddView);
    App.set('keyView', SingleKeyView);
    App.set('missingView', MissingView);
    App.set('metricNodeView', MetricNodeView);
    App.set('keyListView', KeyListView);
    App.set('networkView', NetworkView);
    App.set('userMenuView', UserMenuView);
    App.set('keyEditView', KeyEditDialog);
    App.set('backendAddView', BackendAdd);
    App.set('ruleEditView', RuleEditView);
    App.set('metricAddView', MetricAddView);
    App.set('backendEditView', BackendEdit);
    App.set('imageListView', ImageListView);
    App.set('fileUploadView', FileUploadView);
    App.set('messageboxView', MessageBoxView);
    App.set('machineMonitoringView', MachineMonitoringView);
    App.set('machineView', SingleMachineView);
    App.set('graphListView', GraphListView);
    App.set('graphListBarView', GraphListBarView);
    App.set('graphListControlView', GraphListControlView);
    App.set('graphListItemView', GraphListItemView);
    App.set('networkCreateView', NetworkCreateView);
    App.set('networkListView', NetworkListView);
    App.set('machineKeysView', MachineKeysView);
    App.set('machineTagsView', MachineTagsView);
    App.set('keyListItemView', KeyListItemView);
    App.set('dialogView', DialogView);
    App.set('ruleListView', RuleListView);
    App.set('machineListView', MachineListView);
    App.set('imageListItemView', ImageListItem);
    App.set('machineAddView', MachineAddDialog);
    App.set('backendButtonView', BackendButton);
    App.set('graphButtonView', GraphButtonView);
    App.set('networkListItemView', NetworkListItemView);
    App.set('machinePowerView', MachinePowerView);
    App.set('machineShellView', MachineShellView);
    App.set('machineListItemView', MachineListItem);
    App.set('confirmationDialog', ConfirmationDialog);
    App.set('metricAddCustomView', MetricAddCustomView);
    App.set('machineKeysListItemView', MachineKeysListItemView);
    App.set('machineTagsListItemView', MachineTagsListItemView);

    // Ember controllers

    App.set('keysController', KeysController.create());
    App.set('loginController', LoginController.create());
    App.set('rulesController', RulesController.create());
    App.set('keyAddController', KeyAddController.create());
    App.set('metricsController', MetricsController.create());
    App.set('graphsController', GraphsController.create());
    App.set('keyEditController', KeyEditController.create());
    App.set('cookiesController', CookiesController.create());
    App.set('ruleEditController', RuleEditController.create());
    App.set('backendsController', BackendsController.create());
    App.set('metricAddController', MetricAddController.create());
    App.set('fileUploadController', FileUploadController.create());
    App.set('machineAddController', MachineAddController.create());
    App.set('backendAddController', BackendAddController.create());
    App.set('monitoringController', MonitoringController.create());
    App.set('backendEditController', BackendEditController.create());
    App.set('machineTagsController', MachineTagsController.create());
    App.set('machineKeysController', MachineKeysController.create());
    App.set('imageSearchController', ImageSearchController.create());
    App.set('datasourcesController', DatasourcesController.create());
    App.set('machineShellController', MachineShellController.create());
    App.set('confirmationController', ConfirmationController.create());
    App.set('notificationController', NotificationController.create());
    App.set('dialogController', DialogController.create());
    App.set('machinePowerController', MachinePowerController.create());
    App.set('networkCreateController', NetworkCreateController.create());
    App.set('metricAddCustomController', MetricAddCustomController.create());


    // Ember custom widgets

    App.Select = Ember.Select.extend({
        attributeBindings: [
            'name',
            'data-theme',
            'data-icon',
            'data-native-menu',
            'disabled'
        ]
    });
    App.TextArea = Ember.TextArea.extend({
        autocapitalize: 'off',
        attributeBindings: [
            'data-theme',
            'autocapitalize'
        ]
    });
    App.Checkbox = Ember.Checkbox.extend({
        attributeBindings: [
            'data-mini',
            'data-theme'
        ]
    });
    App.TextField = Ember.TextField.extend({
        autocapitalize: 'off',
        attributeBindings: [
            'data-theme',
            'placeholder',
            'autocapitalize'
        ],
        keyUp: function(e) {
            if(this.get('parentView').keyUp) {
                this.get('parentView').keyUp(e);
            }
        },
        click: function(e) {
            if(this.get('parentView').inputClicked) {
                this.get('parentView').inputClicked(e);
            }
        },
        focusIn: function(e) {
            if(this.get('parentView').inputClicked) {
                this.get('parentView').inputClicked(e);
            }
        }
    });

    // Mist functions

    App.prettyTime = function(date) {

        var showDate = false;
        if (date.getMonth() != new Date().getMonth()) {
            showDate = true;
            var day = date.getUTCDate();
            var month = date.getMonth();
        }

        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        return (showDate ? day + '/' + month + ' ': '') +
            (hour < 10 ? '0' : '') + hour + ':' +
            (min < 10 ? '0' : '') + min + ':' +
            (sec < 10 ? '0' : '') + sec;
    };

    App.getViewName = function (view) {
        return view.constructor.toString().split('.')[1].split('View')[0];
    };

    App.capitalize = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    App.decapitalize = function (string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    };

    App.capitalizeArray = function (array) {
        var newArray = [];
        array.forEach(function(string) {
            newArray.push(App.capitalize(string));
        });
        return newArray;
    };

    App.decapitalizeArray = function (array) {
        var newArray = [];
        array.forEach(function(string) {
            newArray.push(App.decapitalize(string));
        });
        return newArray;
    };

    App.isScrolledToBottom = function(){
        var distanceToTop = $(document).height() - $(window).height();
        var top = $(document).scrollTop();
        return distanceToTop - top < 20;
    };

    App.selectElementContents = function(elementId) {
        var el;
        if (elementId instanceof HTMLElement)
            el = elementId;
        else
            el = document.getElementById(elementId);
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    App.smoothScroll = function (scrollTo, timeout) {

        timeout = timeout || 100;

        var startingTop = $(window).scrollTop();

        var distance = Math.abs(startingTop - scrollTo);

        var scrollTimes;
        if (distance < 10)
            scrollTimes = 1;
        else if (distance < 100)
            scrollTimes = 10;
        else
            scrollTimes = 100;

        var scrollCounter = scrollTimes;
        var scrollInterval = timeout / scrollTimes;

        var scrollChunks = distance / scrollTimes;
        var sign = startingTop < scrollTo ? +1 : -1;

        function partialScroll () {
            if (Math.abs($(window).scrollTop() - scrollTo) < 10 ||
                scrollCounter == 0) {
                window.scrollTo(0, scrollTo);
            } else {
                scrollCounter--;
                window.scrollTo(0, $(window).scrollTop() + (sign * scrollChunks));
                setTimeout(function () {
                    partialScroll();
                }, scrollInterval);
            }
        };

        partialScroll();
    };

    App.switchElementVisibility = function(elementSelector) {
        var element = $('#' + elementSelector);
        if (element.css('display') == 'none')
            element.slideDown();
        else
            element.slideUp();
    };

    App.arrayToListString = function(array, attribute) {
        var listString = '';
        array.forEach(function(item, index) {
            listString += item[attribute];
            if (index < array.length - 1)
                listString += ', ';
        });
        return listString;
    };

    App.splitWords = function (string) {
        if (string.indexOf('-') > -1)
            return string.split('-');
        else if (string.indexOf('_') > -1)
            return string.split('_');
        else if (string.indexOf(' ') > -1)
            return string.split(' ');
        else if (string.match(/([a-z])([A-Z])/g)) {
            var wordJoints = string.match(/([a-z])([A-Z])/g);
            wordJoints.forEach(function(joint) {
                string = string.replace(joint, joint[0] + '_' + joint[1]);
            });
            return App.splitWords(string);
        }
        return [string];
    };
};



var loadImages = function (callback) {

    // Hardcode images not on the spritesheet,
    // including the spritesheet itself
    var images = [
        'resources/images/sprite-build/icon-sprite.png',
        'resources/images/ajax-loader.gif',
        'resources/images/spinner.gif',
    ];
    var remaining = images.length;

    // Load 'em!
    for (var i = 0; i < images.length; i++) {
        var img = new Image();
        img.onload = onImageLoad;
        img.src = images[i];
    }

    function onImageLoad () {
        if (--remaining == 0)
            callback();
    }
};


var handleMobileInit = function () {
    $(document).one('mobileinit', function() {
        $.mobile.ajaxEnabled = false;
        $.mobile.pushStateEnabled = false;
        $.mobile.linkBindingEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.ignoreContentEnabled = true;
        $.mobile.panel.prototype._bindUpdateLayout = function(){};
    });
};


var setupSocketEvents = function (socket, callback) {

    socket.on('list_keys', function (keys) {
        Mist.keysController.load(keys);
    })
    .on('list_backends', function (backends) {
        Mist.backendsController.load(backends);
        if (callback)
            callback();
        callback = null;
    })
    .on('list_sizes', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.sizes.load(data.sizes);
    })
    .on('list_images', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.images.load(data.images);
    })
    .on('list_machines', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.machines.load(data.machines);
    })
    .on('list_locations', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.locations.load(data.locations);
    })
    .on('list_networks', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.networks.load(data.networks);
    })
    .on('monitoring',function (data){
        Mist.monitoringController._updateMonitoringData(data);
        Mist.monitoringController.trigger('onMonitoringDataUpdate');
        Mist.backendsController.set('checkedMonitoring', true);
    })
    .on('stats', function (data) {
        Mist.graphsController._handleSocketResponse(data);
    })
    .on('notify', function (data){

        var dialogBody = [];

        // Extract machine information
        var machineId = data.machine_id;
        var backendId = data.backend_id;
        var machine = Mist.backendsController.getMachine(machineId, backendId);
        if (machine.id) {
            dialogBody.push({
                link: machine.name,
                class: 'ui-btn ui-btn-icon-right ui-icon-carat-r ui-mini ui-corner-all',
                href: '#/machines/' + machineId,
                closeDialog: true,
            });
        }

        // Get output
        if (data.output)
            dialogBody.push({
                command: data.output
            });

        // Get duration
        var duration = parseInt(data.duration);
        if (duration) {
            var durationMins = parseInt(duration / 60);
            var durationSecs = duration - (durationMins * 60);
            dialogBody.push({
                paragraph: 'Completed in ' + durationMins + 'min ' + durationSecs + ' sec',
                class: 'duration'
            });
        }

        Mist.dialogController.open({
            type: DIALOG_TYPES.OK,
            head: data.title,
            body: dialogBody
        });
    })
    .on('probe', onProbe)
    .on('ping', onProbe)
    .emit('ready');

    function onProbe(data) {
        var machine = Mist.backendsController.getMachine(data.machine_id, data.backend_id);
        if (machine)
            machine.probeSuccess(data.result);
    }
};


var changeLoadProgress = function (progress) {
    $('.mist-progress').animate({
        'width': progress + '%'
    }, 300, function () {
        if (progress >= 100) {
            $('body').css('overflow','auto');
            $('#splash').fadeOut(300);
            appLoader.finish();
        }
    });
};


//
//
//  Ajax wrapper
//
//


function Ajax (csrfToken) {

    return new function () {

        this.GET = function(url, data) {
            return this.ajax('GET', url, data);
        };
        this.PUT = function(url, data) {
            return this.ajax('PUT', url, data);
        };
        this.POST = function(url, data) {
            return this.ajax('POST', url, data);
        };
        this.DELETE = function(url, data) {
            return this.ajax('DELETE', url, data);
        };
        this.ajax = function(type, url, data) {

            var ret = {};
            var call = {};

            call.success = function(callback) {
                ret.success = callback;
                return call;
            };
            call.error = function(callback) {
                ret.error = callback;
                return call;
            };
            call.complete = function(callback) {
                ret.complete = callback;
                return call;
            };
            call.ajax = function() {

                var ajaxObject = {
                    url: url,
                    type: type,
                    headers: {
                        'Csrf-Token': csrfToken,
                        'Api-Version': 2,
                    },
                    complete: function(jqXHR) {
                        var success = (jqXHR.status == 200);
                        if (success && ret.success)
                            ret.success(jqXHR.responseJSON);
                        if (!success && ret.error)
                            ret.error(jqXHR.responseText, jqXHR.status);
                        if (ret.complete)
                            ret.complete(success, jqXHR.responseJSON);
                    }
                };

                if (data && Object.keys(data).length != 0)
                    ajaxObject.data = JSON.stringify(data)

                $.ajax(ajaxObject);

                return call;
            };
            return call.ajax();
        };
    }
};


//
//
//  Socket wrapper
//
//


function Socket (args) {

    var socket = undefined;
    var initialized = false;
    var namespace = args.namespace;

    function init () {
        if (!initialized) {
            info(namespace, 'initializing');
            handleDisconnection();
            addDebuggingWrapper();
            if (args.onInit instanceof Function)
                args.onInit(socket);
        }
        if (args.onConnect instanceof Function)
            args.onConnect(socket);
        initialized = true;
    };

    function connect () {

        if (socket === undefined) {
            socket = io.connect(namespace);
            reconnect();
        } else if (socket.socket.connected) {
            info(namespace, 'connected');
            init();
        } else if (socket.socket.connecting) {
            info(namespace, 'connecting');
            reconnect();
        } else {
            socket.socket.connect();
            reconnect();
        }
    }

    function reconnect () {
        setTimeout(connect, 500);
    }

    function handleDisconnection () {

        // keep socket connections alive by default
        if (args.keepAlive !== undefined ? args.keepAlive : true) {
            // Reconnect if connection fails
            socket.on('disconnect', function () {
                warn(namespace, 'disconnected');
                reconnect();
            });
        }
    }

    function addDebuggingWrapper () {

        // This process basically overrides the .on()
        // function to enable debugging info on every
        // response received by the client

        // 1. keep a copy of the original socket.on() function
        var sockon = socket.on;

        // 2. overide the socket's .on() function
        socket.on = function (event, callback)  {

            // i. keep a copy of the original callback
            // This is the function written by us to handle
            // the response data
            var cb = callback;

            // ii. overide callback to first print the debugging
            // information and then call the original callback function
            // (which is saved in cb variable)
            callback = function (data) {
                if (Mist.debugSocket)
                    info(Mist.prettyTime(new Date()) +
                        ' | ' + namespace + '/' + event + ' ', data);
                cb(data);
            };

            // iii. Call the original .on() function using the modified
            // callback function
            return sockon.apply(socket, arguments);
        };
    }

    connect();

    return socket;
}


function virtualKeyboardHeight () {
    var keyboardHeight = 0;

    if (!Mist.term) return 0;

    if (Mist.term.isIpad || Mist.term.isIphone){
        var sx = document.body.scrollLeft, sy = document.body.scrollTop;
        var naturalHeight = window.innerHeight;
        window.scrollTo(sx, document.body.scrollHeight);
        keyboardHeight = naturalHeight - window.innerHeight;
        window.scrollTo(sx, sy);
    } else if (Mist.term.isAndroid) {
        keyboardHeight = 0;
    }
    return keyboardHeight;
}


// forEach like function on objects
function forIn () {

    var object = arguments[arguments.length - 2];
    var callback = arguments[arguments.length - 1];
    var thisArg = arguments.length == 3 ? arguments[0] : undefined;

    if (!(object instanceof Object))
        return;

    var keys = Object.keys(object);
    var keysLength = keys.length;
    for (var i = 0; i < keysLength; i++)
        callback.call(thisArg, object[keys[i]], keys[i]);
}


// Calculates maximum chars that can be displayed into a fixed width
var fontTest;
function maxCharsInWidth (fontSize, width) {

    fontTest.css('font-size', fontSize);

    // Initialize testString to a number of chars that will "probably"
    // fit in width
    var textWidth = fontTest.text('t').width();
    var testString = Array(parseInt(width / textWidth) + 5).join('t');
    textWidth = fontTest.text(testString).width();

    for (var charCount = testString.length; textWidth > width; charCount--) {
        testString = testString.slice(1);
        textWidth = fontTest.text(testString).width();
    };
    return charCount;
}

// Calculates maximum lines that can be displayed into a fixed height
function maxLinesInHeight (fontSize, height) {

    fontTest.css('font-size', fontSize);

    var testString = '';
    var textHeight = 0
    for (var lineCount = 0; textHeight < height; lineCount++) {
        testString += '<div>t</div>';
        textHeight = fontTest.html(testString).height();
    };
    return lineCount;
}


function lockScroll(){
    $('body').data('y-scroll', self.pageYOffset)
             .css('overflow', 'hidden');
    window.scrollTo(null, self.pageYOffset);
}


function unlockScroll(){
      $('body').css('overflow', 'auto');
      window.scrollTo(null, $('body').data('y-scroll'))
}


// Simple timer tool for performance measurements
var startTime;
function startTimer () {
    startTime = Date.now();
};

function getTime () {
    return Date.now() - startTime;
};


// Console aliases
function log() {
    if (LOGLEVEL > 3)
        console.log.apply(console, arguments);
}

function info() {
    if (LOGLEVEL > 2)
        console.info.apply(console, arguments);
}

function warn() {
    if (LOGLEVEL > 1)
        console.warn.apply(console, arguments);
}

function error() {
    if (LOGLEVEL > 0)
        console.error.apply(console, arguments);
}

function resetFileInputField (element) {
    element.wrap('<form>').parent('form').trigger('reset');
    element.unwrap();
}

function getProviderFields (provider) {
    var providerFields = [];
    if (provider && provider.provider) {
        var providerTitle = provider.provider;
        forIn(PROVIDER_MAP, function (fields, title) {
            if (providerTitle.indexOf(title) > -1)
                providerFields = fields;
        });
    }
    return providerFields;
}

function clearProviderFields (provider) {
    getProviderFields(provider).forEach(function (field) {
        field.set('value', field.defaultValue || '');
    });
}

//  GLOBAL DEFINITIONS

var DISPLAYED_DATAPOINTS = 60;

var TIME_MAP = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
};

var DIALOG_TYPES = {
    OK: 0,
    OK_CANCEL: 1,
    YES_NO: 2,
    DONE_BACK: 3,
};


var PROVIDER_MAP = {

    azure: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Azure',
        },
        {
            name: 'subscription_id',
            type: 'text',
        },
        {
            name: 'certificate',
            type: 'file',
            label: 'Certificate file',
            buttonText: 'Add Certificate',
        }
    ],

    bare_metal: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Other Server',
        },
        {
            name: 'machine_ip',
            type: 'text',
            label: 'Hostname',
        },
        {
            name: 'machine_user',
            type: 'text',
            label: 'User',
            defaultValue: 'root',
        },
        {
            name: 'machine_port',
            type: 'text',
            label: 'Port',
            defaultValue: '22',
            optional: true,
        },
        {
            name: 'machine_key',
            type: 'ssh_key',
            label: 'SSH Key',
        }
    ],

    digitalocean: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'DigitalOcean',
        },
        {
            name: 'token',
            type: 'password',
        },
    ],

    docker: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Docker',
        },
        {
            name: 'docker_host',
            type: 'text',
            label: 'Host',
        },
        {
            name: 'docker_port',
            type: 'text',
            label: 'Port',
            optional: true,
            defaultValue: '4243',
        },
        {
            name: 'auth_user',
            type: 'text',
            label: 'BasicAuth User',
            optional: true,
        },
        {
            name: 'auth_password',
            type: 'password',
            label: 'BasicAuth Password',
            optional: true,
        }
    ],

    ec2: [
        {
            name: 'region',
            type: 'region',
        },
        {
            name: 'title',
            type: 'text',
            defaultValue: 'EC2',
        },
        {
            name: 'api_key',
            type: 'text',
        },
        {
            name: 'api_secret',
            type: 'password',
        }
    ],

    gce: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'GCE',
        },
        {
            name: 'email',
            type: 'text',
            label: 'Email address',
        },
        {
            name: 'private_key',
            type: 'file',
            buttonText: 'Add key',
        },
        {
            name: 'project_id',
            type: 'text',
        }
    ],

    hpcloud: [
        {
            name: 'region',
            type: 'region',
        },
        {
            name: 'title',
            type: 'text',
            defaultValue: 'HP',
        },
        {
            name: 'username',
            type: 'text',
        },
        {
            name: 'password',
            type: 'password',
        },
        {
            name: 'tenant_name',
            type: 'text',
        }
    ],

    linode: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Linode',
        },
        {
            name: 'api_key',
            type: 'text',
        }
    ],

    nephoscale: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Nephoscale',
        },
        {
            name: 'username',
            type: 'text',
        },
        {
            name: 'password',
            type: 'password',
        }
    ],

    openstack: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'OpenStack',
        },
        {
            name: 'username',
            type: 'text',
        },
        {
            name: 'password',
            type: 'password',
        },
        {
            name: 'auth_url',
            type: 'text',
        },
        {
            name: 'tenant_name',
            type: 'text',
        },
        {
            name: 'region',
            type: 'text',
            optional: true,
        },
    ],

    rackspace: [
        {
            name: 'region',
            type: 'region',
        },
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Rackspace',
        },
        {
            name: 'username',
            type: 'text',
        },
        {
            name: 'api_key',
            type: 'password',
        }
    ],

    softlayer: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'SoftLayer',
        },
        {
            name: 'username',
            type: 'text',
        },
        {
            name: 'api_key',
            type: 'password',
        }
    ],

    vcloud: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'VMware vCloud'
        },
        {
            name: 'username',
            type: 'text'
        },
        {
            name: 'password',
            type: 'password'
        },
        {
            name: 'host',
            type: 'text'
        }
    ]
};

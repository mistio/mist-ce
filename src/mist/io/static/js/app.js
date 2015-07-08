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
        text: 'lib/require/text',
        ember: 'lib/ember-1.6.0.min',
        common: 'lib/common',
        jquery: 'lib/jquery-2.1.1.min',
        jqm: 'lib/jquery.mobile-1.4.5.min',
        handlebars: 'lib/handlebars-1.3.0.min',
        md5: 'lib/md5',
        d3: 'lib/d3.min',
        socket: 'lib/sockjs.min',
        multiplex: 'lib/multiplex',
        c3: 'lib/c3.min',
        term: 'lib/term'
    },
    deps: ['jquery', 'common'],
    callback: function () {
        fontTest = $('#font-test')
        handleMobileInit();
        appLoader.init(LOADER_STEPS);
    },
    shim: {
        'ember': {
            deps: ['jquery', 'handlebars']
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
                extendEmberView();
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
            appLoader.buffer.files[0](function () {
                appLoader.complete('load templates');
            });
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
        'app/templates/templates',

        'app/controllers/backend_add',
        'app/controllers/backend_edit',
        'app/controllers/backends',
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
        'app/controllers/logs',
        'app/controllers/machine_add',
        'app/controllers/machine_keys',
        'app/controllers/machine_power',
        'app/controllers/machine_edit',
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
        'app/controllers/script_add',
        'app/controllers/script_edit',
        'app/controllers/script_run',
        'app/controllers/scripts',

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

        'app/views/backend_add',
        'app/views/backend_button',
        'app/views/backend_edit',
        'app/views/dialog',
        'app/views/file_upload',
        'app/views/graph_button',
        'app/views/graph_list',
        'app/views/graph_list_bar',
        'app/views/graph_list_control',
        'app/views/graph_list_item',
        'app/views/home',
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
    ], callback);
};

var loadApp = function (
    callback,
    TemplatesBuild,
    BackendAddController,
    BackendEditController,
    BackendsController,
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
    LogsController,
    MachineAddController,
    MachineKeysController,
    MachinePowerController,
    MachineEditController,
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
    ScriptAddController,
    ScriptEditController,
    ScriptRunController,
    ScriptsController) {

    // Hide error boxes on page unload
    window.onbeforeunload = function() {
        $('.ui-loader').hide();
    };

    // Ember Application
    App.ready = callback;
    App = Ember.Application.create(App);
    window.Mist  = App;

    // Globals
    App.set('betaFeatures', !!window.BETA_FEATURES);
    App.set('isCore', !!IS_CORE);
    App.set('authenticated', AUTH || IS_CORE);
    App.set('email', EMAIL);
    App.set('password', '');
    App.set('isClientMobile',
        (/iPhone|iPod|iPad|Android|BlackBerry|Windows Phone/)
        .test(navigator.userAgent)
    );

    parseProviderMap();

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
        this.route('scripts');
        this.route('script', {
            path : '/scripts/:script_id'
        });
        this.route('logs');
        this.route('missing', { path: "/*path" });
    });

    // Ember controllers
    App.set('keysController', KeysController.create());
    App.set('logsController', LogsController.create());
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
    App.set('notificationController', NotificationController.create());
    App.set('dialogController', DialogController.create());
    App.set('machinePowerController', MachinePowerController.create());
    App.set('machineEditController', MachineEditController.create());
    App.set('networkCreateController', NetworkCreateController.create());
    App.set('metricAddCustomController', MetricAddCustomController.create());
    App.set('scriptsController', ScriptsController.create());
    App.set('scriptAddController', ScriptAddController.create());
    App.set('scriptRunController', ScriptRunController.create());
    App.set('scriptEditController', ScriptEditController.create());

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
            'data-theme',
            'data-icon',
            'data-icon-position',
            'data-disabled'
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
    App.isScrolledToTop = function () {
        return window.pageYOffset <= 20;
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

    App.clock = Ember.Object.extend({
        init: function () {
            this._super();
            var that = this;
            setInterval(function () {
                that.tick();
            }, TIME_MAP.SECOND);
        },
        tick: function () {
            this.setProperties({
                second: new Date().getSeconds(),
                minute: new Date().getMinutes(),
                hour: new Date().getHours(),
            });
        }
    }).create();
};


var loadImages = function (callback) {
    // Spritesheet's name includes a timestamp each
    // time we generate it. So we use this "hack" to
    // get it's path and preload it
    var dummy = $('<div class="user"></div>').appendTo('body');
    var url = dummy.css('background-image')
    .split("(")[1] // remove "url()" wrapper
    .split(")")[0]
    .replace(/\"/g, ""); // remove extra quotes
    dummy.remove();
    // Hardcode images not on the spritesheet
    var images = [
        url,
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


var setupChannelEvents = function (socket, namespace, callback) {
    if (namespace == 'main')
        return setupMainChannel(socket, callback);
    else if (namespace == 'logs')
        return setupLogChannel(socket, callback);
    else if (namespace == 'shell')
      return setupShellChannel(socket, callback);
    else return callback();
};


var setupLogChannel = function (socket, callback) {
    socket.on('open_incidents', function (openIncidents) {
        require(['app/models/story'], function (StoryModel) {
            var models = openIncidents.map(function (incident) {
                return StoryModel.create(incident);
            });
            Mist.set('openIncidents', models);
        });
    }).on('closed_incidents', function (closedIncidents) {
        require(['app/models/story'], function (StoryModel) {
            var models = closedIncidents.map(function (incident) {
                return StoryModel.create(incident);
            });
            Mist.set('closedIncidents', models);
        });
    }).emit('ready');
    Mist.set('openIncidents', []);
    Mist.set('closedIncidents', [])
    if (callback)
        callback();
};


var setupShellChannel = function (socket, callback) {
    socket.firstData = true;
    socket.on('close', function (data) {
        warn(data);
        Mist.term.write('Connection closed by remote');
    }).on('shell_data', function (data) {
        Mist.term.write(data);
        if (socket.firstData) {
            $('.terminal').focus();
            socket.firstData = false;
        }
    });

    if (callback)
        callback();
};


var setupMainChannel = function(socket, callback) {
    if (Mist.isCore) {
        //  TODO: This is a temporary ajax-request to get the scripts.
        //  It should be converted into a "list_scripts" socket handler
        //  as soon as the backend supports it
        Mist.ajax.GET('/scripts').success(function (scripts) {
            Mist.scriptsController.setContent(scripts);
        });
    }

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
            backend.sizes.setContent(data.sizes);
    })
    .on('list_images', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.images.setContent(data.images);
    })
    .on('list_machines', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.machines.load(data.machines);
    })
    .on('list_locations', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.locations.setContent(data.locations);
    })
    .on('list_networks', function (data) {
        var backend = Mist.backendsController.getBackend(data.backend_id);
        if (backend)
            backend.networks.setContent(data.networks);
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

        if (!(data.title && data.body) && !data.machine_id) {
            var msg = data.title || data.body;
            Mist.notificationController.notify(msg);
            return;
        }

        var dialogBody = [];

        // Extract machine information
        var machineId = data.machine_id;
        var backendId = data.backend_id;
        var machine = Mist.backendsController.getMachine(machineId, backendId);

        if (machine && machine.id) {
            dialogBody.push({
                link: machine.name,
                class: 'ui-btn ui-btn-icon-right ui-mini ui-corner-all',
                href: '#/machines/' + machineId,
                closeDialog: true,
            });
        } else {
            warn('Machine not found', machineId, backendId);
            dialogBody.push({
                class: 'ui-btn ui-btn-icon-right ui-mini ui-corner-all',
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

function parseProviderMap () {
    // Parse PROVIDER_MAP to generate template friendly fields

    // Append nested fields into main array
    forIn(PROVIDER_MAP, function (fields, title) {
        fields.forEach(function (field, i1) {
            if (field.type == 'slider') {
                field.on.forEach(function (f, i2) {
                    f.className = 'on';
                    fields.splice(i1 + i2 + 1, 0, f);
                });
                field.off.forEach(function (f, i2) {
                    f.className = 'off';
                    fields.splice(i1 + i2 + 1, 0, f);
                });
            }
        });
    });

    forIn(PROVIDER_MAP, function (fields, title) {
        PROVIDER_MAP[title].className = 'provider-';
        PROVIDER_MAP[title].className += title == 'bare_metal' ?
            'baremetal' : title;
        fields.forEach(function (field, index) {
            field = PROVIDER_MAP[title][index] = Ember.Object.create(field);
            field.value = field.defaultValue || '';
            if (!field.showIf)
                field.show = true;
            if (field.type == 'slider')
                field.isSlider = true;
            if (field.type == 'text' ||
                field.type == 'password')
                field.isText = true;
            if (field.type == 'file')
                field.isFile = true;
            if (field.type == 'ssh_key')
                field.isKey = true;
            if (field.type == 'region')
                field.isRegion = true;
            if (field.type == 'checkbox')
                field.isCheckbox = true;
            if (!field.placeholder)
                field.placeholder = "";
            if (field.optional)
                field.placeholder += '(optional)';
            if (field.helpText)
                field.helpId = field.name + '_' + 'help';
            if (!field.label &&  field.name)
                field.label = field.name.split('_').map(function (word) {
                    if (word == 'api' ||
                        word == 'url' ||
                        word == 'id')
                            return word.toUpperCase();
                    return word.capitalize()
                }).join(' ');
        });
    });

    // Build dependencies
    forIn(PROVIDER_MAP, function (fields, title) {
        fields.forEach(function (field, index) {
            if (field.showIf) {
                field.set('showDependency', fields.findBy('name', field.showIf));
                var binding = Ember.Binding.from("showDependency.value").to("show");
                binding.connect(field);
            }
        });
    });
}

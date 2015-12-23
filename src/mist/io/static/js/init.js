var loadApp = function (
    callback,
    TemplatesBuild,
    CloudAddController,
    CloudEditController,
    CloudsController,
    CookiesController,
    DatasourcesController,
    DialogController,
    FileUploadController,
    GraphsController,
    ImagesController,
    ImageSearchController,
    KeyAddController,
    KeyEditController,
    KeysController,
    LoginController,
    LogsController,
    MachinesController,
    MachineAddController,
    MachineKeysController,
    MachinePowerController,
    MachineEditController,
    MachineShellController,
    MachineTagsController,
    MachineRunScriptController,
    MachineImageCreateController,
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
    ScriptsController,
    ProjectsController,
    HomeView) {

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
        this.route('image', {
            path: '/images/:image_id'
        });
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
    App.set('cloudsController', CloudsController.create());
    App.set('metricAddController', MetricAddController.create());
    App.set('fileUploadController', FileUploadController.create());
    App.set('machinesController', MachinesController.create());
    App.set('machineAddController', MachineAddController.create());
    App.set('cloudAddController', CloudAddController.create());
    App.set('monitoringController', MonitoringController.create());
    App.set('cloudEditController', CloudEditController.create());
    App.set('machineTagsController', MachineTagsController.create());
    App.set('machineKeysController', MachineKeysController.create());
    App.set('imagesController', ImagesController.create());
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
    App.set('projectsController', ProjectsController.create());
    App.set('machineRunScriptController', MachineRunScriptController.create());
    App.set('machineImageCreateController', MachineImageCreateController.create());


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
    info('setting up log channel');
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
    }).on('open_jobs', function (openJobs) {
        info('received open_jobs: ', openJobs);
    }).on('open_shells', function (openShells) {
        info('received open_shells: ', openShells);
    }).on('open_sessions', function(openSessions) {
        info('received open_sessions: ', openSessions);
    }).emit('ready');
    if (! Mist.isCore) {
        Mist.set('openIncidents', []);
    }    
    Mist.set('closedIncidents', [])

    if (callback)
        callback();
};


var setupShellChannel = function (socket, callback) {
    socket.firstData = true;
    socket.on('close', function (data) {
        info(data);
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
        //  as soon as the cloud supports it
        Mist.ajax.GET('/scripts').success(function (scripts) {
            Mist.scriptsController.setModel(scripts);
        });
    }

    socket.on('list_keys', function (keys) {
        Mist.keysController.load(keys);
    })
    .on('list_clouds', function (clouds) {
        Mist.cloudsController.load(clouds);
        Mist.cloudsController.set('loaded');
        if (callback)
            callback();
        callback = null;
    })
    .on('list_projects', function(data) {
        var cloud = Mist.cloudsController.getCloud(data.cloud_id);
        if (cloud)
            cloud.projects.setModel(data.projects);
    })
    .on('list_sizes', function (data) {
        var cloud = Mist.cloudsController.getCloud(data.cloud_id);
        if (cloud)
            cloud.sizes.setModel(data.sizes);
    })
    .on('list_images', function (data) {
        var cloud = Mist.cloudsController.getCloud(data.cloud_id);
        if (cloud)
            cloud.images.setModel(data.images);
    })
    .on('list_machines', function (data) {
        var cloud = Mist.cloudsController.getCloud(data.cloud_id);
        if (cloud)
            cloud.machines.load(data.machines);
    })
    .on('list_locations', function (data) {
        var cloud = Mist.cloudsController.getCloud(data.cloud_id);
        if (cloud)
            cloud.locations.setModel(data.locations);
    })
    .on('list_networks', function (data) {
        var cloud = Mist.cloudsController.getCloud(data.cloud_id);
        if (cloud) {
            var networks = [];
            networks.pushObjects(data.networks.public);
            networks.pushObjects(data.networks.private);
            cloud.networks.setModel(networks);
        }
    })
    .on('monitoring',function (data){
        Mist.monitoringController._updateMonitoringData(data);
        Mist.monitoringController.trigger('onMonitoringDataUpdate');
        Mist.cloudsController.set('checkedMonitoring', true);
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
        var cloudId = data.cloud_id;
        var machine = Mist.cloudsController.getMachine(machineId, cloudId);

        if (machine && machine.id) {
            dialogBody.push({
                link: machine.name,
                class: 'ui-btn ui-btn-d ui-shadow',
                href: '#/machines/' + machineId,
                closeDialog: true,
            });
        } else {
            warn('Machine not found', machineId, cloudId);
            dialogBody.push({
                class: 'ui-btn ui-btn-d ui-shadow',
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
        var machine = Mist.cloudsController.getMachine(data.machine_id, data.cloud_id);
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
            if (field.type == 'indonesianRegion')
                field.isIndonesianRegion = true;
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

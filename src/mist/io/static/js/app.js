// Define libraries
require.config({
    baseUrl: 'resources/js/',
    waitSeconds: 200,
    paths: {
        text: 'lib/require/text',
        ember: 'lib/ember-1.5.1.min',
        jquery: 'lib/jquery-2.1.1.min',
        mobile: 'lib/jquery.mobile-1.4.2.min',
        handlebars: 'lib/handlebars-1.3.0.min',
        md5: 'lib/md5',
        d3: 'lib/d3.min',
        sha256: 'lib/sha256',
    },
    shim: {
        'ember': {
            deps: ['handlebars', 'text', 'jquery', 'md5', 'sha256']
        },
        'd3': {
            deps: ['jquery']
        }
    }
});

// Load our app
define( 'app', [
    'jquery',
    'd3',
    'app/controllers/backend_add',
    'app/controllers/backend_edit',
    'app/controllers/backends',
    'app/controllers/confirmation',
    'app/controllers/file_upload',
    'app/controllers/image_search',
    'app/controllers/key_add',
    'app/controllers/key_edit',
    'app/controllers/keys',
    'app/controllers/login',
    'app/controllers/machine_add',
    'app/controllers/machine_keys',
    'app/controllers/machine_manual_monitoring',
    'app/controllers/machine_power',
    'app/controllers/machine_shell',
    'app/controllers/machine_tags',
    'app/controllers/metric_add',
    'app/controllers/metric_add_custom',
    'app/controllers/metrics',
    'app/controllers/monitoring',
    'app/controllers/notification',
    'app/controllers/rule_edit',
    'app/controllers/rules',
    'app/templates/templates',
    'app/views/backend_add',
    'app/views/backend_button',
    'app/views/backend_edit',
    'app/views/confirmation_dialog',
    'app/views/file_upload',
    'app/views/graph',
    'app/views/graph_button',
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
    'app/views/machine_manual_monitoring',
    'app/views/machine_power',
    'app/views/machine_shell',
    'app/views/machine_shell_list_item',
    'app/views/machine_tags',
    'app/views/machine_tags_list_item',
    'app/views/messagebox',
    'app/views/metric_add',
    'app/views/metric_add_custom',
    'app/views/metric_node',
    'app/views/monitoring',
    'app/views/rule',
    'app/views/rule_edit',
    'app/views/user_menu',
    'ember'
], function($,
    d3,
    BackendAddController,
    BackendEditController,
    BackendsController,
    ConfirmationController,
    FileUploadController,
    ImageSearchController,
    KeyAddController,
    KeyEditController,
    KeysController,
    LoginController,
    MachineAddController,
    MachineKeysController,
    MachineManualMonitoringController,
    MachinePowerController,
    MachineShellController,
    MachineTagsController,
    MetricAddController,
    MetricAddCustomController,
    MetricsController,
    MonitoringController,
    NotificationController,
    RuleEditController,
    RulesController,
    TemplatesBuild,
    BackendAdd,
    BackendButton,
    BackendEdit,
    ConfirmationDialog,
    FileUploadView,
    GraphView,
    GraphButtonView,
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
    MachineManualMonitoringView,
    MachinePowerView,
    MachineShellView,
    MachineShellListItemView,
    MachineTagsView,
    MachineTagsListItemView,
    MessageBoxView,
    MetricAddView,
    MetricAddCustomView,
    MetricNodeView,
    MonitoringView,
    RuleView,
    RuleEditView,
    UserMenuView) {

    function initialize() {


        // JQM init event

        $(document).bind('mobileinit', function() {
            $('#splash').fadeOut(650);
            $.mobile.ajaxEnabled = false;
            $.mobile.pushStateEnabled = false;
            $.mobile.linkBindingEnabled = false;
            $.mobile.hashListeningEnabled = false;
            $.mobile.ignoreContentEnabled = true;
            $.mobile.panel.prototype._bindUpdateLayout = function(){};
            $('body').css('overflow','auto');

            App.set('isJQMInitialized',true);
        });


        // Hide error boxes on page unload

        window.onbeforeunload = function() {
            $('.ui-loader').hide();
        };


        // Ember Application

        App = Ember.Application.create({
            ready: function() {
                require(['mobile']);
            }
        });


        // Globals

        App.set('isCore', !!IS_CORE);
        App.set('authenticated', AUTH || IS_CORE);
        App.set('ajax', new AJAX(CSRF_TOKEN));
        App.set('email', EMAIL);
        App.set('password', '');
        App.set('isClientMobile', (/iPhone|iPod|iPad|Android|BlackBerry|Windows Phone/).test(navigator.userAgent) );
        App.set('isJQMInitialized', false);
        window.Mist = App;

        CSRF_TOKEN = null;

        // Ember routes and routers

        App.Router.map(function() {
            this.route('machines');
            this.route('images');
            this.route('machine', {
                path : '/machines/:machine_id',
            });
            this.route('keys');
            this.route('key', {
                path : '/keys/:key_id'
            });
        });

        App.ImagesRoute = Ember.Route.extend({
            activate: function() {
                Ember.run.next(function() {
                    document.title = 'mist.io - images';
                });
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
            activate: function() {
                Ember.run.next(function() {
                    var id = Mist.getMachineIdByUrl();
                    var machine = Mist.backendsController.getMachine(id);
                    document.title = 'mist.io - ' + (machine ? machine.name : id);
                });
            },
            redirect: function() {
                Mist.backendsController.set('machineRequest', Mist.getMachineIdByUrl());
            },
            model: function() {
                if (Mist.backendsController.loading || Mist.backendsController.loadingMachines) {
                    return {id: '', backend: {}};
                }
                return Mist.backendsController.getMachine(Mist.getMachineIdByUrl());
            }
        });

        App.KeysRoute = Ember.Route.extend({
            activate: function() {
                Ember.run.next(function() {
                    document.title = 'mist.io - keys';
                });
            },
            exit: function() {
                Mist.keysController.content.forEach(function(key){
                     key.set('selected', false);
                });
            }
        });

        App.KeyRoute = Ember.Route.extend({
            activate: function() {
                Ember.run.next(function() {
                    document.title = 'mist.io - ' + Mist.getKeyIdByUrl();
                });
            },
            redirect: function() {
                Mist.keysController.set('keyRequest', Mist.getKeyIdByUrl());
            },
            model: function() {
                if (Mist.keysController.loading) {
                    return {machines: []};
                }
                return Mist.keysController.getKey(Mist.getKeyIdByUrl());
            }
        });

        // Ember views

        App.set('homeView', Home);
        App.set('ruleView', RuleView);
        App.set('graphView', GraphView);
        App.set('loginView', LoginView);
        App.set('keyAddView', KeyAddView);
        App.set('keyView', SingleKeyView);
        App.set('metricNodeView', MetricNodeView);
        App.set('keyListView', KeyListView);
        App.set('userMenuView', UserMenuView);
        App.set('keyEditView', KeyEditDialog);
        App.set('backendAddView', BackendAdd);
        App.set('ruleEditView', RuleEditView);
        App.set('metricAddView', MetricAddView);
        App.set('backendEditView', BackendEdit);
        App.set('imageListView', ImageListView);
        App.set('fileUploadView', FileUploadView);
        App.set('messageboxView', MessageBoxView);
        App.set('monitoringView', MonitoringView);
        App.set('machineView', SingleMachineView);
        App.set('machineKeysView', MachineKeysView);
        App.set('machineTagsView', MachineTagsView);
        App.set('keyListItemView', KeyListItemView);
        App.set('machineListView', MachineListView);
        App.set('imageListItemView', ImageListItem);
        App.set('machineAddView', MachineAddDialog);
        App.set('backendButtonView', BackendButton);
        App.set('graphButtonView', GraphButtonView);
        App.set('machinePowerView', MachinePowerView);
        App.set('machineShellView', MachineShellView);
        App.set('machineListItemView', MachineListItem);
        App.set('confirmationDialog', ConfirmationDialog);
        App.set('metricAddCustomView', MetricAddCustomView);
        App.set('machineKeysListItemView', MachineKeysListItemView);
        App.set('machineTagsListItemView', MachineTagsListItemView);
        App.set('machineShellListItemView', MachineShellListItemView);
        App.set('machineManualMonitoringView', MachineManualMonitoringView);

        // Ember controllers

        App.set('keysController', KeysController.create());
        App.set('loginController', LoginController.create());
        App.set('rulesController', RulesController.create());
        App.set('keyAddController', KeyAddController.create());
        App.set('metricsController', MetricsController.create());
        App.set('keyEditController', KeyEditController.create());
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
        App.set('machineShellController', MachineShellController.create());
        App.set('confirmationController', ConfirmationController.create());
        App.set('notificationController', NotificationController.create());
        App.set('machinePowerController', MachinePowerController.create());
        App.set('metricAddCustomController', MetricAddCustomController.create());
        App.set('machineManualMonitoringController', MachineManualMonitoringController.create());

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

        App.Checkbox = Ember.Checkbox.extend({
            attributeBindings: [
                'data-mini'
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
        App.ShellTextField = App.TextField.extend({

            keyDown: function(event, view) {
                var keyCode = event.keyCode;
                var commandHistoryIndex = Mist.machineShellController.commandHistoryIndex;
                var commandHistory = Mist.machineShellController.machine.commandHistory;
                switch (keyCode) {
                    case 38: // Up
                        if (commandHistoryIndex < commandHistory.length - 1) {
                            commandHistoryIndex++;
                        }
                        Mist.machineShellController.set('command', commandHistory[commandHistoryIndex].command);
                        Mist.machineShellController.set('commandHistoryIndex', commandHistoryIndex);
                        break;
                    case 40: // Down
                        if (commandHistoryIndex >= 0) {
                            commandHistoryIndex--;
                        }
                        if (commandHistoryIndex >= 0) {
                            Mist.machineShellController.set('command', commandHistory[commandHistoryIndex].command);
                        } else if (commandHistoryIndex == -1) {
                            Mist.machineShellController.set('command', '');
                        }
                        Mist.machineShellController.set('commandHistoryIndex', commandHistoryIndex);
                        break;
                    case 13: // Enter
                        Mist.machineShellController.submit();
                        break;
                }
                if (keyCode == 38 || keyCode == 40 && event.preventDefault) // Up or Down
                    event.preventDefault();
            }
        });

        // Mist functions

        App.getKeyIdByUrl = function() {
            return window.location.href.split('/')[5];
        };

        App.getMachineIdByUrl = function() {
            return window.location.href.split('/')[5];
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
            var distanceToTop = $(document).height() - $(window).height()
            var top = $(document).scrollTop();
            return distanceToTop - top < 20;
        };

        App.selectElementContents = function(elementId) {
            var el = document.getElementById(elementId);
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

        return App;
    }


    /**
     *
     *  Ajax wrapper constructor
     *
     */

    function AJAX (csrfToken) {

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
                    },
                    data: JSON.stringify(data),
                    complete: function(jqXHR) {
                        if (jqXHR.status == 200) {
                            if (ret.success)
                                ret.success(jqXHR.responseJSON);
                        } else if (ret.error) {
                            ret.error(jqXHR.responseText, jqXHR.status);
                        }
                        if (ret.complete)
                            ret.complete(jqXHR.status == 200, jqXHR.responseJSON);
                    }
                };

                if (Object.keys(data).length === 0) {
                    delete ajaxObject.data;
                }

                $.ajax(ajaxObject);

                return call;
            };
            return call.ajax();
        };
    }


    var allImgs = [],
        imgUrls = [],
        thisSheetRules;

    function parseCSS(sheets, urls) {
        var w3cImport = false,
            imported = [],
            importedSrc = [],
            baseURL;
        var sheetIndex = sheets.length;
        while(sheetIndex--){//loop through each stylesheet

            var cssPile = '';//create large string of all css rules in sheet

            if(urls && urls[sheetIndex]){
                baseURL = urls[sheetIndex];
            } else {
                var csshref = (sheets[sheetIndex].href) ? sheets[sheetIndex].href : 'window.location.href';
                var baseURLarr = csshref.split('/');//split href at / to make array
                baseURLarr.pop();//remove file path from baseURL array
                baseURL = baseURLarr.join('/');//create base url for the images in this sheet (css file's dir)
                if (baseURL) {
                    baseURL += '/'; //tack on a / if needed
                }
            }
            if(sheets[sheetIndex].cssRules || sheets[sheetIndex].rules){
                thisSheetRules = (sheets[sheetIndex].cssRules) ? //->>> http://www.quirksmode.org/dom/w3c_css.html
                    sheets[sheetIndex].cssRules : //w3
                    sheets[sheetIndex].rules; //ie
                var ruleIndex = thisSheetRules.length;
                while(ruleIndex--){
                    if(thisSheetRules[ruleIndex].style && thisSheetRules[ruleIndex].style.cssText){
                        var text = thisSheetRules[ruleIndex].style.cssText;
                        if(text.toLowerCase().indexOf('url') != -1){ // only add rules to the string if you can assume, to find an image, speed improvement
                            cssPile += text; // thisSheetRules[ruleIndex].style.cssText instead of thisSheetRules[ruleIndex].cssText is a huge speed improvement
                        }
                    } else if(thisSheetRules[ruleIndex].styleSheet) {
                        imported.push(thisSheetRules[ruleIndex].styleSheet);
                        w3cImport = true;
                    }

                }
            }
            //parse cssPile for image urls
            var tmpImage = cssPile.match(/[^\("]+\.(gif|jpg|jpeg|png)/g);//reg ex to get a string of between a "(" and a ".filename" / '"' for opera-bugfix
            if(tmpImage){
                var i = tmpImage.length;
                while(i--){ // handle baseUrl here for multiple stylesheets in different folders bug
                    var imgSrc = (tmpImage[i].charAt(0) == '/' || tmpImage[i].match('://')) ? // protocol-bug fixed
                        tmpImage[i] :
                        baseURL + tmpImage[i];

                    if(jQuery.inArray(imgSrc, imgUrls) == -1){
                        imgUrls.push(imgSrc);
                    }
                }
            }

            if(!w3cImport && sheets[sheetIndex].imports && sheets[sheetIndex].imports.length) {
                for(var iImport = 0, importLen = sheets[sheetIndex].imports.length; iImport < importLen; iImport++){
                    var iHref = sheets[sheetIndex].imports[iImport].href;
                    iHref = iHref.split('/');
                    iHref.pop();
                    iHref = iHref.join('/');
                    if (iHref) {
                        iHref += '/'; //tack on a / if needed
                    }
                    var iSrc = (iHref.charAt(0) == '/' || iHref.match('://')) ? // protocol-bug fixed
                        iHref :
                        baseURL + iHref;

                    importedSrc.push(iSrc);
                    imported.push(sheets[sheetIndex].imports[iImport]);
                }


            }
        }//loop
        if(imported.length){
            parseCSS(imported, importedSrc);
            return false;
        }
    }

    function preloadImages(callback) {
        var imgs = [];
        parseCSS([document.styleSheets[0]]);
        var img;
        var remaining = imgUrls.length;
        for (var i = 0; i < imgUrls.length; i++) {
            img = new Image();
            img.onload = function() {
                --remaining;
                if (remaining <= 0) {
                    callback();
                }
            };
            img.src = imgUrls[i];
            imgs.push(img);
        }
    }

    preloadImages(initialize);
});

//LOGLEVEL comes from home python view and home.pt
function log() {
    try {
        if (LOGLEVEL > 3) {
            return console.log.apply(console, arguments);
        }
    } catch(err) {console.log(err);}
}

function info() {
    try {
        if (LOGLEVEL > 2) {
            return console.info.apply(console, arguments);
        }
    } catch(err) {console.log(err);}
}

function warn() {
    try {
        if (LOGLEVEL > 1) {
            return console.warn.apply(console, arguments);
        }
    } catch(err) {console.log(err);}
}

function error() {
    try {
        if (LOGLEVEL > 0) {
            return console.error.apply(console, arguments);
        }
    } catch(err) {console.log(err);}
}


function appendShell(output, command_id) {

    var machine = Mist.machineShellController.machine;

    if (!machine) return;

    var command = machine.commandHistory.findBy('id', command_id);

    if (!command) return;

    // Replace break with new line
    var output = output.trim().replace('<br/>', String.fromCharCode(13));

    if (output.length)
        warn(Date() + ': ' + output);

    command.set('response', command.response + output);
    Ember.run.next(function(){
        $('.output').scrollTop(1000000);
    });
}

function completeShell(ret, command_id) {
    $('iframe#' + command_id).remove();
    Mist.machineShellController.machine.commandHistory.findBy('id', command_id).set('pendingResponse', false);
}

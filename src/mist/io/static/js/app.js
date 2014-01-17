// Define libraries
require.config({
    baseUrl: 'resources/js/',
    waitSeconds: 200,
    paths: {
        mocha: 'lib/mocha-1.4.2',
        chai: 'lib/chai-1.2.0',
        jquery: 'lib/jquery-1.10.2',
        text: 'lib/require/text',
        mobile: 'lib/jquery.mobile-1.4.0-rc.1',
        ember: 'lib/ember-1.1.2',
        handlebars: 'lib/handlebars-1.0.0',
        d3: 'lib/d3-2.10.1',
        md5: 'lib/md5',
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
    'app/controllers/login',
    'app/controllers/backends',
    'app/controllers/confirmation',
    'app/controllers/notification',
    'app/controllers/backend_add',
    'app/controllers/backend_edit',
    'app/controllers/machine_add',
    'app/controllers/machine_keys',
    'app/controllers/machine_power',
    'app/controllers/monitoring',
    'app/controllers/key_add',
    'app/controllers/key_edit',
    'app/controllers/keys',
    'app/controllers/machine_tags',
    'app/controllers/rules',
    'app/views/home',
    'app/views/login',
    'app/views/backend_button',
    'app/views/backend_add',
    'app/views/backend_edit',
    'app/views/monitoring',
    'app/views/machine_list_item',
    'app/views/image_list_item',
    'app/views/machine_add_dialog',
    'app/views/machine',
    'app/views/machine_list',
    'app/views/confirmation_dialog',
    'app/views/shell',
    'app/views/image_list',
    'app/views/machine_power',
    'app/views/machine_tags',
    'app/views/machine_keys',
    'app/views/machine_keys_list_item',
    'app/views/machine_tags_list_item',
    'app/views/key_list_item',
    'app/views/key_list',
    'app/views/key',
    'app/views/key_add_dialog',
    'app/views/key_edit_dialog',
    'app/views/rule',
    'app/views/user_menu',
    'app/views/list_item',
    'ember'
    ], function($,
                d3,
                LoginController,
                BackendsController,
                ConfirmationController,
                NotificationController,
                BackendAddController,
                BackendEditController,
                MachineAddController,
                MachineKeysController,
                MachinePowerController,
                MonitoringController,
                KeyAddController,
                KeyEditController,
                KeysController,
                MachineTagsController,
                RulesController,
                Home,
                LoginView,
                BackendButton,
                BackendAdd,
                EditBackend,
                MonitoringView,
                MachineListItem,
                ImageListItem,
                MachineAddDialog,
                SingleMachineView,
                MachineListView,
                ConfirmationDialog,
                ShellView,
                ImageListView,
                MachinePowerView,
                MachineTagsView,
                MachineKeysView,
                MachineKeysListItemView,
                MachineTagsListItemView,
                KeyListItemView,
                KeyListView,
                SingleKeyView,
                KeyAddDialog,
                KeyEditDialog,
                RuleView,
                UserMenuView,
                ListItemView
                ) {

    function initialize() {

        // JQM init event

        $(document).bind('mobileinit', function() {
            $('#splash').fadeOut(650);
            $.mobile.ajaxEnabled = false;
            $.mobile.pushStateEnabled = false;
            $.mobile.linkBindingEnabled = false;
            $.mobile.hashListeningEnabled = false;
            $.mobile.panel.prototype._bindUpdateLayout = function(){};
            $('body').css('overflow','auto');
        });

        // Ember Application

        App = Ember.Application.create({
            ready: function() {
                require(['mobile']);
            }
        });

        // Globals

        App.set('isCore', IS_CORE);
        App.set('authenticated', AUTH || IS_CORE);
        App.set('ajax', new AJAX('')); // TODO: Get CSRF_TOKEN from server
        App.set('email', EMAIL);
        App.set('password', '');
        window.Mist = App;

        //URL_PREFIX = AUTH = EMAIL = IS_CORE = CSRF_TOKEN '';

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
                    return {id: ''};
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
        App.set('loginView', LoginView);
        App.set('shellView', ShellView);
        App.set('keyListView', KeyListView);
        App.set('addKeyView', KeyAddDialog);
        App.set('listItemView', ListItemView);
        App.set('backendAddView', BackendAdd);
        App.set('userMenuView', UserMenuView);
        App.set('editKeyView', KeyEditDialog);
        App.set('editBackendView', EditBackend);
        App.set('imageListView', ImageListView);
        App.set('singleKeyView', SingleKeyView);
        App.set('monitoringView', MonitoringView);
        App.set('machineKeysView', MachineKeysView);
        App.set('machineTagsView', MachineTagsView);
        App.set('keyListItemView', KeyListItemView);
        App.set('machineListView', MachineListView);
        App.set('imageListItemView', ImageListItem);
        App.set('machineAddView', MachineAddDialog);
        App.set('backendButtonView', BackendButton);
        App.set('machinePowerView', MachinePowerView);
        App.set('machineListItemView', MachineListItem);
        App.set('singleMachineView', SingleMachineView);
        App.set('confirmationDialog', ConfirmationDialog);
        App.set('machineKeysListItemView', MachineKeysListItemView);
        App.set('machineTagsListItemView', MachineTagsListItemView);

        // Ember controllers

        App.set('keysController', KeysController.create());
        App.set('loginController', LoginController.create());
        App.set('rulesController', RulesController.create());
        App.set('keyAddController', KeyAddController.create());
        App.set('keyEditController', KeyEditController.create());        
        App.set('backendsController', BackendsController.create());
        App.set('monitoringController', MonitoringController.create());
        App.set('machineAddController', MachineAddController.create());
        App.set('backendAddController', BackendAddController.create());
        App.set('backendEditController', BackendEditController.create());
        App.set('machineTagsController', MachineTagsController.create());
        App.set('machineKeysController', MachineKeysController.create());
        App.set('confirmationController', ConfirmationController.create());
        App.set('notificationController', NotificationController.create());
        App.set('machinePowerController', MachinePowerController.create());

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

        App.Checkbox = Ember.Checkbox;
        App.TextField = Ember.TextField;
        App.ShellTextField = Ember.TextField.extend({

            insertNewline: function() {
                this._parentView.submit();
            },

            keyDown: function(event, view) {
                var parent = this._parentView;
                var inputField = '.shell-input div.ui-input-text input';
                if (event.keyCode == 38 ) { // Up Key
                    if (parent.commandHistoryIndex > -1) {
                        if (parent.commandHistoryIndex > 0) {
                            parent.commandHistoryIndex--;
                        }
                        $(inputField).val(parent.commandHistory[parent.commandHistoryIndex]);
                    }
                } else if (event.keyCode == 40) { // Down key
                    if (parent.commandHistoryIndex < parent.commandHistory.length) {
                        if (parent.commandHistoryIndex < parent.commandHistory.length - 1) {
                            parent.commandHistoryIndex++;
                        }
                        $(inputField).val(parent.commandHistory[parent.commandHistoryIndex]);
                    }
                } else if (event.keyCode == 13) { // Enter key
                    this._parentView.submit();
                } else if (event.keyCode == 1) {
                    $('.shell-input input').focus();
                } else if (event.keyCode == 9) { // Tab key
                    // TODO: Autocomplete stuff...
                } else { 
                    Ember.run.next(function(){
                        parent.commandHistory[parent.commandHistoryIndex] = parent.command;
                    });
                }
                if (event.keyCode == 38 || event.keyCode == 40 || event.keycode == 9) { // Up or Down or Tab
                    if(event.preventDefault) {
                        event.preventDefault();
                    }
                }
            }
        });

        // Mist functions

        App.isScrolledToBottom = function() {
            var page = $('.ui-page');
            var content = $('.ui-content').eq(0);
            return content.height() - page.height() - page.scrollTop() < 50;
        };

        App.getKeyIdByUrl = function() {
            return window.location.href.split('/')[5];
        };

        App.getMachineIdByUrl = function() {
            return window.location.href.split('/')[5];
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

                if (type != 'GET') {
                    if (data) { data.csrf_token = csrfToken; }
                    else { data = {'csrf_token': csrfToken}; }
                }

                $.ajax({
                    url: url,
                    type: type,
                    data: JSON.stringify(data),
                    complete: function(jqXHR) {
                        if (jqXHR.status == 200) {
                            if (ret.success)
                                ret.success(jqXHR.responseJSON);
                        } else if (ret.error) {
                            ret.error(jqXHR.responseText);
                        }
                        if (ret.complete)
                            ret.complete(jqXHR.status == 200, jqXHR.responseJSON);
                    }
                });
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
        parseCSS(document.styleSheets);
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

var collectd_install_target = false, collectd_uninstall_target = false, collectd_lastlog="";

function appendShell(data){
    var line = data.trim();

    if (data.length){
        warn(Date() + ': ' + data);
    }

    if (collectd_install_target) {
        if (line != '<br/>') {
            collectd_lastlog = line;
        }
        // TODO: display collectd install output
    } else if (collectd_uninstall_target){
        if (line != '<br/>') {
            collectd_lastlog = line;
        }
        // TODO: display collectd uninstall output
    } else {
        var target_page = $($.mobile.activePage);
        var output = target_page.find('.shell-return .output').first();
        if (data.length) {
            output.append(data);
            output.scrollTop(10000);
        } else {
            that.set('pendingShell', false);
            target_page.find('.shell-return .pending').removeClass('pending');
        }
    }
}

function completeShell(ret){
    $('iframe').remove();
    // TODO disabling this for now, spinners won't work, globals are not there
    //Mist.machine.set('pendingShell', false);
    $('.shell-return .pending').removeClass('pending');
    $('a.shell-send').removeClass('ui-disabled');
    if (collectd_install_target) {
        if (collectd_lastlog.search('root') == -1) {
            // TODO: display instruction for manual installation
            // alert('collectd install failed');
        }
        setTimeout(function(){
            collectd_install_target.set('hasMonitoring', true);
            collectd_install_target.set('pendingMonitoring', false);
            $('.pending-monitoring h1').text('Enabling monitoring');
            collectd_install_target = false;
        }, 10000);
    } else if (collectd_uninstall_target) {
        collectd_uninstall_target.set('hasMonitoring', false);
        collectd_uninstall_target.set('pendingMonitoring', false);
        $('.pending-monitoring h1').text('Enabling monitoring');
        collectd_uninstall_target = false;
    }
    $('body').append('<iframe id="hidden-shell-iframe"></iframe');
}

// Define libraries
require.config({
    baseUrl: 'resources/js/',
    waitSeconds: 200,
    paths: {
        mocha: 'lib/mocha-1.4.2',
        chai: 'lib/chai-1.2.0',
        jquery: 'lib/jquery-1.9.1',
        jqueryUi: 'lib/jquery-ui-1.9.1.custom',
        text: 'lib/require/text',
        ember: 'lib/ember-1.0.0-rc.3',
        handlebars: 'lib/handlebars-1.0.0-rc.3',
        mobile: 'lib/jquery.mobile-1.3.0',
        d3: 'lib/d3-2.10.1',
        cubism: 'lib/cubism-1.2.2',
        md5: 'lib/md5',
        sha256: 'lib/sha256',
    },
    shim: {
        'ember': {
            deps: ['handlebars', 'text', 'jquery', 'md5', 'sha256']
        },
        'jqueryUi': {
            deps: ['jquery']
        },
        'd3': {
            deps: ['jquery']
        },
        'cubism':{
            deps: ['d3']
        }
    }
});

// Load our app
define( 'app', [
    'jquery',
    'jqueryUi',
    'd3',
    'app/controllers/backends',
    'app/controllers/confirmation',
    'app/controllers/notification',
    'app/controllers/backend_add',
    'app/controllers/machine_add',
    'app/controllers/key_add',
    'app/controllers/select_machines',
    'app/controllers/select_images',
    'app/controllers/keys',
    'app/controllers/rules',
    'app/views/home',
    'app/views/backend_button',
    'app/views/backend_add',
    'app/views/backend_edit',
    'app/views/machine_list_item',
    'app/views/image_list_item',
    'app/views/machine_add_dialog',
    'app/views/machine',
    'app/views/machine_list',
    'app/views/confirmation_dialog',
    'app/views/machine_actions_dialog',
    'app/views/single_machine_actions_dialog',
    'app/views/shell',
    'app/views/image_list',
    'app/views/delete_tag',
    'app/views/machine_tags_dialog',
    'app/views/machine_manage_keys',
    'app/views/key_list_item',
    'app/views/key_list',
    'app/views/key',
    'app/views/key_add_dialog',
    'app/views/key_priv_dialog',
    'app/views/rule',
    'app/views/user_menu',
    'text!app/templates/machine.html',
    'cubism',
    'ember'
    ], function($,
                jQueryUI,
                d3,
                BackendsController,
                ConfirmationController,
                NotificationController,
                BackendAddController,
                MachineAddController,
                KeyAddController,
                SelectMachinesController,
                SelectImagesController,
                KeysController,
                RulesController,
                Home,
                BackendButton,
                BackendAdd,
                EditBackend,
                MachineListItem,
                ImageListItem,
                MachineAddDialog,
                SingleMachineView,
                MachineListView,
                ConfirmationDialog,
                MachineActionsDialog,
                SingleMachineActionsDialog,
                Shell,
                ImageListView,
                DeleteTagView,
                MachineTagsDialog,
                MachineManageKeys,
                KeyListItemView,
                KeyListView,
                SingleKeyView,
                KeyAddDialog,
                KeyPrivDialog,
                RuleView,
                UserMenuView,
                machine_html,
                cubism
                ) {

    function initialize() {

        $(document).bind("mobileinit", function(){
            $.mobile.ajaxEnabled = false;
            $.mobile.hashListeningEnabled = false;
            $.mobile.linkBindingEnabled = false;
            $('#splash').fadeOut(1000);
            $('body').css('overflow', '');
        });

        
        Ember.LOG_BINDINGS = false;

        App = Ember.Application.create({
            rootElement: 'body',
            LOG_TRANSITIONS: false,
            LOG_STATE_TRANSITIONS: false,
            email: null,
            password: null,

            ready: function(){
                Em.run.next(function(){
                    var id = false;
                    for(key in Ember.View.views) {
                        if("application" == Ember.View.views[key].renderedName) {
                            id = key;
                        }
                    }
                    if(id){
                        $("#" + id).attr('data-role', 'page');
                        require(['mobile'], function(){console.log('jqm loaded');});
                    }
                });
            }           
        });

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

        App.MachinesRoute = Ember.Route.extend({
            //clear selected machines when exiting view
            exit: function(){
              Mist.backendsController.forEach(function(backend){
                  backend.machines.forEach(function(machine){
                      log('deselecting machine: ' + machine.name);
                      machine.set('selected', false);
                  });
              });
            }          
        }); 
        
        App.MachineRoute = Ember.Route.extend({
          // Ember.js mindfuck warning
          redirect: function(){
              // redirect if the user visited the URL directly
              if (this.target != undefined){
                  window.location.replace(window.location.href.split('#')[0]+ '#machines');
                  window.location.reload();
              }
          },
          model: function(){
              // set redirect target if the user visits directly the URL
              this.target = 'machines';
          }          
        });   
        
        App.KeysRoute = Ember.Route.extend({
          //clear selected keys when exiting view           
          exit: function(){
              Mist.keysController.forEach(function(key){
                   log('deselecting key: ' + key.name);
                   key.set('selected', false);
              });
            }  
        });       

        App.KeyRoute = Ember.Route.extend({
          // Ember.js mindfuck warning            
          redirect: function(){
              // redirect if the user visited the URL directly
              if (this.target != undefined){
                  var target = this.target;
                  // clear redirect target
                  this.target = undefined;
                  var that = this;
                  Ember.run.next(function(){
                      that.transitionTo(target);
                  });
              }
          },
          model: function(){
              // set redirect target if the user visits directly the URL
              this.target = 'keys';
          } 
        });  
        
        // we check if we are at the bottom of the page
        App.isScrolledToBottom = function(){
            var distanceToViewportTop = (
                $(document).height() - $(window).height());
            var viewPortTop = $(document).scrollTop();
        
            if (viewPortTop === 0) {
                // if we are at the top of the page, don't do
                // the infinite scroll thing
                return false;
            }
        
            return (viewPortTop - distanceToViewportTop === 0);
        };
          
        App.SingleMachineView = SingleMachineView;
        App.MachineListView = MachineListView;
        App.UserMenuView = UserMenuView;
        App.KeyListView = KeyListView;
        App.KeyListItemView = KeyListItemView;
        App.ImageListView = ImageListView;
        App.SingleKeyView = SingleKeyView;
        App.AddKeyView = KeyAddDialog;
        App.KeyPrivDialog = KeyPrivDialog;
        App.MachineAddView = MachineAddDialog;
        App.MachineManageKeys = MachineManageKeys;
        
        App.set('backendAddController', BackendAddController.create());
        App.set('backendsController', BackendsController.create());
        App.set('confirmationController', ConfirmationController.create());
        App.set('notificationController', NotificationController.create());
        App.set('machineAddController', MachineAddController.create());
        App.set('selectMachinesController', SelectMachinesController.create());
        App.set('selectImagesController', SelectImagesController.create());
        App.set('keysController', KeysController.create());
        App.set('rulesController', RulesController.create());
        App.set('keyAddController', KeyAddController.create());

        App.set('authenticated', AUTH || URL_PREFIX == '' ? true : false);
        App.set('email', EMAIL);
        App.set('password', '');

        App.Select = Ember.Select.extend({
            attributeBindings: [
                'name',
                'data-theme',
                'data-icon',
                'data-native-menu',
                'disabled'
            ],
        });

        App.TextField = Ember.TextField.extend({
            attributeBindings: [
                'name',
                'data-theme'
            ]
        });

        App.ShellTextField = Ember.TextField.extend({

            attributeBindings: [
                'name',
                'data-theme',
                'autocapitalize'
            ],

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

        App.TagTextField = Ember.TextField.extend({
            attributeBindings: [
                'name',
                'data-theme',
                'autocapitalize'
            ],

            insertNewline: function() {
                this._parentView.submit();
            },
        
            keyUp: function() {
                if (this.value && this.value.length > 0) {
                    $('#tag-add').removeClass('ui-disabled');
                } else {
                    $('#tag-add').addClass('ui-disabled');
                }
            }

        });

        App.Checkbox = Ember.Checkbox.extend({
            attributeBindings: [
                'name',
                'id',
                'data-inline'
            ],
        });

        App.HomeView = Home;
        App.BackendButtonView = BackendButton;
        App.BackendAddView = BackendAdd;
        App.EditBackendView = EditBackend;
        App.MachineListItemView = MachineListItem;
        App.ImageListItemView = ImageListItem;
        App.ConfirmationDialog = ConfirmationDialog;

        App.DeleteTagView = DeleteTagView;
        App.RuleView = RuleView;
        App.MachineTagsDialog = MachineTagsDialog;
        App.ShellDialog = Shell;
        App.PowerDialog = SingleMachineActionsDialog;
        App.MachineActionsDialog = MachineActionsDialog;
        App.MachineListView = MachineListView;

        App.set('renderedImages', Ember.ArrayController.create());
        
        window.Mist = App;
        return App
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

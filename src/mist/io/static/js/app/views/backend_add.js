define('app/views/backend_add', [
    'app/models/backend',
    'text!app/templates/backend_add.html',
    'ember'],
    /**
     *
     * Add Backend Dialog
     *
     * @returns Class
     */
    function(Backend, backend_add_html) {

        return Ember.View.extend({

            template: Ember.Handlebars.compile(backend_add_html),
            
            pendingCreation: false,
            
            pendingCreationObserver: function() {
                if (this.pendingCreation) {
                    $('#create-backend-ok').addClass('ui-disabled');
                } else {
                    $('#create-backend-ok').removeClass('ui-disabled');
                }
            }.observes('pendingCreation'),
            
            keyDown: function(event) {
                if (event.keyCode == 13) { // Enter
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    if (Mist.backendAddController.newBackendReady) {
                        warn('yeay!');
                        this.addButtonClick();
                    }
                } else if (event.keyCode == 27) { // Esc
                    this.backClicked();
                }
            },
            
            selectBackend: function(event) {
                $('#notHpCloud').hide();
                if (event.target.title.indexOf("rackspace") != -1 || event.target.title.indexOf("linode") != -1 || event.target.title.indexOf("softlayer") !== -1) {
                    $('#addBackendInfo').show();                
                    $('#ApiKeylabel').text('2. Username:');
                    $('#ApiSecretlabel').text('3. API Key:');
                    $('#addBackendOpenstack').hide();
                    $('#addBackendBareMetal').hide();                    
                } else if (event.target.title.indexOf("nephoscale") !== -1) {
                    $('#addBackendInfo').show();                 
                    $('#ApiKeylabel').text('2. Username:');
                    $('#ApiSecretlabel').text('3. Password:');
                    $('#addBackendOpenstack').hide();
                    $('#addBackendBareMetal').hide(); 
                } else if (event.target.title.indexOf("digitalocean") !== -1) {
                    $('#addBackendInfo').show();                 
                    $('#ApiKeylabel').text('2. Client ID:');
                    $('#ApiSecretlabel').text('3. API Key:');
                    $('#addBackendOpenstack').hide();
                    $('#addBackendBareMetal').hide();                    
                } else if (event.target.title.indexOf("openstack") != -1) {
                    $('#addBackendInfo').show();                 
                    $('#ApiKeylabel').text('2. Username:');
                    $('#ApiSecretlabel').text('3. Password:');
                    $('#addBackendOpenstack').show();
                    $('#addBackendBareMetal').hide(); 
                    //This is the apiurl for HPCloud. We autocomplete the api url instead of hiding this field, for consistency with openstack
                    if (event.target.title.indexOf("region-") != -1) {
                        Mist.backendAddController.set('newBackendURL', 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/');
                    } else {
                        $('#notHpCloud').show();
                    }
                } else if (event.target.title.indexOf("bare_metal") != -1) {
                    // TODO: Render keys...
                    $('#addBackendInfo').hide();
                    $('#addBackendBareMetal').show();
                    $('#addBackendOpenstack').hide();
                    Mist.backendAddController.set('newBareMetalServerUser', 'root');
                } else {
                    $('#addBackendInfo').show();                 
                    $('#ApiKeylabel').text('2. API Key:');
                    $('#ApiSecretlabel').text('3. API Secret:');
                    $('#addBackendOpenstack').hide();
                    $('#addBackendBareMetal').hide();                    
                }
                $('.select-backend-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-backend-collapsible span.ui-btn-text').text(event.target.text);
                Mist.backendAddController.set('newBackendProvider', 
                    {provider: $(event.target).attr('title'),
                     title: event.target.text 
                    }
                );
                $('.select-backend-collapsible').trigger('collapse');
                
                Mist.backendAddController.set('newBackendKey', '');
                Mist.backendAddController.set('newBackendSecret', '');
                Mist.backendAddController.set('newBackendUrl', '');
                Mist.backendAddController.set('newBackendTenant', '');
                Mist.backendAddController.set('newBackendRegion', '');

                for (var b = 0; b < Mist.backendsController.content.length; b++) {
                    var backend = Mist.backendsController.content[b];
                    if (event.target.title.split('_')[0] == 'ec2' && backend.provider.split('_')[0] == 'ec2') {
                        //Autocomplete
                        Mist.backendAddController.set('newBackendKey', backend.apikey);
                        Mist.backendAddController.set('newBackendSecret', 'getsecretfromdb');
                        break;
                    } else if (event.target.title.substr(0,9) == 'rackspace' && backend.provider.substr(0,9) == 'rackspace') {
                        //autocomplete for all rackspace regions except LON, that needs an account on Rackspace Lon
                        if (event.target.title.substr(10) != 'lon') {
                            Mist.backendAddController.set('newBackendKey', backend.apikey);
                            Mist.backendAddController.set('newBackendSecret', 'getsecretfromdb');
                            break;
                        }
                    }
                }
            },
            
            addBackend: function() {
                $('.select-listmenu li').on('click', this.selectBackend);              
                $('#add-backend').panel('open');
            },

            addKey: function() {
                $('.select-key-listmenu li').on('click', this.selectKey);              
            },

            selectKey: function(key){
                $('.select-key-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-key-collapsible span.ui-btn-text').text(key.name);
                Mist.backendAddController.set('newBareMetalServerKey', key.name);       
                $('.select-key-collapsible').trigger('collapse');
            },

            backClicked: function() {
                $("#add-backend").panel("close");
                $('.select-listmenu li').off('click', this.selectBackend);
                Mist.backendAddController.newBackendClear();  
            },

            addButtonClick: function() {
                var that = this;
                that.set('pendingCreation', true);
                var payload = {
                    "title": Mist.backendAddController.newBackendProvider.title,
                    "provider": Mist.backendAddController.newBackendProvider.provider,
                    "apikey" : Mist.backendAddController.newBackendKey,
                    "apisecret": Mist.backendAddController.newBackendSecret,
                    "apiurl": Mist.backendAddController.newBackendURL,
                    "region": Mist.backendAddController.newBackendRegion,
                    "tenant_name": Mist.backendAddController.newBackendTenant,
                    "machine_ip_address": Mist.backendAddController.newBareMetalServerIP,                    
                    "machine_key": Mist.backendAddController.newBareMetalServerKey,                    
                    "machine_user": Mist.backendAddController.newBareMetalServerUser                                                           
                };
                $.ajax({
                    url: '/backends',
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "cache-control": "no-cache" },
                    data: JSON.stringify(payload),
                    success: function(result) {
                        that.set('pendingCreation', false);
                        Mist.backendAddController.newBackendClear();
                        $("#add-backend").panel("close");
                        $('.select-listmenu li').off('click', this.selectBackend);
                        info('added backend ' + result.id);

                        if (result.provider == 'bare_metal') {
                            if (!result.exists) {
                                Mist.backendsController.pushObject(Backend.create(result));                                                    
                            }
//Removed redirection to machines view
//                            Ember.run.later(function() {
//                                Mist.backendsController.getBackendById(result.id).machines.refresh();
//                                $('#home-menu li').eq(0).find('a').click(); // Manually click machines button
//                            }, 500);
                        } else {
                            Mist.backendsController.pushObject(Backend.create(result));                        
                        }
                    },
                    error: function(request){
                        that.set('pendingCreation', false);
                        Mist.notificationController.timeNotify(request.responseText, 5000);
                    }
                });
            },
            
            createBareMetalKeyClicked: function() {
                $('#create-key-dialog').popup('open');
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList')                        
        });
    }
);

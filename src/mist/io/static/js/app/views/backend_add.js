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
                if (event.target.title.indexOf("rackspace") != -1 || event.target.title.indexOf("linode") != -1 || event.target.title.indexOf("softlayer") !== -1) {
                    $('#ApiKeylabel').text('2. Username:');
                    $('#ApiSecretlabel').text('3. API Key:');
                    $('#addBackendOpenstack').hide();
                } else if (event.target.title.indexOf("nephoscale") !== -1) {
                    $('#ApiKeylabel').text('2. Username:');
                    $('#ApiSecretlabel').text('3. Password:');
                    $('#addBackendOpenstack').hide();
                } else if (event.target.title.indexOf("digitalocean") !== -1) {
                    $('#ApiKeylabel').text('2. Client ID:');
                    $('#ApiSecretlabel').text('3. API Key:');
                    $('#addBackendOpenstack').hide();
                } else if (event.target.title.indexOf("openstack") != -1) {
                    $('#ApiKeylabel').text('2. Username:');
                    $('#ApiSecretlabel').text('3. Password:');
                    $('#addBackendOpenstack').show();
                } else {
                    $('#ApiKeylabel').text('2. API Key:');
                    $('#ApiSecretlabel').text('3. API Secret:');
                    $('#addBackendOpenstack').hide();
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
                /* OpenStack support
                Mist.backendAddController.set('newBackendUrl', '');
                Mist.backendAddController.set('newBackendTenant', '');
                */
                for (var b = 0; b < Mist.backendsController.content.length; b++) {
                    var backend = Mist.backendsController.content[b];
                    if (event.target.title.split('_')[0] == 'ec2' && backend.provider.split('_')[0] == 'ec2') {
                        //Autocomplete
                        Mist.backendAddController.set('newBackendKey', backend.apikey);
                        Mist.backendAddController.set('newBackendSecret', 'getsecretfromdb');
                        break;
                    } else if (event.target.title.substr(0,9) == 'rackspace' && backend.provider.substr(0,9) == 'rackspace') {
                        Mist.backendAddController.set('newBackendKey', backend.apikey);
                        Mist.backendAddController.set('newBackendSecret', 'getsecretfromdb');
                        break;
                    }
                }
            },
            
            addBackend: function() {
                $('.select-listmenu li').on('click', this.selectBackend);              
                $('#add-backend').panel('open');
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
                    "apiurl": Mist.backendAddController.newBackendUrl,
                    "tenant_name": Mist.backendAddController.newBackendTenant
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
                        Mist.backendsController.pushObject(Backend.create(result));
                        info('added backend ' + result.id);
                        Mist.backendAddController.newBackendClear();
                        $("#add-backend").panel("close");
                        $('.select-listmenu li').off('click', this.selectBackend);
                    },
                    error: function(request){
                        that.set('pendingCreation', false);
                        Mist.notificationController.timeNotify(request.responseText, 5000);
                    }
                });
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList')
        });
    }
);

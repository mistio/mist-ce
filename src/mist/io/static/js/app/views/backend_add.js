define('app/views/backend_add', [
    'text!app/templates/backend_add.html',
    'ember'],
    /**
     * Add Backend Dialog
     *
     * @returns Class
     */
    function(backend_add_html) {

        return Ember.View.extend({

            firstFieldLabel: 'API Key',
            secondFieldLabel: 'API Secret',

            template: Ember.Handlebars.compile(backend_add_html),
            
            enableAddButtonObserver: function() {
                if (Mist.backendAddController.newBackendReady && 
                   !Mist.backendAddController.pendingCreation) {
                    $('#new-backend-ok').removeClass('ui-disabled');
                } else {
                    $('#new-backend-ok').addClass('ui-disabled');
                }
                
            }.observes('Mist.backendAddController.newBackendReady',
                       'Mist.backendAddController.pendingCreation'),

            actions: {
                selectProvider: function(provider) {
                    $('#openstack-bundle').hide();
                    if (provider.provider.indexOf("rackspace") > -1 || provider.provider.indexOf("linode") > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'API Key');
                    } else if (provider.provider.indexOf("nephoscale") > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                    } else if (provider.provider.indexOf("openstack") > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                        $('#openstack-bundle').show();
                    } else {
                        this.set('firstFieldLabel', 'API Key');
                        this.set('secondFieldLabel', 'API Secret');
                    }
                    
                    Mist.backendAddController.clear();
                    Mist.backendAddController.set('newBackendProvider', provider);
                    $('#new-backend-provider').collapsible('option','collapsedIcon','check');
                    
                    // Autocomplete credentials
                    Mist.backendsController.content.some(function(backend) {
                        if ((provider.provider.split('_')[0] == 'ec2' && backend.provider.split('_')[0] == 'ec2') ||
                            (provider.provider.substr(0,9) == 'rackspace' && backend.provider.substr(0,9) == 'rackspace')) {
                                Mist.backendAddController.set('newBackendFirstField', backend.apikey);
                                Mist.backendAddController.set('newBackendSecondField', 'getsecretfromdb');
                                return true;
                            }
                    });
                },
                
                addBackend: function() {
                    Mist.backendAddController.clear();
                    $('#add-backend').panel('open');
                },
    
                backClicked: function() {
                    $("#add-backend").panel("close");
                    Mist.backendAddController.clear();  
                },
    
                addClicked: function() {
                    Mist.backendAddController.addBackend();
                }
            }
        });
    }
);

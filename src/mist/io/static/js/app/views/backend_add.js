define('app/views/backend_add', ['text!app/templates/backend_add.html', 'ember'],
    /**
     *  Add Backend Panel
     * 
     *  @returns Class
     */
    function(backend_add_html) {
        return Ember.View.extend({

            /**
             *  Properties
             */

            firstFieldLabel: 'API Key',
            secondFieldLabel: 'API Secret',
            template: Ember.Handlebars.compile(backend_add_html),


            /**
             * 
             *  Methods
             * 
             */

            updateAddButton: function() {
                if (Mist.backendsController.addingBackend || !Mist.backendAddController.formReady) {
                    $('#new-backend-ok').addClass('ui-state-disabled');
                } else {
                    $('#new-backend-ok').removeClass('ui-state-disabled');
                }
            },


            /**
             * 
             *  Actions
             * 
             */

            actions: {


                selectProvider: function(provider) {

                    Mist.backendAddController.set('newBackendFirstField', '');
                    Mist.backendAddController.set('newBackendSecondField', '');
                    
                    $('#new-backend-second-field').attr('type', 'password');
                    $('#new-backend-provider').collapsible('collapse');
                    $('#openstack-bundle').hide();
                    $('#non-hp-cloud').hide();
                    $('#baremetal-bundle').hide();

                    if (provider.provider.indexOf('rackspace') > -1 || provider.provider.indexOf('linode') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'API Key');
                    } else if (provider.provider.indexOf('nephoscale') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                    } else if (provider.provider.indexOf('digitalocean') > -1) {
                        this.set('firstFieldLabel', 'Client ID');
                        this.set('secondFieldLabel', 'API Key');
                    } else if (provider.provider.indexOf('openstack') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                        $('#openstack-bundle').show();

                        //This is for HP Cloud specific
                        if (provider.provider.indexOf('region-') > -1) {
                            Mist.backendAddController.set('newBackendOpenStackURL', 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/');
                        } else {
                            $('#non-hp-cloud').show();
                        }
                    } else if (provider.provider.indexOf('bare_metal') > -1) {
                        this.set('firstFieldLabel', 'Hostname');
                        this.set('secondFieldLabel', 'User');
                        Mist.backendAddController.set('newBackendSecondField', 'root')

                        $('#new-backend-key .ui-listview').listview('refresh');
                        $('#new-backend-second-field').attr('type', '');
                        $('#baremetal-bundle').show();

                    } else {
                        this.set('firstFieldLabel', 'API Key');
                        this.set('secondFieldLabel', 'API Secret');
                    }

                    Mist.backendAddController.set('newBackendProvider', provider);
                    $('#new-backend-provider').collapsible('option', 'collapsedIcon', 'check');

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

                selectKey: function(key) {
                    $('#new-backend-key').collapsible('collapse');
                    Mist.backendAddController.set('newBackendKey', key);
                },

                createKeyClicked: function() {
                    Mist.keyAddController.open( function (success, key) {
                        if (success) {
                            Mist.backendAddController.set('newBackendKey', key);
                            $('#new-backend-key').collapsible('collapse');
                            $('#new-backend-key .ui-listview').listview('refresh');
                        }
                    });
                },


                backClicked: function() {
                    Mist.backendAddController.close();
                },


                addClicked: function() {
                    Mist.backendAddController.add();
                }
            },


            /**
             * 
             *  Observers
             * 
             */

            updateDoneButtonObserver: function() {
                Ember.run.once(this, 'updateAddButton');
            }.observes('Mist.backendsController.addingBackend', 'Mist.backendAddController.formReady')
        });
    }
);

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

            updateDoneButton: function() {
                if (Mist.backendsController.addingBackend || !Mist.backendAddController.formReady) {
                    $('#add-backend-ok').addClass('ui-state-disabled');
                } else {
                    $('#add-backend-ok').removeClass('ui-state-disabled');
                }
            },



            /**
             * 
             *  Actions
             * 
             */

            actions: {

                selectProvider: function(provider) {

                    $('#new-backend-provider').collapsible('collapse');
                    $('#openstack-bundle').hide();

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

                backClicked: function() {
                    Mist.backendAddController.close();
                },

                doneClicked: function() {
                    Mist.backendAddController.add();
                }
            },



            /**
             * 
             *  Observers
             * 
             */

            updateDoneButtonObserver: function() {
                Ember.run.once(this, 'updateDoneButton');
            }.observes('Mist.backendsController.addingBackend', 'Mist.backendAddController.formReady')
        });
    }
);

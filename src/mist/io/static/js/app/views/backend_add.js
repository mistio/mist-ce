define('app/views/backend_add', ['app/views/templated', 'ember'],
    /**
     *  Add Backend View
     *
     *  @returns Class
     */
    function(TemplatedView) {
        return TemplatedView.extend({

            /**
             *  Properties
             */

            firstFieldLabel: 'API Key',
            secondFieldLabel: 'API Secret',

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


            inputClicked: function (e) {

                info(e.target.id);
                if (e.target.id != 'new-backend-second-field')
                    return;

                if (Mist.backendAddController.newBackendProvider.provider == 'gce') {
                    Mist.fileUploadController.open('Upload file', 'Key',
                        function (uploadedFile) {
                            Mist.backendAddController.set('newBackendSecondField', uploadedFile);
                        }
                    );
                }
            },


            /**
             *
             *  Actions
             *
             */

            actions: {


                selectProvider: function(provider) {

                    Mist.backendAddController._clear();

                    $('#new-backend-second-field').attr('type', 'password');
                    $('#new-backend-provider').collapsible('collapse');
                    $('#openstack-bundle').hide();
                    $('#baremetal-bundle').hide();
                    $('#non-hp-cloud').hide();
                    $('#gce-bundle').hide();

                    if (provider.provider.indexOf('rackspace') > -1 || provider.provider.indexOf('linode') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'API Key');
                    } else if (provider.provider.indexOf('nephoscale') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                    } else if (provider.provider.indexOf('digitalocean') > -1) {
                        this.set('firstFieldLabel', 'Client ID');
                        this.set('secondFieldLabel', 'API Key');
                    } else if (provider.provider.indexOf('gce') > -1) {
                        this.set('firstFieldLabel', 'Client ID');
                        this.set('secondFieldLabel', 'Key');
                        $('#gce-bundle').show();
                    } else if (provider.provider.indexOf('openstack') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                        $('#openstack-bundle').show();

                        //This is for HP Cloud specific
                        if (provider.provider.indexOf('region-') > -1) {
                            Mist.backendAddController.set('newBackendOpenStackURL', 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/tokens');
                        }
                    } else if (provider.provider.indexOf('bare_metal') > -1) {
                        this.set('firstFieldLabel', 'Hostname');
                        this.set('secondFieldLabel', 'User');
                        Mist.backendAddController.set('newBackendSecondField', 'root');
                        Mist.backendAddController.set('newBackendPort', 22);
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
                },


                advancedToggled: function () {
                    var advanced = $('#non-hp-cloud');
                    if (advanced.css('display') == 'none') {
                        advanced.slideDown();
                    } else {
                        advanced.slideUp();
                    }
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

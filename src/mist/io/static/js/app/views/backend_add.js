define('app/views/backend_add', ['app/views/templated', 'ember'],
    //
    //  Add Backend View
    //
    //  @returns Class
    //
    function(TemplatedView) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            firstFieldLabel: 'API Key',
            secondFieldLabel: 'API Secret',


            //
            //
            //  Computer Properties
            //
            //


            firstFieldPlaceholder: function () {
                var provider = Mist.backendAddController.newBackendProvider;
                if (provider) {
                    if (provider.provider == 'vcloud')
                        return 'user@org';
                }
            }.property('Mist.backendAddController.newBackendProvider'),


            //
            //
            //  Methods
            //
            //


            updateAddButton: function() {
                if (Mist.backendsController.addingBackend || !Mist.backendAddController.formReady) {
                    $('#new-backend-ok').addClass('ui-state-disabled');
                } else {
                    $('#new-backend-ok').removeClass('ui-state-disabled');
                }
            },


            clear: function () {

                $('#gce-bundle').hide();
                $('#azure-bundle').hide();
                $('#tokenonly-bundle').hide();
                $('#non-hp-cloud').hide();
                $('#docker-bundle').hide();
                $('#baremetal-bundle').hide();
                $('#openstack-bundle').hide();
                $('#vcloud-bundle').hide();
                $('#new-backend-provider').collapsible('collapse');
                $('#new-backend-second-field').attr('type', 'password');
                $('#gce-bundle a').removeClass('ui-icon-check')
                    .addClass('ui-icon-carat-u');
                $('#common-bundle').show();
                Ember.run.next(function () {
                    $('#add-backend-panel').trigger('create');
                });
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                selectProvider: function(provider) {

                    Mist.backendAddController._clear();
                    this.clear();

                    $('#new-backend-second-field').attr('type', 'password');
                    $('#new-backend-provider').collapsible('collapse');
                    $('#opentack-advanced-wrapper').hide();
                    $('#openstack-bundle').hide();
                    $('#tokenonly-bundle').hide();
                    $('#baremetal-bundle').hide();
                    $('#docker-bundle').hide();
                    $('#hpcloud-bundle').hide();
                    $('#non-hp-cloud').hide();
                    $('#vcloud-bundle').hide();

                    if (provider.provider.indexOf('rackspace') > -1 || provider.provider.indexOf('softlayer') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'API Key');
                    } else if (provider.provider.indexOf('nephoscale') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                    } else if (provider.provider.indexOf('digitalocean') > -1) {
                        this.set('secondFieldLabel', 'Token');
                        $('#common-bundle').hide();
                        $('#tokenonly-bundle').show();
                    } else if (provider.provider.indexOf('linode') > -1) {
                        this.set('secondFieldLabel', 'API Key');
                        $('#common-bundle').hide();
                        $('#tokenonly-bundle').show();
                    } else if (provider.provider.indexOf('gce') > -1) {
                        this.set('firstFieldLabel', 'Email address');
                        this.set('secondFieldLabel', '');
                        $('#gce-bundle').show();
                    } else if (provider.provider.indexOf('azure') > -1) {
                        this.set('firstFieldLabel', 'Subscription ID');
                        this.set('secondFieldLabel', '');
                        $('#azure-bundle').show();
                    } else if (provider.provider.indexOf('docker') > -1) {
                        this.set('firstFieldLabel', 'BasicAuth User (optional)');
                        this.set('secondFieldLabel', 'BasicAuth Password (optional)');
                        $('#common-bundle').hide();
                        $('#docker-bundle').show();
                        Mist.backendAddController.set('newBackendPort', 4243);
                    } else if (provider.provider.indexOf('hpcloud') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                        $('#hpcloud-bundle').show();
                    } else if (provider.provider.indexOf('openstack') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                        $('#opentack-advanced-wrapper').show();
                        $('#openstack-bundle').show();
                    } else if (provider.provider.indexOf('vcloud') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');
                        $('#vcloud-bundle').show();
                        Mist.backendAddController.set('newBackendHost', '');
                    } else if (provider.provider.indexOf('bare_metal') > -1) {
                        this.set('firstFieldLabel', 'Hostname');
                        this.set('secondFieldLabel', 'User');
                        Mist.backendAddController.set('newBackendSecondField', 'root');
                        Mist.backendAddController.set('newBackendPort', 22);
                        Ember.run.next(function () {
                            $('#new-backend-key .ui-listview').listview('refresh');
                            $('#new-backend-second-field').attr('type', '');
                            $('#baremetal-bundle').show();
                        });

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


                privateKeyClicked: function () {
                    Mist.fileUploadController.open('Upload private key', 'Key',
                        function (uploadedFile) {

                            Mist.backendAddController.set('newBackendSecondField', uploadedFile);

                            if (uploadedFile) {
                                $('#gce-bundle a').addClass('ui-icon-check')
                                    .removeClass('ui-icon-carat-u');
                            } else {
                                $('#gce-bundle a').removeClass('ui-icon-check')
                                    .addClass('ui-icon-carat-u');
                            }
                        },
                        Mist.backendAddController.get('newBackendSecondField')
                    );
                },


                addCertificateClicked: function () {
                    Mist.fileUploadController.open('Upload certificate', 'Certificate',
                        function (uploadedFile) {
                            Mist.backendAddController.set('newBackendSecondField',
                                uploadedFile);
                        },
                        Mist.backendAddController.get('newBackendSecondField')
                    );
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


            //
            //
            //  Observers
            //
            //


            updateDoneButtonObserver: function() {
                Ember.run.once(this, 'updateAddButton');
            }.observes('Mist.backendsController.addingBackend', 'Mist.backendAddController.formReady')
        });
    }
);


define('app/views/cloud_add', ['app/views/panel'],
    //
    //  Cloud Add View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return App.CloudAddView = PanelView.extend({


            selectedRegion: null,


            //
            //
            //  Computed Properties
            //
            //


            providerFields: function () {
                return getProviderFields(Mist.cloudAddController.provider);
            }.property('Mist.cloudAddController.provider'),


            hasAdvanced: function () {
                return !!this.get('providerFields').findBy('advanced');
            }.property('providerFields'),


            providerRegions: function () {
                if (Mist.cloudAddController.provider)
                    return Mist.cloudAddController.provider.regions;
            }.property('Mist.cloudAddController.provider'),


            isReady: function () {
                var isReady = true
                this.get('providerFields').some(function (field) {
                    if (field.optional) return;
                    if (field.isSlider) return;
                    if (field.value === undefined ||
                        field.value === null ||
                        field.value === '')
                            return isReady = false;
                });
                return isReady;
            }.property('providerFields.@each.value'),


            //
            //
            //  Methods
            //
            //


            clear: function () {
                $('#new-cloud-provider').collapsible('collapse');
                $('#cloud-add-fields').hide();
                Ember.run.next(this, function () {
                    $(this.panelId).trigger('create');
                    Ember.run.later(this, function () {
                        if (Mist.cloudAddController.provider)
                            $('#cloud-add-fields').fadeIn();
                    }, 100);
                });
            },


            autocompleteCredentials: function (provider) {
                var fields = this.get('providerFields');

                // Autocomplete credentials only for providers
                // with regions
                if (!fields.findBy('type', 'region'))
                    return;

                Mist.cloudsController.content.some(function (cloud) {

                    // cloud.provider == provider.provider won't work
                    // because we still save clouds in the database using
                    // the old format for compatibility reasons
                    if (cloud.getSimpleProvider() == provider.provider) {

                        if (provider.provider == 'ec2') {
                            fields.findBy('name', 'api_key').set('value', cloud.apikey);
                            fields.findBy('name', 'api_secret').set('value', 'getsecretfromdb');
                        }
                        if (provider.provider == 'rackspace') {
                            fields.findBy('name', 'username').set('value', cloud.apikey);
                            fields.findBy('name', 'api_key').set('value', 'getsecretfromdb');
                        }
                        if (provider.provider == 'hpcloud') {
                            fields.findBy('name', 'username').set('value', cloud.apikey);
                            fields.findBy('name', 'password').set('value', 'getsecretfromdb');
                            fields.findBy('name', 'tenant_name').set('value', cloud.tenant_name);
                        }
                    }
                });
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                selectProvider: function (provider, field) {
                    this.clear();
                    clearProviderFields(provider);
                    Mist.cloudAddController.set('provider', provider);
                    $('#new-cloud-provider').collapsible('collapse');
                    this.autocompleteCredentials(provider);
                },


                selectRegion: function (region, field) {
                    field.set('value', region.id);
                    this.set('selectedRegion', region.location);
                    $('#region').collapsible('collapse');

                    // Append region to title
                    var fields = this.get('providerFields');
                    var title = fields.findBy('name', 'title');
                    title.set('value', title.defaultValue + ' ' + region.location);
                },


                uploadFile: function (field) {
                    Mist.fileUploadController.open('Upload ' + field.label, field.label,
                        function (uploadedFile) {
                            uploadedFile = uploadedFile.trim();
                            field.set('value', uploadedFile);
                            $('#' + field.name)
                                .removeClass('ui-icon-plus')
                                .removeClass('ui-icon-check')
                                .addClass(uploadedFile ? 'ui-icon-check' : 'ui-icon-plus');
                        },
                        field.value
                    );
                },


                selectKey: function (key, field) {
                    $('#' + field.name).collapsible('collapse');
                    field.set('value', key.id);
                },


                createKeyClicked: function (field) {
                    Mist.keyAddController.open( function (success, key) {
                        if (success) {
                            $('#' + field.name).collapsible('collapse');
                            $('#' + field.name + ' .ui-listview').listview('refresh');
                            field.set('value', key.id);
                        }
                    });
                },


                backClicked: function() {
                    Mist.cloudAddController.close();
                },


                addClicked: function() {
                    Mist.cloudAddController.add();
                },


                switchToggled: function () {
                    var interval = 250;
                    var on = this.$().find('select').val() == 1;
                    if (on) {
                        $('.off').fadeOut(interval);
                        Ember.run.later(function () {
                            $('.on').fadeIn(interval);
                        }, interval - 50);
                    } else {
                        $('.on').fadeOut(interval);
                        Ember.run.later(function () {
                            $('.off').fadeIn(interval);
                        }, interval - 50);
                    }
                }
            },
        });
    }
);

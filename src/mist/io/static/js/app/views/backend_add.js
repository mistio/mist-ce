define('app/views/backend_add', ['app/views/panel'],
    //
    //  Backend Add View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return App.BackendAddView = PanelView.extend({


            selectedRegion: null,


            //
            //
            //  Computed Properties
            //
            //


            providerFields: function () {
                return getProviderFields(Mist.backendAddController.provider);
            }.property('Mist.backendAddController.provider'),


            hasAdvanced: function () {
                return !!this.get('providerFields').findBy('advanced');
            }.property('providerFields'),


            providerRegions: function () {
                if (Mist.backendAddController.provider)
                    return Mist.backendAddController.provider.regions;
            }.property('Mist.backendAddController.provider'),


            isReady: function () {
                var isReady = true
                this.get('providerFields').some(function (field) {
                    if (field.optional) return;
                    if (field.isSlider && !field.name) return;
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
                $('#new-backend-provider').collapsible('collapse');
                $('#backend-add-fields').hide();
                Ember.run.next(this, function () {
                    $(this.panelId).trigger('create');
                    Ember.run.later(this, function () {
                        if (Mist.backendAddController.provider)
                            $('#backend-add-fields').fadeIn();
                    }, 100);
                });
            },


            autocompleteCredentials: function (provider) {
                var fields = this.get('providerFields');

                // Autocomplete credentials only for providers
                // with regions
                if (!fields.findBy('type', 'region'))
                    return;

                Mist.backendsController.content.some(function (backend) {

                    // backend.provider == provider.provider won't work
                    // because we still save backends in the database using
                    // the old format for compatibility reasons
                    if (backend.getSimpleProvider() == provider.provider) {

                        if (provider.provider == 'ec2') {
                            fields.findBy('name', 'api_key').set('value', backend.apikey);
                            fields.findBy('name', 'api_secret').set('value', 'getsecretfromdb');
                        }
                        if (provider.provider == 'rackspace') {
                            fields.findBy('name', 'username').set('value', backend.apikey);
                            fields.findBy('name', 'api_key').set('value', 'getsecretfromdb');
                        }
                        if (provider.provider == 'hpcloud') {
                            fields.findBy('name', 'username').set('value', backend.apikey);
                            fields.findBy('name', 'password').set('value', 'getsecretfromdb');
                            fields.findBy('name', 'tenant_name').set('value', backend.tenant_name);
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
                    Mist.backendAddController.set('provider', provider);
                    $('#new-backend-provider').collapsible('collapse');
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
                    field.set('value', key.id || key);
                    Ember.run.next(this, function () {
                        this.$().trigger('create');
                    });
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
                    Mist.backendAddController.close();
                },


                addClicked: function() {
                    Mist.backendAddController.add();
                },


                switchToggled: function (field) {
                    var interval = 250;
                    var on = this.$().find('select').val() == 1;
                    if (on) {
                        $('.off').fadeOut(interval);
                        Ember.run.later(this, function () {
                            $('.on').fadeIn(interval);
                        }, interval - 50);
                    } else {
                        $('.on').fadeOut(interval);
                        Ember.run.later(this, function () {
                            $('.off').fadeIn(interval);
                        }, interval - 50);
                    }
                    if (field.name) {
                        field.set('value', field.get((on ? 'on' : 'off') + 'Value'))
                    }
                }
            },
        });
    }
);

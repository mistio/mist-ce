define('app/views/backend_add', ['app/views/controlled'],
    //
    //  Backend Add View
    //
    //  @returns Class
    //
    function (ControlledComponent) {

        'use strict';

        return App.BackendAddComponent = ControlledComponent.extend({

            layoutName: 'backend_add',
            controllerName: 'backendAddController',

            selectedRegion: null,
            helpHref: '',

            //
            //
            //  Computed Properties
            //
            //

            provider: function() {
                return Mist.backendAddController.get('provider');
            }.property('Mist.backendAddController.provider'),

            providerFields: function () {
                return getProviderFields(this.get('provider'));
            }.property('provider'),

            providerList: function() {
                return Mist.backendAddController.get('providerList');
            }.property(),

            hasAdvanced: function () {
                return !!this.get('providerFields').findBy('advanced');
            }.property('providerFields'),


            providerRegions: function () {
                if (this.provider)
                    return this.provider.regions;
            }.property('provider'),


            isReady: function () {
                var isReady = true;
                if (this.provider){
                    this.get('providerFields').some(function (field) {
                        if (field.optional) return;
                        if (field.isSlider && !field.name) return;
                        if (field.value === undefined ||
                            field.value === null ||
                            field.value === '')
                                return isReady = false;
                    });
                } else {
                    return isReady = false;
                }
                return isReady;
            }.property('providerFields.@each.value'),


            //
            //
            //  Methods
            //
            //


            clear: function () {
                $('#backend-add-fields').hide();
                Ember.run.next(this, function () {
                    $('body').enhanceWithin();
                    $('#new-backend-provider').collapsible('collapse');
                    $('#add-backend').collapsible('expand');
                    $('#backend-add-fields').fadeIn();
                    $('#add-backend-overlay').removeClass('ui-screen-hidden').addClass('in');
                });
            },

            close: function () {
                $('#add-backend').collapsible('collapse');
                $('#new-backend-provider').collapsible('expand');
            },

            autocompleteCredentials: function (provider) {
                var fields = this.get('providerFields');

                // Autocomplete credentials only for providers
                // with regions
                if (!fields.findBy('type', 'region'))
                    return;

                Mist.backendsController.model.some(function (backend) {

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

                clickOverlay: function() {
                    $('#add-backend').collapsible('collapse');
                },

                selectProvider: function (provider, field) {
                    clearProviderFields(provider);
                    Ember.run.next(this, function(){
                        Mist.backendAddController.set('provider', provider);
                        this.clear();
                        this.autocompleteCredentials(provider);
                    })
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
                        this.$().enhanceWithin();
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

                helpClicked: function (field) {
                    Mist.backendAddController.setProperties({
                        helpText: field.helpText,
                        helpHref: field.helpHref,
                    });
                    $('#help-tooltip').popup().popup('option', 'positionTo', '#' + field.helpId)
                    Ember.run.later(function () {
                        $('#help-tooltip').popup('open');
                    }, 50);
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

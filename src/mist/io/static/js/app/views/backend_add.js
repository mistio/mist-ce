define('app/views/backend_add', ['app/views/panel'],
    //
    //  Backend Add View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return PanelView.extend({


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


            //
            //
            //  Actions
            //
            //


            actions: {

                selectProvider: function (provider) {
                    this.clear();
                    clearProviderFields(provider);
                    Mist.backendAddController.set('provider', provider);
                    $('#new-backend-provider').collapsible('collapse');
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
                    Mist.backendAddController.close();
                },


                addClicked: function() {
                    Mist.backendAddController.add();
                },


                advancedToggled: function () {
                    App.switchElementVisibility('backend-add-advanced');
                }
            },
        });
    }
);


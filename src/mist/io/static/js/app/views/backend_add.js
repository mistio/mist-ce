define('app/views/backend_add', ['app/views/panel'],
    //
    //  Backend Add View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return PanelView.extend({


            //
            //
            //  Computed Properties
            //
            //


            providerFields: function () {
                return getProviderFields(Mist.backendAddController.provider);
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
                Ember.run.next(this, function () {
                    $(this.panelId).trigger('create');
                });
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                selectProvider: function(provider) {
                    this.clear();
                    $('#new-backend-key').collapsible('collapse').collapsible('option', 'collapsedIcon', 'carat-d');
                    $('#new-backend-provider').collapsible('collapse').collapsible('option', 'collapsedIcon', 'carat-d');
                    Mist.backendAddController.set('provider', provider);
                    clearProviderFields(provider);
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
        });
    }
);


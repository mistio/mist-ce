define('app/views/backend_add', ['app/views/templated'],
    //
    //  Add Backend View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Computed Properties
            //
            //


            providerFields: function () {
                return getProviderFields(Mist.backendAddController.provider);
            }.property('Mist.backendAddController.provider'),


            //
            //
            //  Methods
            //
            //


            updateAddButton: function() {
                var isReady = true
                this.get('providerFields').some(function (field) {
                    if (field.optional) return;
                    if (field.value === undefined ||
                        field.value === null ||
                        field.value === '')
                            return isReady = false;
                });
                if (isReady)
                    $('#new-backend-ok').removeClass('ui-state-disabled');
                else
                    $('#new-backend-ok').addClass('ui-state-disabled');
            },


            clear: function () {
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


            //
            //
            //  Observers
            //
            //


            updateDoneButtonObserver: function() {
                Ember.run.once(this, 'updateAddButton');
            }.observes('providerFields.@each.value')
        });
    }
);


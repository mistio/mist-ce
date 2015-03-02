define('app/views/key_add', ['app/views/popup'],
    //
    //  Key Add View
    //
    //  @returns Class
    //
    function (PopupView) {

        'use strict';

        return App.KeyAddView = PopupView.extend({


            //
            //
            //  Properties
            //
            //


            addButton: '#key-add-ok',
            fileInput: '#key-add-upload',


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.setProperties({
                    fileInput: $(this.fileInput),
                    addButton: $(this.addButton),
                });
            }.on('didInsertElement'),


            //
            //
            //  Methods
            //
            //


            updateAddButton: function () {
                if (Mist.keyAddController.addingKey ||
                    !Mist.keyAddController.formReady)

                    this.addButton.addClass('ui-state-disabled');
                else
                    this.addButton.removeClass('ui-state-disabled');
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                uploadClicked: function () {
                    this.fileInput.click();
                },


                uploadInputChanged: function () {
                    Mist.keyAddController.upload();
                },


                generateClicked: function () {
                    Mist.keyAddController.generate();
                },


                backClicked: function () {
                    Mist.keyAddController.close();
                },


                addClicked: function () {
                    Mist.keyAddController.add();
                }
            },


            //
            //
            //  Observers
            //
            //


            updateButtonObserver: function () {
                Ember.run.once(this, 'updateAddButton');
            }.observes('Mist.keyAddController.formReady',
                'Mist.keyAddController.addingKey'),
        });
    }
);

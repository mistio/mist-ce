define('app/views/file_upload', ['ember'],
    //
    //  File Upload View
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return App.FileUploadComponent = Ember.Component.extend({

            layoutName: 'file_upload',


            //
            //  Actions
            //

            actions: {

                uploadClicked: function () {
                    if (window.File && window.FileReader && window.FileList) {
                        $('#file-upload-input').click();
                    } else {
                        Mist.notificationController.notify('Your browser does not support the HTML5 file API');
                    }
                },

                uploadInputChanged: function () {
                    Mist.fileUploadController.uploadFile({
                        fileInput: $('#file-upload-input')[0]
                    });
                },

                backClicked: function () {
                    Mist.fileUploadController.close();
                },

                doneClicked: function () {
                    Mist.fileUploadController.confirmUpload();
                }
            },


            //
            //  Observers
            //

            fileObserver: function () {
                if (Mist.fileUploadController.file) {
                    $('#file-upload-ok').removeClass('ui-state-disabled');
                } else {
                    $('#file-upload-ok').addClass('ui-state-disabled');
                }
            }.observes('Mist.fileUploadController.file'),
        });
    }
);

define('app/controllers/file_upload', ['ember'],
    //
    //  File Upload Controller
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            file: null,
            title: null,
            label: null,
            callback: null,
            uploadingFile: null,


            //
            //
            //  Methods
            //
            //


            open: function (title, label, callback, defaultText) {
                this.clear();
                this.set('title', title)
                    .set('label', label)
                    .set('file', defaultText)
                    .set('callback', callback);

                Ember.run.next(function(){
                    $('#file-upload').popup({afteropen: function() {
                        $('#file-upload-screen').height(screen.height);
                    }}).popup('open');
                })
            },


            close: function () {
                this.clear();
                $('#file-upload').popup('close');
            },


            clear: function () {
                this.set('file', null)
                    .set('title', null)
                    .set('label', null)
                    .set('callback', null);
            },


            confirmUpload: function () {
                if (this.callback) this.callback(this.file);
                this.close();
            },


            uploadFile: function (args) {

                var that = this;
                var reader = new FileReader();

                reader.onloadend = function (e) {
                    var success;
                    if (e.target.readyState == FileReader.DONE) {
                        that.set('file', e.target.result);
                        success = true;
                    } else {
                        Mist.notificationController.notify('Failed to upload file');
                        success = false
                    }
                    that.set('uploadingFile', false);
                    if (args.fileInput)
                        resetFileInputField($(args.fileInput));
                    if (args.callback)
                        args.callback(success, that.file);
                };

                this.set('uploadingFile', true);
                if (args.file)
                    reader.readAsText(args.file, 'UTF-8');
                if (args.fileInput)
                    reader.readAsText(args.fileInput.files[0], 'UTF-8');
            }
        });
    }
);

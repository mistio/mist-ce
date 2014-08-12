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


            open: function (title, label, callback) {
                this.set('title', title)
                    .set('label', label)
                    .set('callback', callback);

                $('#file-upload').popup('open');
            },


            close: function () {
                this.clear();
                $('#file-upload').popup('close');
            },


            clear: function () {
                this.set('title', null)
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

                    if (e.target.readyState == FileReader.DONE)
                        that.set('file', e.target.result);
                    else
                        Mist.notificationsController.notify('Failed to upload file');
                    that.set('uploadingFile', false);

                    if (args.callback)
                        args.callback(success, that.file);
                };

                this.set('uploadingFile', true);
                reader.readAsText(args.file, 'UTF-8');
            }
        });
    }
);

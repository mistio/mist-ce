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
                    $('#file-upload').popup('open');
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
                var input = args.fileInput;

                if (input.files && input.files[0]) {
                    var validExtensions = ['pem', 'txt', 'pub', ''],
                        filename = input.files[0].name,
						ext = (filename.indexOf('.') > -1) ? filename.split('.').pop().toLowerCase() : '',
						valid = validExtensions.indexOf(ext) > -1;

                    if (!valid) {
                        Mist.notificationController.notify('Please try to upload a valid file');
                        console.log('Oh no, this is a .' + ext + ' file.');
                        console.log('Marios lets me pass only .pem and .txt files!');
                        return;
                    }
                }

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

define('app/controllers/key_add', ['ember'],
    //
    //  Key Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            view: null,
            callback: null,
            formReady: null,

            keyId: null,
            keyPrivate: null,
            keyPublic: null,

            addingKey: null,
            uploadingKey: null,
            generatingKey: null,


            //
            //
            //  Methods
            //
            //


            open: function (callback) {
                this._clear();
                this.view.open('#add-key-btn');
                this.set('callback', callback);
            },


            close: function () {
                this._clear();
                this.view.close();
            },


            add: function () {
                this.set('addingKey', true);
                Mist.keysController.addKey({
                    keyId: this.keyId,
                    keyPrivate: this.keyPrivate,
                    callback: this._add,
                });
            },


            upload: function () {
                this.set('uploadingKey', true);
                Mist.fileUploadController.uploadFile({
                    fileInput: this.view.fileInput[0],
                    callback: this._upload
                });
            },


            generate: function () {
                this.set('generatingKey', true);
                Mist.keysController.generateKey({
                    callback: this._generate
                });
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                this.setProperties({
                    callback: null,
                    keyId: null,
                    keyPrivate: null,
                    keyPublic: null
                });
            },


            _add: function (success, key) {
                var that = Mist.keyAddController;
                that.set('addingKey', false);
                if (that.callback)
                    that.callback(success, key);
                if (success)
                    that.close();
            },


            _upload: function (success, keyPrivate) {
                var that = Mist.keyAddController;
                that.set('uploadingKey', false);
                if (success)
                    that.set('keyPrivate', keyPrivate);
            },


            _generate: function (success, keyPrivate, keyPublic) {
                info('generate key callback');
                var that = Mist.keyAddController;
                that.set('generatingKey', false);
                if (success) {                    
                    that.setProperties({
                        'keyPrivate': keyPrivate,
                        'keyPublic': keyPublic
                    });

                    Ember.run.next(function() {
                        $('body').enhanceWithin();
                    });
                }
            },


            _sanitizeFields: function () {

                // Remove non alphanumeric chars
                if (this.keyId)
                    this.set('keyId', this.keyId.replace(/\W/g, ''));

                // Remove extra spaces and new lines
                if (this.keyPrivate)
                    this.set('keyPrivate', this.keyPrivate.trim());
            },


            _updateFormReady: function () {
                this.set('formReady', this.keyId && this.keyPrivate);
            },


            //
            //
            //  Observers
            //
            //


            formObserver: function () {
                Ember.run.once(this, '_sanitizeFields');
                Ember.run.once(this, '_updateFormReady');
            }.observes('keyId', 'keyPrivate'),
        });
    }
);

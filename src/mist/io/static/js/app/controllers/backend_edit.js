define('app/controllers/backend_edit', ['ember'],
    //
    //  Backend Edit Controller
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

            formReady: null,
            backend: null,
            newTitle: null,
            newState: null,


            //
            //
            //  Methods
            //
            //


            open: function (backend, position) {
                this._clear();
                this.setProperties({
                    backend: backend,
                    newTitle: backend.title,
                    newState: backend.enabled,
                });
                this._updateFormReady();
                this.view.open(position);
            },


            close: function () {
                this._clear();
                this.view.close();
            },


            rename: function () {

                if (this.formReady) {

                    Mist.backendsController.renameBackend({
                        backend: this.backend,
                        newTitle: this.newTitle,
                        callback: this._rename
                    });
                }
            },


            toggle: function () {

                if (this.newState == this.backend.enabled) return;

                Mist.backendsController.toggleBackend({
                    backend: this.backend,
                    newState: this.newState,
                    callback: this._toggle
                });
            },


            delete: function () {

                Mist.backendsController.deleteBackend({
                    backend: this.backend,
                    callback: this._delete
                });
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                this.setProperties({
                    backend: {},
                    newTitle: null,
                    newState: null,
                })
            },

            _updateFormReady: function() {
                var formReady = false;
                if (this.newTitle != this.backend.title && this.newTitle) {
                    formReady = true;
                }

                this.set('formReady', formReady);
            },


            _rename: function () {
                var that = Mist.backendEditController;
                if (!that.backend) return;
                that.set('newTitle', that.backend.title);
            },


            _toggle: function () {
                var that = Mist.backendEditController;
                if (!that.backend) return;
                that.set('newState', that.backend.enabled);
            },


            _delete: function (success) {
                var that = Mist.backendEditController;
                if (success) that.close();
            },


            //
            //
            //  Observers
            //
            //


            stateObserver: function () {
                Ember.run.once(this, '_toggle');
            }.observes('backend.enabled'),


            newStateObserver: function () {
                Ember.run.once(this, 'toggle');
            }.observes('newState'),
            

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newTitle')
        });
    }
);

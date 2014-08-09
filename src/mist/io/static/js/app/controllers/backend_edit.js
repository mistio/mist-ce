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


            backend: null,
            newTitle: null,
            newState: null,


            //
            //
            //  Methods
            //
            //


            open: function (backend) {
                this._clear();
                this.setProperties({
                    backend: backend,
                    newTitle: backend.title,
                    newState: backend.state,
                });
                this.view.open();
            },


            close: function () {
                this._clear();
                this.view.close();
            },


            rename: function () {
                if (this.newTitle == this.backend.title) return;
                Mist.backendsController.renameBackend({
                    backend: this.backend,
                    newTitle: this.newTitle,
                });
            },


            toggle: function (callback) {
                if (this.newState == this.backend.state) return;
                Mist.backendsController.toggleBackend({
                    backend: this.backend,
                    newState: this.newState
                });
            },


            delete: function () {
                Mist.backendsController.deleteBackend({
                    backend: this.backend,
                    callback: this.close,
                });
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                this.setProperties({
                    backend: null,
                    newTitle: null,
                    newState: null,
                })
            },


            //
            //
            //  Observers
            //
            //


            newTitleObserver: function () {
                Ember.run.once(this, 'rename');
            }.observes('newTitle'),


            newStateObserver: function () {
                Ember.run.once(this, 'toggle');
            }.observes('newState'),
        });
    }
);

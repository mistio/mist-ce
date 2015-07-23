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
            renameLock: null,


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
                this.view.open(position);
            },


            close: function () {
                this._clear();
                this.view.close();
            },


            rename: function () {

                if (this.newTitle == this.backend.title) return;
                if (this.newTitle == '') return;

                Mist.backendsController.renameBackend({
                    backend: this.backend,
                    newTitle: this.newTitle,
                    callback: this._rename
                });
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


            titleObserver: function () {
                Ember.run.once(this, '_rename');
            }.observes('backend.title'),


            newTitleObserver: function () {

                // Send a rename request 1 second
                // after the user stops typing
                clearTimeout(this.renameLock);
                this.renameLock = setTimeout(renameLater, 1000);

                var that = this;
                function renameLater () {
                    that.rename();
                }
            }.observes('newTitle'),
        });
    }
);

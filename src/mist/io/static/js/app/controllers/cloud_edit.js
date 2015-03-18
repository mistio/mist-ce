define('app/controllers/cloud_edit', ['ember'],
    //
    //  Cloud Edit Controller
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


            cloud: null,
            newTitle: null,
            newState: null,
            renameLock: null,


            //
            //
            //  Methods
            //
            //


            open: function (cloud) {
                this._clear();
                this.setProperties({
                    cloud: cloud,
                    newTitle: cloud.title,
                    newState: cloud.enabled,
                });
                this.view.open();
            },


            close: function () {
                this._clear();
                this.view.close();
            },


            rename: function () {

                if (this.newTitle == this.cloud.title) return;
                if (this.newTitle == '') return;

                Mist.cloudsController.renameCloud({
                    cloud: this.cloud,
                    newTitle: this.newTitle,
                    callback: this._rename
                });
            },


            toggle: function () {

                if (this.newState == this.cloud.enabled) return;

                Mist.cloudsController.toggleCloud({
                    cloud: this.cloud,
                    newState: this.newState,
                    callback: this._toggle
                });
            },


            delete: function () {

                Mist.cloudsController.deleteCloud({
                    cloud: this.cloud,
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
                    cloud: {},
                    newTitle: null,
                    newState: null,
                })
            },


            _rename: function () {
                var that = Mist.cloudEditController;
                if (!that.cloud) return;
                that.set('newTitle', that.cloud.title);
            },


            _toggle: function () {
                var that = Mist.cloudEditController;
                if (!that.cloud) return;
                that.set('newState', that.cloud.enabled);
            },


            _delete: function (success) {
                var that = Mist.cloudEditController;
                if (success) that.close();
            },


            //
            //
            //  Observers
            //
            //


            stateObserver: function () {
                Ember.run.once(this, '_toggle');
            }.observes('cloud.enabled'),


            newStateObserver: function () {
                Ember.run.once(this, 'toggle');
            }.observes('newState'),


            titleObserver: function () {
                Ember.run.once(this, '_rename');
            }.observes('cloud.title'),


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

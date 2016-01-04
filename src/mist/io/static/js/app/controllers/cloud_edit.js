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

            formReady: null,
            cloud: null,
            newTitle: null,
            newState: null,
            editingCloud: null,


            //
            //
            //  Methods
            //
            //


            open: function (cloud, position) {
                this._clear();
                this.setProperties({
                    cloud: cloud,
                    newTitle: cloud.title,
                    newState: cloud.enabled,
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
                    this.set('editingCloud', true);
                    Mist.cloudsController.renameCloud({
                        cloud: this.cloud,
                        newTitle: this.newTitle,
                        callback: this._rename
                    });
                }
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

            _updateFormReady: function() {
                var formReady = false;
                if (this.newTitle != this.cloud.title && this.newTitle) {
                    formReady = true;
                }

                if (formReady && this.editingCloud) {
                    formReady = false;
                }

                this.set('formReady', formReady);
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
            

            newTitleObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newTitle', 'editingCloud')
        });
    }
);

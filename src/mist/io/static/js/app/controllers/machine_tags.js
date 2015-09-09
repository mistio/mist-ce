define('app/controllers/machine_tags', ['ember'],
    /**
     *  Machine Tags Controller
     *
     *  @returns Class
     */
    function () {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            formReady: null,
            newTag: null,
            machine: null,
            callback: null,
            addingTag: null,
            deletingTag: null,


            /**
             *
             *  Methods
             *
             */

            open: function (machine, callback) {
                this._clear();
                this.setProperties({
                    machine: machine,
                    callback: callback
                });
                this._updateFormReady();
                Ember.run.next(function () {
                    $('#machine-tags-popup').popup('open');
                });
            },


            close: function () {
                $('#machine-tags-popup').popup('close');
                this._clear();
            },


            add: function () {
                var that = this;
                var tag = this.newTag;
                var machine = this.machine;

                if (this.formReady) {
                    this.set('addingTag', true);
                    Mist.ajax.POST('backends/' + machine.backend.id + '/machines/' + machine.id + '/metadata', {
                        'tag': tag
                    }).success(function () {
                        // TODO: move to seperate function and trigger event
                        machine.tags.pushObject(tag);
                    }).error(function () {
                        Mist.notificationController.notify('Failed to add tag: ' + tag);
                    }).complete(function (success) {
                        that.set('addingTag', false);
                        if (that.callback) that.callback(success, tag);
                    });
                }
            },


            deleteTag: function (tag) {
                var that = this;
                var machine = this.machine;

                this.set('deletingTag', true);
                Mist.ajax.DELETE('backends/' + machine.backend.id + '/machines/' + machine.id + '/metadata', {
                    'tag': tag
                }).success(function () {
                    // TODO: move to seperate function and trigger event
                    machine.tags.removeObject(tag);
                }).error(function () {
                    Mist.notificationController.notify('Failed to delete tag :' + tag);
                }).complete(function (success) {
                    that.set('deletingTag', false);
                    if (that.callback) that.callback(success, tag);
                });
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                this.setProperties({
                    machine: null,
                    callback: null,
                    newTag: null
                });
            },

            _updateFormReady: function() {
                var formReady = false;
                if (this.newTag) {
                    formReady = true;
                }

                this.set('formReady', formReady);
            },

            /**
             *
             *  Observers
             *
             */

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newTag')
        });
    }
);

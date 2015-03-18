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
                this.set('machine', machine);
                this.set('callback', callback);
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

                this.set('addingTag', true);
                Mist.ajax.POST('clouds/' + machine.cloud.id + '/machines/' + machine.id + '/metadata', {
                    'tag': tag
                }).success(function () {
                    // TODO: move to seperate function and trigger event
                    machine.tags.pushObject(tag);
                }).error(function () {
                    Mist.notificationController.notify('Failed to add tag :' + tag);
                }).complete(function (success) {
                    that.set('addingTag', false);
                    if (that.callback) that.callback(success, tag);
                });
            },


            deleteTag: function (tag) {
                var that = this;
                var machine = this.machine;

                this.set('deletingTag', true);
                Mist.ajax.DELETE('clouds/' + machine.cloud.id + '/machines/' + machine.id + '/metadata', {
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
                this.set('machine', null);
                this.set('callback', null);
            }
        });
    }
);

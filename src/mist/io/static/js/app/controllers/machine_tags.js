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
            newTags: null,
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
                    newTags: machine.tags,
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

            addItem: function() {
                Ember.run(this, function() {
                    this.newTags.pushObject({
                        key: null,
                        value: null
                    });
                });                    
            },


            add: function () {
                if (this.formReady) {
                    var that = this,
                    machine = this.machine,
                    tags = [];

                    this.newTags.forEach(function(tag) {
                        if (tag.key) tags.push(tag);
                    });

                    console.log(tags);

                    //     this.set('addingTag', true);
                    //     Mist.ajax.POST('backends/' + machine.backend.id + '/machines/' + machine.id + '/tags', {
                    //         'tag': tag
                    //     }).success(function () {
                    //         // TODO: move to seperate function and trigger event
                    //         machine.tags.pushObject(tag);
                    //     }).error(function () {
                    //         Mist.notificationController.notify('Failed to add tag: ' + tag);
                    //     }).complete(function (success) {
                    //         that.setProperties({
                    //             addingTag: false,
                    //             newTag: null
                    //         });
                    //         if (that.callback) that.callback(success, tag);
                    //     });
                }
            },


            deleteTag: function (tag) {
                var that = this,
                machine = this.machine;

                this.newTags.removeObject(tag);

                // this.set('deletingTag', true);
                // Mist.ajax.DELETE('backends/' + machine.backend.id + '/machines/' + machine.id + '/tags/' + tag, {
                //     'tag': tag
                // }).success(function () {
                //     // TODO: move to seperate function and trigger event
                //     machine.tags.removeObject(tag);
                // }).error(function () {
                //     Mist.notificationController.notify('Failed to delete tag :' + tag);
                // }).complete(function (success) {
                //     that.set('deletingTag', false);
                //     if (that.callback) that.callback(success, tag);
                // });
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

             _clear: function () {
                this.setProperties({
                    machine: null,
                    newTags: null,
                    callback: null
                });
            },

            _updateTags: function() {
                if (this.machine) {
                    console.log(this.machine.tags);
                }
            },

            _updateFormReady: function() {
                var formReady = false;
                if (this.newTags && this.newTags.length) {
                    formReady = true;

                    if (formReady && this.addingTag) {
                        formReady = false;
                    }
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
            }.observes('newTags.[]'),

            tagsObserver: function() {
                Ember.run.once(this, '_updateTags');
            }.observes('machine.tags.[]')
        });
}
);

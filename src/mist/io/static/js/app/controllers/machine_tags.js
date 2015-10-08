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
                    tags = [], payload = [];

                    // create the final array with non-empty key-value pairs
                    this.newTags.forEach(function(tag) {
                        if (tag.key) {
                            tags.push(tag);

                            var newTag = {};
                            newTag[tag.key] = tag.value;
                            payload.push(newTag);
                        }
                    });

                    console.log(tags);
                    console.log(payload);

                    if (tags.length) {
                        Mist.ajax.POST('backends/' + machine.backend.id + '/machines/' + machine.id + '/tags', {
                            'tags': payload
                        })
                        .beforeSend(function() {
                            that.set('addingTag', true);
                        })
                        .success(function () {
                            that.close();
                        })
                        .error(function (message) {
                            Mist.notificationController.notify('Failed to add tags: ' + message);
                        })
                        .complete(function (success) {
                            that.setProperties({
                                addingTag: false
                            });
                            if (that.callback) that.callback(success, tag);
                        });
                    }
                }
            },


            deleteTag: function (tag) {
                this.newTags.removeObject(tag);
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
                    // logic to handle socket data
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
            }.observes('newTags.[]', 'addingTag'),

            tagsObserver: function() {
                Ember.run.once(this, '_updateTags');
            }.observes('machine.tags.[]')
        });
}
);

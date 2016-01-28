define('app/controllers/machine_tags', ['ember'],
    /**
     *  Machine Tags Controller
     *
     *  @returns Class
     */
     function () {
        return Ember.Object.extend({

            //
            // Properties
            //

             formReady: null,
             newTags: null,
             machine: null,
             callback: null,
             addingTag: null,
             deletingTag: null,


            //
            // Methods
            //

            open: function (machine, callback) {
                this._clear();
                this.setProperties({
                    machine: machine,
                    newTags: machine.tags.length ? machine.tags : [{key: null, value: null}],
                    callback: callback
                });
                this.newTags.removeArrayObserver(this.machine.tags);
                Ember.run.next(function () {
                    $('#machine-tags-popup').popup('open');
                });
            },


            close: function () {
                $('#machine-tags-popup').popup('close');
                this._clear();
            },


            addItem: function() {
                this.newTags.pushObject({
                    key: null,
                    value: null
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

                            // change format for API
                            var newTag = {};
                            newTag[tag.key] = tag.value;
                            payload.push(newTag);
                        }
                    });

                    that.set('addingTag', true);
                    Mist.ajax.POST('clouds/' + machine.cloud.id + '/machines/' + machine.id + '/tags', {
                        'tags': payload,
                        'replace': true
                    })
                    .success(function () {
                        that._updateTags(tags);
                        that.close();
                    })
                    .error(function (message) {
                        Mist.notificationController.notify('Failed to add tags: ' + message);
                    })
                    .complete(function (success) {
                        that.set('addingTag', false);
                        if (that.callback) that.callback(success, tag);
                    });
                }
            },

            // Delete tag's line for core
            deleteTagLine: function (tag) {
                this.newTags.removeObject(tag);
            },

            // Delete tag on server for io
            deleteTag: function (tag) {
                var that = this,
                machine = this.machine;

                if (this._containsKey(this.machine.tags, tag.key)) {
                    this.set('deletingTag', true);
                    payload = {}
                    if (tag.value){
                        payload["value"] = tag.value
                    }
                    Mist.ajax.DELETE('clouds/' + machine.cloud.id + '/machines/' + machine.id + '/tags/' + tag.key, payload)
                    .success(function () {
                        that._removeDeletedTag(tag);
                    })
                    .error(function (message) {
                        Mist.notificationController.notify('Failed to delete tag: ' + message);
                    })
                    .complete(function (success) {
                        that.set('deletingTag', false);
                        if (that.callback) that.callback(success, tag);
                    });
                } else {
                    this.deleteTagLine(tag);
                }
            },


            //
            // Pseudo-Private Methods
            //

             _clear: function () {
                this.setProperties({
                    machine: null,
                    newTags: null,
                    callback: null
                });
            },

            _containsKey: function (collection, key) {
                var exists = false;
                collection.forEach(function(tag) {
                    if(tag.key == key) {
                        exists = true;
                    }
                });
                return exists;
            },

            _updateTags: function (tags) {
                Ember.run(this, function () {
                    this.get('machine').set('tags', tags);
                    this.set('newTags', tags);
                });
            },

            _removeDeletedTag: function (tag) {
                Ember.run(this, function () {
                    this.deleteTagLine(tag);
                    this.get('machine').set('tags', this.newTags);
                });
            },

            _updateFormReady: function() {
                var formReady = false, tagsKeys = [], error = false;
                if (this.newTags) {
                    for (var i = 0, len = this.newTags.length; i < len; i++) {
                        var tag = this.newTags[i];
                        if (tag.key) {
                            // create an array with keys and check for duplicates
                            if (tagsKeys.indexOf(tag.key) == -1) {
                                tagsKeys.push(tag.key);
                            } else {
                                error = true;
                                Mist.notificationController.notify('You cannot add tags with the same key!');
                                break;
                            }
                        }

                        // check if pair with just value and without key exists
                        if (!tag.key && tag.value) {
                            error = true;
                            Mist.notificationController.notify('You cannot add tags without key!');
                            break;
                        }
                    }

                    if (error) {
                        formReady = false;
                    } else {
                        formReady = true;
                    }

                    if (formReady && this.addingTag) {
                        formReady = false;
                    }
                }

                this.set('formReady', formReady);
            },

            //
            // Observers
            //

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newTags.@each.key', 'newTags.@each.value', 'addingTag')
        });
}
);

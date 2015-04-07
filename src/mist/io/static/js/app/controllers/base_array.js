define('app/controllers/base_array', ['ember'],
    //
    //  Base Array Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            loading: true,
            passOnProperties: [],


            //
            //
            //  Computed Properties
            //
            //


            selectedObjects: function () {
                return this.filterBy('selected', true);
            }.property('@each.selected'),


            //
            //
            //  Public Methods
            //
            //


            setContent: function (content) {
                content = !!content ? content : [];
                this._passOnProperties(content);
                this._updateContent(content);
                this.set('loading', false);
            },


            getObject: function (id) {
                return this.findBy('id', id);
            },


            objectExists: function (id) {
                return !!this.getObject(id);
            },


            //
            //
            //  Private Methods
            //
            //


            _passOnProperties: function (content) {
                this.get('passOnProperties').forEach(function (property) {
                    content.setEach(property, this.get(property));
                }, this);
            },


            _updateContent: function (content) {
                Ember.run(this, function () {
                    // Remove deleted objects
                    this.forEach(function (object) {
                        if (!content.findBy('id', object.id))
                            this._deleteObject(object);
                    }, this);

                    // Update existing objects or add new ones
                    content.forEach(function (object) {
                        if (this.objectExists(object.id)) {
                            this._updateObject(object);
                        } else {
                            this._addObject(object);
                        }
                    }, this);

                    this.trigger('onChange', {
                        objects: this
                    });
                });
            },


            _addObject: function (object) {
                Ember.run(this, function () {
                    if (!this.objectExists(object.id)) {
                        var newObject = this.get('model').create(object);
                        this.pushObject(newObject);
                        this.trigger('onAdd', {
                            object: newObject
                        });
                    }
                });
            },


            _deleteObject: function (object) {
                Ember.run(this, function () {
                    this.removeObject(object);
                    this.trigger('onDelete', {
                        object: object
                    });
                });
            },


            _updateObject: function (object) {
                Ember.run(this, function () {
                    this.getObject(object.id).update(object);
                    this.trigger('onUpdate', {
                        object: object
                    });
                });
            },


            //
            //
            //  Observers
            //
            //


            selectedObserver: function () {
                Ember.run.once(this, function () {
                    this.trigger('onSelectedChange', {
                        objects: this.get('selectedObjects')
                    });
                });
            }.observes('@each.selected')
        })
    }
);

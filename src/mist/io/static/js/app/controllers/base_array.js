define('app/controllers/base_array', ['ember'],
    //
    //  Base Array Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {

            //
            //  Properties
            //

            loading: true,
            passOnProperties: [],
            model: [],


            //
            //  Computed Properties
            //

            selectedObjects: function () {
                return this.model.filterBy('selected', true);
            }.property('model.@each.selected'),


            //
            //  Public Methods
            //

            setModel: function (model) {
                model = !!model ? model : [];
                this._passOnProperties(model);
                this._updateModel(model);
                this.set('loading', false);
            },

            getObject: function (id) {
                return this.model.findBy('id', id);
            },

            objectExists: function (id) {
                return !!this.getObject(id);
            },


            //
            //  Private Methods
            //

            _passOnProperties: function (model) {
                this.get('passOnProperties').forEach(function (property) {
                    model.setEach(property, this.get(property));
                }, this);
            },

            _updateModel: function (model) {
                Ember.run(this, function () {
                    // Remove deleted objects
                    this.model.forEach(function (object) {
                        if (!model.findBy('id', object.id))
                            this._deleteObject(object);
                    }, this);

                    // Update existing objects or add new ones
                    model.forEach(function (object) {
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
                        var newObject = this.get('baseModel').create(object);
                        this.model.pushObject(newObject);
                        this.trigger('onAdd', {
                            object: newObject
                        });
                    }
                });
            },

            _deleteObject: function (object) {
                Ember.run(this, function () {
                    this.model.removeObject(object);
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
            }.observes('model.@each.selected')
        })
    }
);

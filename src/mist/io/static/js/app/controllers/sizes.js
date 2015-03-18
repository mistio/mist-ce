define('app/controllers/sizes', ['app/models/size'],
    //
    //  Sizes Controller
    //
    //  @returns Class
    //
    function (Size) {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            content: null,
            loading: null,
            cloud: null,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('content', []);
                this.set('loading', true);
            },


            //
            //
            //  Methods
            //
            //


            load: function (sizes) {
                this._updateContent(sizes);
                this.set('loading', false);
            },


            getSize: function (sizeId) {
                return this.content.findBy('id', sizeId);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _updateContent: function (sizes) {
                Ember.run(this, function () {

                    // Remove deleted sizes
                    this.content.forEach(function (size) {
                        if (!sizes.findBy('id', size.id))
                            this.content.removeObject(size);
                    }, this);

                    sizes.forEach(function (size) {

                        var oldSize = this.getSize(size.id);

                        if (oldSize)
                            // Update existing sizes
                            forIn(size, function (value, property) {
                                oldSize.set(property, value);
                            });
                        else
                            // Add new sizes
                            this._addSize(size);
                    }, this);

                    this.trigger('onSizeListChange');
                });
            },


            _addSize: function (size) {
                Ember.run(this, function () {
                    this.content.addObject(Size.create(size));
                    this.trigger('onSizeAdd');
                });
            },


            _deleteSize: function (sizeId) {
                Ember.run(this, function () {
                    this.content.removeObject(this.getSize(sizeId));
                    this.trigger('onSizeDelete');
                });
            }
        });
    }
);

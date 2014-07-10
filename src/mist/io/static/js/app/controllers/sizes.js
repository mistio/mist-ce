define('app/controllers/sizes', ['app/models/size'],
    /**
     *  Sizes Controller
     *
     *  @returns Class
     */
    function (Size) {
        return Ember.ArrayController.extend(Ember.Evented, {

            /**
             *  Properties
             */

            content: [],
            loading: null,
            backend: null,

            /**
             *
             *  Initialization
             *
             */

            load: function (sizes) {
                if (!this.backend.enabled) return;
                this._setContent(sizes);
                this.set('loading', true);
            },



            /**
             *
             *  Methods
             *
             */

            clear: function () {
                Ember.run(this, function () {
                    this.set('content', []);
                    this.set('loading', false);
                    this.trigger('onSizeListChange');
                });
            },


            getSize: function (sizeId) {
                return this.content.findBy('id', sizeId);
            },



            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _setContent: function (sizes) {
                var that = this;
                Ember.run(function () {
                    that.set('content', []);
                    sizes.forEach(function (size) {
                        that.content.pushObject(Size.create(size));
                    });
                    that.trigger('onSizeListChange');
                });
            }
        });
    }
);

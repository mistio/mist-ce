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

            load: function () {

                if (!this.backend.enabled) return;

                var that = this;
                this.set('loading', true);
                Mist.ajax.GET('/backends/' + this.backend.id + '/sizes', {
                }).success(function (sizes) {
                    if (!that.backend.enabled) return;
                    that._setContent(sizes || []);
                }).error(function () {
                    if (!that.backend.enabled) return;
                    Mist.notificationController.notify('Failed to load sizes for ' + that.backend.title);
                    that.backend.set('enabled', false);
                }).complete(function (success) {
                    if (!that.backend.enabled) return;
                    that.set('loading', false);
                    that.trigger('onLoad');
                });
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

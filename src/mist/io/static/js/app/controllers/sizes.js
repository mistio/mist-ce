define('app/controllers/sizes', [
    'app/models/size',
    'ember',
    'jquery'
    ],
    /**
     * Sizes Controller
     *
     * @returns Class
     */
    function(Size) {
        return Ember.ArrayController.extend({

            content: [],
            backend: null,

            init: function() {
                this._super();
                
                if (!this.backend.enabled) {
                    return;
                }
                
                this.backend.set('loadingSizes', true);
                var that = this;
                $.getJSON('/backends/' + this.backend.id + '/sizes', function(data) {
                    that.backend.set('loadingSizes', false);
                    if (that.backend.enabled) {
                        var content = new Array();
                        data.forEach(function(size) {
                            content.push(Size.create(size));
                        });
                        that.set('content', content);
                    }
                }).error(function() {
                    Mist.notificationController.notify('Error loading sizes for backend: ' + that.backend.title);
                    that.backend.set('loadingSizes', false);
                    that.backend.set('enabled', false);
                });
            }
        });
    }
);

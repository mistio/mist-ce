define('app/controllers/keys', [
    //'app/models/key',
    'ember',
    'jquery'
    ],
    /**
     * Keys controller
     *
     *
     * @returns Class
     */
    function(Key) {
        return Ember.ArrayController.extend({
            
            keyCount: 0,
            
            init: function() {
                this._super();
/* TODO load keys
                var that = this;
                $.getJSON('/backends/' + this.backend.index + '/images', function(data) {
                    var content = new Array();
                    data.forEach(function(item){
                        item.backend = that.backend;
                        content.push(Image.create(item));
                    });
                    that.set('content', content);
                }).error(function() {
                    Mist.notificationController.notify("Error loading images for backend: " + that.backend.title);
                });
*/
            }
        });
    }
);

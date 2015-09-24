define('app/views/page', [],
    //
    //  Page View
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.View.extend({
            init: function () {
                this._super();
                Ember.run.scheduleOnce('afterRender', this, function() {
                    var element = this.$();
                    if (element)
                        element.enhanceWithin();
                });
            }
        });
    }
);

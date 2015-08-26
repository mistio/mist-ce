define('app/views/page', ['app/views/templated'],
    //
    //  Page View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return Ember.View.extend({
            init: function () {
                this._super();
                Ember.run.scheduleOnce('afterRender', this, function() {
                    $('body').enhanceWithin();
                });
            }
        });
    }
);

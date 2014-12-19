define('app/models/image', ['ember'],
    //
    // Image Model
    //
    // @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({

            id: null,
            star: null,
            name: null,
            extra: null,

            toggle: function (callback) {
                this.backend.toggleImageStar(this, callback);
            },

            className: function () {
                return 'image-' + this.backend.images.getImageOS(this.get('id'));
            }.property('id'),
        });
    }
);

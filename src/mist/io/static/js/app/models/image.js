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

            isMist: function () {
                return this.get('name').indexOf('mist') > -1 ||
                    this.get('id').indexOf('mist') > -1;
            }.property('name', 'id'),

            isDocker: function () {
                return this.get('backend').get('isDocker');
            }.property('backend')
        });
    }
);

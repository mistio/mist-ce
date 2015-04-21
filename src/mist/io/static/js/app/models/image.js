define('app/models/image', ['app/models/base'],
    //
    // Image Model
    //
    // @returns Class
    //
    function (BaseModel) {

        'use strict';

        return BaseModel.extend({

            star: null,
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

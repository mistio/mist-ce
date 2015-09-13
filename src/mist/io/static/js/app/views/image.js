define('app/views/image', ['app/views/page'],
    //
    //  Image View
    //
    //  @returns Class
    //
    function(PageView) {

        'use strict';

        return App.ImageView = PageView.extend({

            //
            //  Properties
            //

            templateName: 'image',

            model: null,

        });
    }
);
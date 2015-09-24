define('app/views/missing', ['app/views/page'],
    //
    //  Missing View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return App.MissingView =  PageView.extend({
            templateName: 'missing'
        });

    }
);

define('app/views/script_add', ['app/views/panel'],
    //
    //  Script Add View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return PanelView.extend({

            isReady: function () {
                var script = Mist.scriptAddController.get('newScript');
                return script.get('name').length && script.get('url').length;
            }.property(
                'Mist.scriptAddController.newScript.name',
                'Mist.scriptAddController.newScript.url'
            )
        });
    }
);

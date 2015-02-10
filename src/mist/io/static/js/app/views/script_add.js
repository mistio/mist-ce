define('app/views/script_add', ['app/views/panel'],
    //
    //  Script Add View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return PanelView.extend({

            load: function () {
                Mist.p = this;
                info(this.get('panelId'));
            }.on('didInsertElement')
        });
    }
);

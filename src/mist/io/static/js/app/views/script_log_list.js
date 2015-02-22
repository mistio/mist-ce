define('app/views/script_log_list', ['app/views/log_list'],
    //
    //  Script Log List View
    //
    //  @returns Class
    //
    function (LogListView) {

        'use strict';

        return App.ScriptLogListView = LogListView.extend({

            filterString: Ember.computed.alias('controller.model.id'),

            search: function () {
                if (this.get('filterString') === undefined)
                    return;
                this._super();
            }
        });
    }
);

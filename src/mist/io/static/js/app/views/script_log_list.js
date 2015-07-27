define('app/views/script_log_list', ['app/views/log_list'],
    //
    //  Script Log List View
    //
    //  @returns Class
    //
    function (LogListView) {

        'use strict';

        return App.ScriptLogListView = LogListView.extend({

            templateName: 'script_log_list',

            filterString: Ember.computed.alias('controller.model.id'),

            extraParams: Ember.Object.create({
              script_id: ''
            }),

            search: function () {
                if (this.get('filterString') === undefined)
                    return;
                this.get('extraParams').set('script_id', this.get('filterString'));
                this._super();
            }
        });
    }
);

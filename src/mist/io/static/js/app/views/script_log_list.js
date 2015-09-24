define('app/views/script_log_list', ['app/views/log_list'],
    //
    //  Script Log List View
    //
    //  @returns Class
    //
    function (LogListComponent) {

        'use strict';

        return App.ScriptLogListComponent = LogListComponent.extend({

            layoutName: 'script_log_list',

            filterString: '',

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

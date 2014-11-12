define('app/views/log_list_item', ['app/views/list_item'],
    //
    //  Log List Item View
    //
    //  @returns Class
    //
    function (ListItemView) {

        'use strict';

        return ListItemView.extend({


            //
            //
            //  Properties
            //
            //


            log: null,


            //
            //
            //  Methods
            //
            //


            updateCheckbox: function () {
                var element = $('#' + this.elementId + ' input.ember-checkbox');
                Ember.run.next(this, function () {
                    if (element.checkboxradio) {
                        element.checkboxradio()
                               .checkboxradio('refresh');
                    }
                });
            },


            //
            //
            //  Observers
            //
            //


            logSelectedObserver: function () {
                Ember.run.once(this, 'updateCheckbox');
            }.observes('log.selected')
        });
    }
);

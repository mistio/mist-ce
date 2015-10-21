define('app/views/script_list_item', ['app/views/list_item'],
    //
    //  Script List Item View
    //
    //  @returns Class
    //
    function (ListItemComponent) {

        'use strict';

        return App.ScriptListItemComponent = ListItemComponent.extend({

            layoutName: 'script_list_item',

            updateCheckbox: function () {
                var element = $('#' + this.elementId + ' input.ember-checkbox');
                Ember.run.next(this, function () {
                    if (element.checkboxradio) {
                        element.checkboxradio()
                               .checkboxradio('refresh');
                    }
                });
            },

            selectedObserver: function () {
                Ember.run.once(this, 'updateCheckbox');
            }.observes('script.selected')
        });
    }
);

define('app/views/team_list_item', ['app/views/list_item'],
    //
    //  Team List Item View
    //
    //  @returns Class
    //
    function (ListItemComponent) {

        'use strict';

        return App.TeamListItemComponent = ListItemComponent.extend({

            layoutName: 'team_list_item',

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
            }.observes('team.selected')
        });
    }
);

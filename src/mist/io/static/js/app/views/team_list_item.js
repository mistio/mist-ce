define('app/views/team_list_item', ['app/views/list_item'],
    //
    //  Team List Item View
    //
    //  @returns Class
    //
    function (ListItemComponent) {

        'use strict';

        return App.TeamListItemComponent = ListItemComponent.extend({

            //
            //  Properties
            //

            layoutName: 'team_list_item',
            team: null,

            //
            //  Computed Properties
            //

            membersText: Ember.computed('team.members.[]', function() {
                console.log(this.get('team'));
                var len = this.get('team.members').length;
                return len + (len > 1 ? ' Members' : ' Member');
            }),

            //
            //  Methods
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
            //  Observers
            //

            selectedObserver: function () {
                Ember.run.once(this, 'updateCheckbox');
            }.observes('team.selected')
        });
    }
);

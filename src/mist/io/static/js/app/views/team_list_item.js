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
            classNameBindings: ['isDisabled'],

            //
            //  Computed Properties
            //

            membersText: Ember.computed('team.members.[]', function() {
                var len = this.get('team.members').length;
                return len + (len == 1 ? ' Member' : ' Members');
            }),

            isDisabled: Ember.computed('team.isOwners', function() {
                return this.get('team.isOwners');
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

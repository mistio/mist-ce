define('app/views/team_add', ['app/views/controlled'],
    //
    //  Script Add View
    //
    //  @returns Class
    //
    function (ControlledComponent) {

        'use strict';

        return App.TeamAddComponent = ControlledComponent.extend({

            //
            //  Properties
            //

            layoutName: 'team_add',
            controllerName: 'teamAddController',

            //
            //  Computed Properties
            //

            isReady: Ember.computed('Mist.teamAddController.newTeam.name', 'Mist.teamsController.model', function () {
                var newName = Mist.teamAddController.newTeam.name,
                isUnique = Mist.teamsController.model.every(function(team) {
                    return team.name != newName;
                })

                return newName && isUnique;
            }),

            load: function () {
               Ember.run.next(function(){
                   $( "#add-team" ).collapsible({
                       expand: function(event, ui) {
                           Mist.teamAddController.open();

                           var id = $(this).attr('id'),
                           overlay = id ? $('#' + id + '-overlay') : false;
                           if (overlay) {
                               overlay.removeClass('ui-screen-hidden').addClass('in');
                           }
                       }
                   });
               });
            }.on('didInsertElement'),


            unload: function () {
               Ember.run.next(function(){
                   $( "#add-team" ).collapsible({
                       collapse: function(event, ui) {
                           Mist.teamAddController.close();

                           var id = $(this).attr('id'),
                           overlay = id ? $('#' + id + '-overlay') : false;
                           if (overlay) {
                               overlay.removeClass('in').addClass('ui-screen-hidden');
                           }
                       }
                   });
               });
            }.on('willDestroyElement'),

            //
            //  Methods
            //

            clear: function () {

            },

            //
            //  Actions
            //

            actions: {
                clickOverlay: function() {
                    $('#add-team').collapsible('collapse');
                },

                backClicked: function () {
                    Mist.teamAddController.close();
                },

                addClicked: function () {
                    if (this.get('isReady')) {
                        Mist.teamAddController.add();
                    }
                }
            },
        });
    }
);

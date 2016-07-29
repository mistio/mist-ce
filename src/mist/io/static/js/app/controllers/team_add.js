define('app/controllers/team_add', ['ember'],
    //
    //  Team Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            newTeam: Ember.Object.create({
                name: '',
                description: ''
            }),


            open: function () {
                this.clear();
                this.view.clear();
            },


            add: function () {
                var that = this;
                Mist.teamsController.addTeam({
                    team: that.get('newTeam'),
                    callback: function (success) {
                        if (success) {
                            $('#add-team').collapsible('collapse');
                            Ember.run.next(function() {
                                $('body').enhanceWithin();
                            })
                        }
                    }
                })
            },


            close: function () {
                this.clear();
                this.view.clear();
            },


            clear: function () {
                this.get('newTeam').setProperties({
                    name: '',
                    description: ''
                });
            }
        });
    }
);

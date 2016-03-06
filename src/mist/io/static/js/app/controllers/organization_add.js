define('app/controllers/organization_add', ['ember'],
    //
    //  Organization Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            newOrganization: Ember.Object.create({
                name: '',
                description: ''
            }),


            open: function () {
                this.clear();
                this.view.clear();
            },


            add: function () {
                var that = this;
                Mist.organizationsController.addOrganization({
                    organization: that.get('newOrganization'),
                    callback: function (success) {
                        if (success) {
                            $('#add-organization').collapsible('collapse');
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
                this.get('newOrganization').setProperties({
                    name: '',
                    description: ''
                });
            }
        });
    }
);

define('app/controllers/organization_add', ['ember'],
    //
    //  Organization Add Controller
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({

            newOrganization: Ember.Object.create({
                name: ''
            }),
            formReady: false,


            open: function() {
                this.clear();
                this.view.open();
            },


            add: function() {
                if (this.get('formReady')) {
                    var that = this;
                    Mist.organizationsController.addOrganization({
                        organization: that.get('newOrganization'),
                        callback: function(success) {
                            if (success) {
                                that.close();
                                Ember.run.next(function() {
                                    $('body').enhanceWithin();
                                })
                            }
                        }
                    })
                }
            },

            addFirst: function() {
                if (this.get('formReady')) {
                    var that = this;
                    Mist.organizationsController.addFirstOrganization({
                        organization: that.get('newOrganization')
                    });
                }
            },

            close: function() {
                this.clear();
                this.view.close();
            },

            clear: function() {
                this.get('newOrganization').setProperties({
                    name: ''
                });
                this.set('formReady', false);
            },

            _updateFormReady: function() {
                this.set('formReady', !!this.get('newOrganization.name'));
            },

            //
            // Observers
            //

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newOrganization.name'),

            teamsObserver: function() {
                Ember.run.once(this, function() {
                    // Organization is not set yet
                    if (! Object.keys(Mist.organization).length) {
                        this.set('newOrganization.name', FIRST_NAME.trim().toLowerCase() + '-' + LAST_NAME.trim().toLowerCase());
                    }
                });
            }.observes('Mist.teamsController.model'),
        });
    }
);

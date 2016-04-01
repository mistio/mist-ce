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
        });
    }
);

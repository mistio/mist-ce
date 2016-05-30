define('app/controllers/organization_edit', ['ember'],
    //
    //  Organization Edit Controller
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            newName: '',
            formReady: null,
            organization: Ember.computed('Mist.organization', function() {
                return Mist.organization;
            }),
            newName: Ember.computed('Mist.organization', function() {
                return Mist.organization.name;
            }),

            //
            //  Methods
            //

            // open: function(organization) {
            //     this.setProperties({
            //         organization: organization,
            //         newName: organization.name
            //     });
            //     this._updateFormReady();
            //     this.view.open();
            // },

            // close: function() {
            //     this.view.close();
            // },

            save: function() {
                if (this.formReady) {
                    var that = this;
                    Mist.organizationsController.renameOrganization({
                        organization: this.get('organization'),
                        newName: this.get('newName'),
                        callback: function(success) {
                            if (success)
                                that.close();
                        }
                    });
                }
            },

            //
            // Private Methods
            //

            _updateFormReady: function() {
                var formReady = false;
                if (this.organization && (this.newName != this.organization.name)) {
                    formReady = true;
                }
                this.set('formReady', formReady);
            },

            //
            //  Observers
            //

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newName')
        });
    }
);

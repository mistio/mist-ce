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

            formReady: true,
            organization: Ember.computed(function() {
                return Mist.organization;
            }),
            newName: Ember.computed(function() {
                return FIRST_NAME.toLowerCase() + '-' + LAST_NAME.toLowerCase() + '-' + this._randomString(6);
            }),

            //
            //  Methods
            //

            save: function() {
                if (this.formReady) {
                    var that = this;
                    Mist.organizationsController.renameOrganization({
                        organization: this.get('organization'),
                        newName: this.get('newName')
                    });
                }
            },

            //
            // Private Methods
            //

            _updateFormReady: function() {
                var formReady = true;
                if (!this.get('newName') || (this.get('newName') == this.get('organization.name'))) {
                    formReady = false;
                }
                this.set('formReady', formReady);
            },

            _randomString: function(length) {
                var result = '',
                    chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                for (var i = length; i > 0; --i) {
                    result += chars[Math.floor(Math.random() * chars.length)];
                }
                return result;
            },

            //
            //  Observers
            //

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newName', 'organization.name')
        });
    }
);

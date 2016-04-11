define('app/controllers/organizations', ['app/models/organization', 'ember'],
    //
    //  Organizations Controller
    //
    // @returns Class
    //
    function(Organization) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {

            //
            // Properties
            //

            model: null,

            //
            //  Initialization
            //

            init: function () {
                this._super();
                this.set('model', null);
                this.set('loading', true);
            },

            //
            // Methods
            //

            load: function(organization) {
                this._updateModel(organization);
                this.set('loading', false);
            },

            addOrganization: function(args) {
                var that = this;
                that.set('addingOrganization', true);
                Mist.ajax
                    .POST('/org', {
                        'name': args.organization.name
                    })
                    .success(function(organization) {
                        that._addOrganization(organization);
                    })
                    .error(function(message) {
                        Mist.notificationController.notify(message);
                    })
                    .complete(function(success) {
                        that.set('addingOrganization', false);
                        if (args.callback)
                            args.callback(success);
                    });
            },

            _addOrganization: function(organization) {
                Mist.orgs.pushObject({
                    id: organization.id,
                    name: organization.name
                });

                Ember.run.later(function() {
                    Mist.dialogController.open({
                        type: DIALOG_TYPES.OK_CANCEL,
                        head: 'Organization Created',
                        body: [{
                            paragraph: 'Switch to organization "' + organization.name + '"?'
                        }],
                        callback: function(didConfirm) {
                            if (didConfirm) {
                                window.location.href = '/switch_context/' + organization.id;
                            }
                        }
                    });
                }, 100);
            },

            _updateModel: function(organization) {
                var organizationModel = Organization.create(organization);
                this.set('model', organizationModel);
            },

            _renderFields: function() {
                Ember.run.scheduleOnce('afterRender', this, function() {
                    $('body').enhanceWithin();
                });
            },
        });
    }
);

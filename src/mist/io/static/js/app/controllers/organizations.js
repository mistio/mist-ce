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
                        console.log(organization);
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
                this._updateModel(organization);
                this.trigger('onOrganizationAdd');

                // This is a very bad implementation
                // try to emit an event and run this
                // in teams controller
                var teams = [{
                    id: -1,
                    name: 'Owners',
                    description: '',
                    members: [{
                        id: -1,
                        name: Mist.firstName && Mist.lastName ? Mist.firstName + ' ' + Mist.lastName : Mist.email,
                        email: Mist.email
                    }],
                    policy: {}
                }];

                Mist.teamsController.setModel(teams);
                this._renderFields();
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

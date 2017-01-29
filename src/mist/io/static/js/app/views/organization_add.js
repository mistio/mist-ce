define('app/views/organization_add', ['app/views/popup'],
    //
    //  Script Add View
    //
    //  @returns Class
    //
    function(PopupComponent) {

        'use strict';

        return App.OrganizationAddComponent = PopupComponent.extend({

            //
            //  Properties
            //

            layoutName: 'organization_add',
            controllerName: 'organizationAddController',
            popupId: '#organization-add',

            //
            //  Computed Properties
            //

            isReady: Ember.computed('Mist.organizationAddController.newOrganization.name', function() {
                return !!Mist.organizationAddController.newOrganization.name;
            }),

            //
            //  Actions
            //

            actions: {
                backClicked: function() {
                    Mist.organizationAddController.close();
                },

                addClicked: function() {
                    Mist.organizationAddController.add();
                }
            }
        });
    }
);

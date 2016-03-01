define('app/controllers/organizations', ['app/controllers/base_array', 'app/models/organization'],
    //
    //  Οrganizations Controller
    //
    //  @returns Class
    //
    function (BaseArrayController, OrganizationModel) {

        'use strict';

        return BaseArrayController.extend({

            baseModel: OrganizationModel,

            getOrganization: function(organizationId) {
                return this.model.findBy('id', organizationId);
            },

            getRequestedOrganization: function() {
                if (this.organizationRequest) {
                    return this.getObject(this.organizationRequest);
                }
            }
        });
    }
);

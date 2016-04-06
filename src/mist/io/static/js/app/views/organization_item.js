define('app/views/organization_item', ['ember'],
    //
    //  Organization Item Component
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return App.OrganizationItemComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'organization_item',
            tagName: 'li',
            organization: null,
            classNames: ['organization-item'],
            classNameBindings: ['orgActive'],

            //
            // Computed Properties
            //

            orgActive: Ember.computed('organization', 'Mist.organization', function() {
                return !Mist.organization.id && this.get('organization.id') == '' || Mist.organization.id == this.get('organization.id');
            })
        });
    }
)

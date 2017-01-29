define('app/models/policy_rule', ['app/models/base'],
    //
    //  Policy Rule Model
    //
    //  @returns Class
    //
    function(BaseModel) {

        'use strict';

        return BaseModel.extend({
            id: null,
            operator: null,
            action: null,
            rtype: null,
            rid: null,
            rtags: {},

            //
            // Computed Properties
            //

            identification: Ember.computed('rid', 'rtags', function() {
                var rid = this.get('rid'),
                    rtags = this.get('rtags');

                if (rid) {
                    return 'where id';
                }

                if (Object.keys(rtags).length) {
                    return 'where tags';
                }

                return '...';
            }),

            isID: Ember.computed('identification', function() {
                return this.get('identification') == 'id';
            }),

            tagsText: Ember.computed('isID', 'rtags', function() {
                var rtags = this.get('rtags'),
                    tagsStr = '';

                if (Object.keys(rtags).length) {
                    for (var el in rtags) {
                        tagsStr += el;
                        if (rtags[el]) {
                            tagsStr += '=' + rtags[el];
                        }
                        tagsStr += ',';
                    }

                    return tagsStr.substr(0, tagsStr.length - 1);
                }

                return '';
            }),

            init: function() {
                var rtype = this.get('rtype'),
                action = this.get('action');
                this.set('rtype', rtype === '' ? 'all' : rtype);
                this.set('action', action === '' ? 'all' : action);
            }
        });
    }
);

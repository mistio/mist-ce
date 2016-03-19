define('app/models/policy_rule', ['app/models/base'],
    //
    //  Policy Rule Model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use strict';

        return BaseModel.extend({
            id: null,
            operator: null,
            action: null,
            rtype: null,
            rid: null,
            rtags: {},

            identification: Ember.computed('rid', 'rtags', function() {
                var rid = this.get('rid'),
                    rtags = this.get('rtags');

                if (rid) {
                    return 'id';
                }

                if (Object.keys(rtags).length) {
                    return 'tags';
                }

                return 'id';
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
            })
        });
    }
);

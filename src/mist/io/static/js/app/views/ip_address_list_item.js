define('app/views/ip_address_list_item', ['app/views/list_item'],
    //
    //  IP Address List Item View
    //
    //  @returns Class
    //
    function (ListItemView) {

        'use strict'

        return ListItemView.extend({

            tagName: 'tr',
            domID: function () {
                return '_' + this.get('model').get('id').replace(/\./g, '');
            }.property('controller.model.id'),

            actions: {

                reservedToggled: function () {

                    var ip = this.get('model');
                    var $select = this.$().find('select').parent();
                    $select.addClass('ui-state-disabled');
                    ip.reserve({
                        reserve: !ip.reserved,
                        callback: function (success) {
                            if (!success)
                                $select.val(ip.reserved ? "on" : "off").slider('refresh');
                            $select.removeClass('ui-state-disabled');
                        }
                    });
                },

                assignClicked: function () {
                    var ip = this.get('model');
                    this.get('parentView').get('parentView').set('selectedIp', ip);
                    $('#assign-machine')
                        .popup('option', 'positionTo', '#' + this.get('domID'))
                        .find('.ui-listview').listview('refresh');
                    Ember.run.next(function () {
                        $('#assign-machine').popup('open');
                    });
                }
            }
        });
    }
);

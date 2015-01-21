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
                    /*
                    var ip = this.get('model');
                    ip.get('parentView').set('selectedIp', ip);
                    $('#assign-machine').popup('reposition', {
                        positionTo: this.$().find('.assign-network-btn');
                    }).find('.ui-listview').listview('refresh');
                    Ember.run.next(function () {
                        $('#assign-machine').popup('open');
                    });*/
                }
            }
        });
    }
);

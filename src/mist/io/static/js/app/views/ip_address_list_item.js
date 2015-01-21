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
                    var $this = this.$();
                    var $select = $this.find('select')
                    $select.parent().addClass('ui-state-disabled');

                    var that =  this;
                    ip.reserve({
                        reserve: !ip.reserved,
                        callback: function (success) {
                            if (!success) {
                                $select.val(ip.reserved ? "on" : "off").slider('refresh');
                            }
                            $select.parent().removeClass('ui-state-disabled');
                        }
                    });
                }
            }
        });
    }
);

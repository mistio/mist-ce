define('app/views/ip_address_list_item', ['app/views/list_item'],
    //
    //  IP Address List Item View
    //
    //  @returns Class
    //
    function (ListItemComponent) {

        'use strict'

        return App.IpAddressListItemComponent = ListItemComponent.extend({

            layoutName: 'ip_address_list_item',
            tagName: 'tr',
            pendingToggle: null,
            domID: function () {
                return this.get('model') && '_' + this.get('model').ipaddress.replace(/\./g, '');
            }.property(),

            updateReservedToggle: function (reserved) {
                this.set('pendingToggle', true);
                this.$().find('select').val(
                    this.get('model').get('reserved') ? "on" : "off"
                ).slider('refresh');
            },


            actions: {
                reservedToggled: function () {
                    if (this.get('pendingToggle')) {
                        this.set('pendingToggle', false);
                        return;
                    }
                    var ip = this.get('model');
                    var that = this;
                    ip.get('network').get('cloud').get('networks').reserveIP({
                        reserve: !ip.reserved,
                        callback: function (success) {
                            if (!success)
                                that.updateReservedToggle();
                        },
                        network: ip.get('network'),
                        ip: ip
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
            },


            reservedObserver: function () {
                Ember.run.once(this, 'updateReservedToggle');
            }.observes('model.reserved')
        });
    }
);

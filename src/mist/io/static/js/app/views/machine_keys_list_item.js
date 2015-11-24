define('app/views/machine_keys_list_item', ['app/views/list_item'],
    /**
     *  Machine Keys List Item View
     *
     *  @returns Class
     */
    function(ListItemComponent) {
        return App.MachineKeysListItemComponent = ListItemComponent.extend({

            layoutName: 'machine_keys_list_item',
            tagName: 'span',
            keyIcon: null,

            load: function() {
                Ember.run.next(this, function() {
                    this.keyObserver();
                })
            }.on('didInsertElement'),

            keyObserver: function() {
                var machineToFind = this.key.probing ?
                                    this.key.probing :
                                    Mist.machineKeysController.get('machine');

                if (!machineToFind) return;

                var that = this;
                this.key.machines.some(function(machine) {
                    if (machine[1] == machineToFind.id &&
                        machine[0] == machineToFind.cloud.id) {
                            if (that.key.probing) {
                                that.set('keyIcon', 'probing');
                            } else if (machine[2] > 0) {
                                that.set('keyIcon', 'probed');
                            } else {
                                that.set('keyIcon', 'unprobed');
                            }
                            return true;
                    }
                });
            }.observes('this.key.probing', 'this.key.machines'),

            actions: {
                associatedKeyClicked: function (key) {
                    this.get('parentView').set('selectedKey', key);
                    $('#key-actions-popup').popup('open');
                }
            }
        });
    }
);

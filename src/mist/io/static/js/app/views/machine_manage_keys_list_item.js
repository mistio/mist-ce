define('app/views/machine_manage_keys_list_item', [
    'text!app/templates/machine_manage_keys_list_item.html',
    'ember'
    ],
    /**
     * Machine Manage Keys List Item View
     *
     * @returns Class
     */
    function(machine_manage_keys_list_item_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(machine_manage_keys_list_item_html),

            keyIcon: null,

            didInsertElement: function() {
                this.keyObserver();
            },

            keyObserver: function() {
                var machineToFind = this.key.probing ?
                                    this.key.probing :
                                    this.get('parentView').get('parentMachine');
                var that = this;
                this.key.machines.some(function(machine) {
                    if (machine[1] == machineToFind.id &&
                        machine[0] == machineToFind.backend.id) {
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

            keyClicked: function() {
                $('#key-actions').popup('open');
                this.get('parentView').set('selectedKey', this.key);
            }
        });
    }
);

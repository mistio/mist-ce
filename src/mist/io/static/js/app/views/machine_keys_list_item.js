define('app/views/machine_keys_list_item', ['app/views/list_item', 'text!app/templates/machine_keys_list_item.html'],
    /**
     *  Machine Keys List Item View
     *
     *  @returns Class
     */
    function(ListItemView, machine_keys_list_item_html) {
        return ListItemView.extend({

            template: Ember.Handlebars.compile(machine_keys_list_item_html),

            tagName: 'span',
            keyIcon: null,

            load: function() {
                this.keyObserver();
            }.on('didInsertElement'),

            keyObserver: function() {
                var machineToFind = this.key.probing ?
                                    this.key.probing :
                                    Mist.machineKeysController.get('machine');
                
                if (!machineToFind) return;
                
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
            },

            actions: {
                associatedKeyClicked: function (key) {
                    this.get('parentView').set('selectedKey', key);
                    $('#key-actions-popup').popup('open');
                },
            }
        });
    }
);

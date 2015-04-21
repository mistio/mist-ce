define('app/views/machine_list_item', ['app/views/list_item'],
    /**
     *  Machine List Item View
     *
     *  @returns Class
     */
    function (ListItemView) {
        return App.MachineListItemView = ListItemView.extend({

            /**
             *  Properties
             */

            machine: null,

            /**
             *
             *  Methods
             *
             */

            updateCheckbox: function () {
                var element = $('#' + this.elementId + ' input.ember-checkbox');
                Ember.run.next(this, function () {
                    if (element.checkboxradio) {
                        element.checkboxradio()
                               .checkboxradio('refresh');
                    }
                });
            },

            monitoringIcon: function() {
                if (this.machine.hasMonitoring){
                    if (this.machine.get('hasOpenIncident'))
                        return 'ui-icon-alert';
                    return 'ui-icon-check';
                }
                return 'ui-icon-none';
            }.property('machine.hasMonitoring', 'machine.hasOpenIncident'),


            /**
             *
             *  Actions
             *
             */

            actions: {


                disassociateGhostMachine: function () {

                    // This method is called ONLY from inside the
                    // single key view. That is why we get the parent
                    // view to get "keyId"
                    var keyId = this.get('parentView').get('key').get('id');
                    var machine = this.machine;

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Disassociate machine',
                        body: [
                            {
                                paragraph: 'Are you sure you want to disassociate ' +
                                    machine.name + ' ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                Mist.keysController.disassociateKey(keyId, machine);
                            }
                        }
                    });
                }
            },


            /**
             *
             *  Observers
             *
             */

            machineSelectedObserver: function () {
                Ember.run.once(this, 'updateCheckbox');
            }.observes('machine.selected'),
        });
    }
);

define('app/views/machine_list_item', ['app/views/list_item'],
    /**
     *  Machine List Item View
     *
     *  @returns Class
     */
    function (ListItemComponent) {
        return App.MachineListItemComponent = ListItemComponent.extend({

            /**
             *  Properties
             */
            layoutName: 'machine_list_item',
            machine: null,
            classNameBindings: ['machineState', 'monitoringIcon'],


            /**
             *  Computed Properties
             */

            machineState: function() {
                return this.machine.get('state');
            }.property('machine.state'),

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
            }.observes('machine.selected')
        });
    }
);

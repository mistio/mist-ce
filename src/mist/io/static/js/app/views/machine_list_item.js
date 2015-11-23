define('app/views/machine_list_item', ['app/views/list_item'],
    /**
     *  Machine List Item View
     *
     *  @returns Class
     */
    function (ListItemComponent) {
        return App.MachineListItemComponent = ListItemComponent.extend({

            //
            //  Properties
            //
            layoutName: 'machine_list_item',
            machine: null,
            classNameBindings: ['machineState', 'monitoringState', 'monitoringTooltip'],


            //
            //  Computed Properties
            //

            machineState: function() {
                return this.machine.get('state');
            }.property('machine.state'),

            monitoringState: function() {
                if (this.machine.hasMonitoring){
                    if (this.machine.get('hasOpenIncident'))
                        return 'has-incident';
                    return 'has-monitoring';
                }
                return 'no-monitoring';
            }.property('machine.hasMonitoring', 'machine.hasOpenIncident'),

            monitoringTooltip: function() {
                if (this.machine.hasMonitoring){
                    if (this.machine.get('hasOpenIncident'))
                        return 'Machine has Incident'; 
                    return 'Monitoring state is good';
                }
                return 'Monitoring not enabled';
            }.property('machine.hasMonitoring', 'machine.hasOpenIncident'),


            //
            //  Methods
            //

            updateCheckbox: function () {
                var element = $('#' + this.elementId + ' input.ember-checkbox');
                Ember.run.next(this, function () {
                    if (element.checkboxradio) {
                        element.checkboxradio()
                               .checkboxradio('refresh');
                    }
                });
            },


            //
            //  Actions
            //

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


            //
            //  Observers
            //

            machineSelectedObserver: function () {
                Ember.run.once(this, 'updateCheckbox');
            }.observes('machine.selected')
        });
    }
);

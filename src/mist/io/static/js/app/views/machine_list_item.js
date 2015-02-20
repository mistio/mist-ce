define('app/views/machine_list_item', ['app/views/list_item'],
    /**
     *  Machine List Item View
     *
     *  @returns Class
     */
    function (ListItemView) {
        return ListItemView.extend({

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
            	if (this.machine.hasMonitoring)
            		return 'ui-icon-check';
            	else
            		return 'ui-icon-alert';
            }.property('machine.hasMonitoring'),


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

                    Mist.confirmationController.set('title', 'Disassociate machine');
                    Mist.confirmationController.set('text', 'Are you sure you want to disassociate ' + machine.name + ' ?');
                    Mist.confirmationController.set('callback', function () {
                        Mist.keysController.disassociateKey(keyId, machine);
                    });
                    Mist.confirmationController.show();
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

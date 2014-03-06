define('app/views/machine_keys', ['app/views/templated','ember'],
    /**
     *  Machine Keys View
     * 
     *  @returns Class
     */
    function(TemplatedView) {
        return TemplatedView.extend({

            /**
             * 
             *  Properties
             * 
             */

            selectedKey: null,


            /**
             * 
             *  Initialization
             * 
             */

            load: function () {

                // Send view to controller
                var viewId = $('#machine-keys-panel').parent().attr('id');
                Mist.machineKeysController.set('view', Ember.View.views[viewId]);

            }.on('didInsertElement'),


            unload: function () {

                // Remove view from controller
                Mist.machineKeysController.set('view', null);

            }.on('willDestroyElement'),


            /**
             * 
             *  Methods
             * 
             */

            renderNonAssocatedKeys: function () {
                Ember.run.next(function () {
                    $('#non-associated-keys-popup .ui-listview').listview('refresh');
                });
            },


            /**
             * 
             *  Actions
             * 
             */

            actions: {


                associateClicked: function () {
                    $('#non-associated-keys-popup').popup('open');
                },

                customAssociateClicked: function(){
                    var machinesCtrl = Mist.machineKeysController;
                    $("#machine-userPort-popup").popup('close');
                    // Possible change this to selected key TODO check
                    machinesCtrl.associate(machinesCtrl.lastAssocKey,null,machinesCtrl.user,machinesCtrl.port);
                },


                nonAssociatedKeyClicked: function (key) {
                    $('#non-associated-keys-popup').popup('close');
                    Mist.machineKeysController.associate(key);

                    // In case user associates key from "Add key" button
                    $('#machine-keys-panel').panel('open');
                },

                
                newKeyClicked: function() {
                    $('#non-associated-keys-popup').popup('close');
                    Ember.run.later(function() {
                        Mist.keyAddController.open(function(success, key) {
                            if (success) {
                                Mist.machineKeysController.associate(Mist.keysController.getKey(key.id));
            
                                // In case user associates key from "Add key" button
                                $('#machine-keys-panel').panel('open');
                            }
                        });
                    }, 300);
                },


                removeClicked: function () {
                    Mist.machineKeysController.disassociate(this.selectedKey);
                    $('#key-actions-popup').popup('close');
                },


                probeClicked: function () {
                    Mist.machineKeysController.probe(this.selectedKey);
                    $('#key-actions-popup').popup('close');
                },


                cancelClicked: function () {
                    this.set('selectedKey', null);
                    $('#key-actions-popup').popup('close');
                },


                backClicked: function () {
                    Mist.machineKeysController.close();
                }
            },


            /**
             * 
             *  Observers
             * 
             */

             nonAssociatedKeysObserver: function () {
                 Ember.run.once(this, 'renderNonAssocatedKeys');
             }.observes('Mist.machineKeysController.nonAssociatedKeys')
        });
    }
);

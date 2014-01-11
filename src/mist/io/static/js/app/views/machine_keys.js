define('app/views/machine_keys', ['text!app/templates/machine_keys.html', 'ember'],
    /**
     *  Machine Keys View
     * 
     *  @returns Class
     */
    function(machine_keys_html) {
        return Ember.View.extend({

            /**
             * 
             *  Properties
             * 
             */

            selectedKey: null,
            template: Ember.Handlebars.compile(machine_keys_html),


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


                nonAssociatedKeyClicked: function (key) {
                    $('#non-associated-keys-popup').popup('close');
                    Mist.machineKeysController.associate(key);

                    // In case user associates key from "Add key" button
                    $('#machine-keys-panel').panel('open');
                },


                associatedKeyClicked: function (key) {
                    this.set('selectedKey', key);
                    $('#key-actions-popup').popup('open');
                },


                removeClicked: function () {
                    Mist.machineKeysController.disassociate(this.selectedKey);
                },


                probeClicked: function () {
                    Mist.machineKeysController.probe(this.selectedKey);
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

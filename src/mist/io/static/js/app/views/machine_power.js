define('app/views/machine_power', ['text!app/templates/machine_power.html', 'ember'],
    /**
     *  Machine Power View
     *
     *  @returns Class
     */
    function (machine_power_html) {
        return Ember.View.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(machine_power_html),


            /**
             *
             *  Initialization
             *
             */

            load: function () {

                // Add event listeners
                Mist.machinePowerController.on('onActionsChange', this, 'renderActions');

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.machinePowerController.off('onActionsChange', this, 'renderActions');

            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

            renderActions: function () {
                Ember.run.next(function () {
                    $('#machine-power-popup').trigger('create');
                });
            },


            /**
             *
             *  Actions
             *
             */

            actions: {


                actionClicked: function (action) {
                    Mist.machinePowerController.act(action);
                },


                backClicked: function () {
                    Mist.machinePowerController.close();
                }
            }
        });
    }
);

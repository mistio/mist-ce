define('app/views/machine_power', ['text!app/templates/machine_power.html', 'ember'],
    /**
     *  Machine Power Popup
     *
     *  @returns Class
     */
    function(machine_power_html) {
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

            init: function() {
                this._super();
                Mist.machinePowerController.on('onActionsChange', this, 'renderActions');
            },



            /**
             * 
             *  Methods
             * 
             */

            renderActions: function() {
                Ember.run.next(function() {
                    $('#machine-power-popup').trigger('create');
                });
            },



            /**
             * 
             *  Actions
             * 
             */

            actions: {

                actionClicked: function(action) {
                    info(action);
                    Mist.machinePowerController.act(action);
                },

                backClicked: function() {
                    Mist.machinePowerController.close();
                }
            }
        });
    }
);
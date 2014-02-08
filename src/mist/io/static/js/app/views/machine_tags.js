define('app/views/machine_tags', ['ember'],
    /**
     *  Machine Tags View
     *
     *  @returns Class
     */
    function () {
        return Ember.View.extend({

            /**
             *  Properties
             */

            template: getTemplate('machine_tags'),


            /**
             * 
             *  Actions
             *
             */

            actions: {


                addClicked: function () {
                    Mist.machineTagsController.add();
                },


                backClicked: function () {
                    Mist.machineTagsController.close();
                }
            }
        });
    }
);

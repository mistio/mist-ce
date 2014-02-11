define('app/views/machine_tags', ['app/views/templated', 'ember'],
    /**
     *  Machine Tags View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return TemplatedView.extend({

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

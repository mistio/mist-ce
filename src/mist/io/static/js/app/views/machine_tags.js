define('app/views/machine_tags', ['app/views/templated'],
    /**
     *  Machine Tags View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return App.MachineTagsView = TemplatedView.extend({

            templateName: 'machine_tags',

            //
            //  Actions
            //

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

define('app/views/machine_tags_list_item', ['app/views/list_item'],
    /**
     *  Machine Tags List Item View
     *
     *  @returns Class
     */
    function (ListItemComponent) {
        return App.MachineTagsListItemComponent = ListItemComponent.extend({

            //
            //  Properties
            //

            layoutName: 'machine_tags_list_item',
            tag: null,
            tagName: 'div',


            //
            //  Actions
            //

            actions: {
                deleteClicked: function () {
                    Mist.machineTagsController.deleteTagLine(this.tag);
                    //if (Mist.isCore) {
                    //    Mist.machineTagsController.deleteTagLine(this.tag);
                    //} else {
                    //    Mist.machineTagsController.deleteTag(this.tag);
                    //}
                }
            }
        });
    }
);

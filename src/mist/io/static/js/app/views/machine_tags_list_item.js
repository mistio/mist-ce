define('app/views/machine_tags_list_item', ['app/views/list_item'],
    /**
     *  Machine Tags List Item View
     *
     *  @returns Class
     */
    function (ListItemView) {
        return App.MachineTagsListItemView = ListItemView.extend({

            /**
             *  Properties
             */

            templateName: 'machine_tags_list_item',
            tag: null,
            tagName: 'span',


            /**
             *
             *  Actions
             *
             */

            actions: {


                deleteClicked: function () {
                    Mist.machineTagsController.deleteTag(this.tag);
                }
            }
        });
    }
);

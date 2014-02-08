define('app/views/machine_tags_list_item', ['app/views/list_item'],
    /**
     *  Machine Tags List Item View
     *
     *  @returns Class
     */
    function (ListItemView) {
        return ListItemView.extend({

            /**
             *  Properties
             */

            tag: null,
            tagName: 'span',
            template: getTemplate('machine_tags_list_item'),


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

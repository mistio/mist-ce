define('app/views/machine_tags_list_item', ['app/views/list_item', 'text!app/templates/machine_tags_list_item.html'],
    /**
     *  Machine Tags List Item View
     *
     *  @returns Class
     */
    function (ListItemView, machine_tags_list_item_html) {
        return ListItemView.extend({

            /**
             *  Properties
             */

            tag: null,
            tagName: 'span',
            template: Ember.Handlebars.compile(machine_tags_list_item_html),


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

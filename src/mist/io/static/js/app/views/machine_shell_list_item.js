define('app/views/machine_shell_list_item', ['app/views/list_item', 'text!app/templates/machine_shell_list_item.html'],
    /**
     *  Machine Shell List Item View
     *
     *  @returns Class
     */
    function (ListItemView, machine_shell_list_item_html) {
        return ListItemView.extend({

            /**
             *  Properties
             */

            command: {},
            tagName: 'span',
            template: Ember.Handlebars.compile(machine_shell_list_item_html),


            /**
             *
             *  Actions
             *
             */

            actions: {


            }
        });
    }
);

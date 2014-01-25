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
             *  Initialization
             *
             */

            load: function () {
                var that = this;
                Ember.run.later(function() {
                    var element = $('#'+ that.elementId);
                    element.find('.ui-btn').on('click', function () {
                        if (element.find('.shell-li-header').hasClass('ui-collapsible-collapsed')) {
                            that.get('parentView').openCommand(element);
                        }
                    })
                    that.get('parentView').openCommand(element);
                }, 300);
            }.on('didInsertElement'),

            unload: function() {
                $('#'+ this.elementId).find('.ui-btn').off('click');
            }.on('willDestroyElement'),


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

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

                // Add event for collapsible click
                // 
                // In machine shell view, when a user expands a collapsible
                // we need to collapse all the others except the one clicked
                // by the user. To accomplish that, we add an event handler on
                // the collapsible's header (this is where the user "clicks")
                // and notify the parent view (machine shell view) that a
                // collapsible was clicked. The parent view will close every
                // other collapsible except this one
                var that = this;
                Ember.run.later(function () {

                    var element = $('#' + that.elementId);
                    element.find('h3').on('click', function () {

                        var arrow = element.find('.shell-li-arrow');
                        var output = element.find('.output');

                        // Notify parent only if user is about to expand (open) the collapsible
                        if (output.css('display') == 'none') {
                            that.get('parentView').openCommand(element);
                            Ember.run.later(function() {
                                output.slideDown(200);
                                arrow.removeClass('ui-icon-carat-d').addClass('ui-icon-carat-u');
                            }, 500);
                        } else {
                            output.slideUp(200);
                            arrow.removeClass('ui-icon-carat-u').addClass('ui-icon-carat-d');
                        }
                    });

                    // Automatically close all other collapsibles
                    // when new command is created
                    that.get('parentView').openCommand(element);

                }, 300);

            }.on('didInsertElement'),

            unload: function () {

                // Remove click event handler
                $('#' + this.elementId).find('.ui-btn').off('click');

            }.on('willDestroyElement')
        });
    }
);

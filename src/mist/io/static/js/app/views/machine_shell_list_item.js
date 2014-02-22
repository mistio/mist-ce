define('app/views/machine_shell_list_item', ['app/views/list_item'],
    /**
     *  Machine Shell List Item View
     *
     *  @returns Class
     */
    function (ListItemView) {
        return ListItemView.extend({

            /**
             *  Properties
             */

            command: {},
            tagName: 'span',


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
                var element = $('#' + this.elementId);   
                this.get('parentView').openCommand(element);          
            }.on('didInsertElement'),

            actions: {             
                toggleCommand: function() {
                    var element = $('#' + this.elementId);                
                    var arrow = element.find('.shell-li-arrow');
                    var output = element.find('.output');
    
                    // Notify parent only if user is about to expand (open) the collapsible
                    if (output.css('display') == 'none') {
                        this.get('parentView').openCommand(element);
                        output.slideDown(200);
                        arrow.removeClass('ui-icon-carat-r').addClass('ui-icon-carat-d');
                    } else {
                        output.slideUp(200);
                        arrow.removeClass('ui-icon-carat-d').addClass('ui-icon-carat-r');
                    }  
                    this.get('parentView').openCommand(element);          
                }
            }
        });
    }
);

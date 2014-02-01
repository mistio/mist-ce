define('app/views/machine_shell', ['text!app/templates/machine_shell.html', 'ember'],
    /**
     * Machine Shell View
     *
     * @returns Class
     */
    function(machine_shell_html, Command) {
        return Ember.View.extend({

            /**
             *  Properties
             */
            
            template: Ember.Handlebars.compile(machine_shell_html),
    
            /**
             *
             *  Methods
             *
             */

            openCommand: function(target) {
                var elements = $('#shell-return .ember-view');
                for (var e = 0; e < elements.length; ++e) {
                    if (elements.eq(e).attr('id') != target.attr('id')) {
                        elements.eq(e).find('.output').hide();
                    }
                }
            },

            /**
             * 
             *  Actions
             * 
             */
    
            actions: {
               
               
                submitClicked: function() {
                    Mist.machineShellController.submit();
                },
                
                backClicked: function() {
                    Mist.machineShellController.close();
                }
            }
        });
    }
);


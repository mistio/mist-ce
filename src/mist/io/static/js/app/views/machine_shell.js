define('app/views/machine_shell', ['ember'],
    /**
     * Machine Shell View
     *
     * @returns Class
     */
    function() {
        return Ember.View.extend({

            /**
             *  Properties
             */
            
            template: getTemplate('machine_shell'),
    
            /**
             *
             *  Methods
             *
             */

            openCommand: function(target) {
                var elements = $('#shell-return .ember-view');
                for (var e = 0; e < elements.length; ++e) {
                    if (elements.eq(e).attr('id') != target.attr('id')) {
                        elements.eq(e).find('.output').slideUp(200);
                        elements.eq(e).find('.shell-li-arrow').removeClass('ui-icon-carat-u').addClass('ui-icon-carat-d');
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


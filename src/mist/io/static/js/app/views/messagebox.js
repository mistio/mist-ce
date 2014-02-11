define('app/views/messagebox', ['app/views/templated', 'ember'],
    /**
     * Message Box Dialog
     *
     * @returns Class
     */
    function(TemplatedView) {
        return TemplatedView.extend({

            actions: {
                
                
                closeMessage: function() {
                    
                    $('#message-box-popup').popup('close');
                    var controller = Mist.notificationController;
                    if (controller.msgCallback) {
                        controller.msgCallback();
                    }
                    controller.set('msgHeader', '');
                    controller.set('msgPart1', '');
                    controller.set('msgPart2', '');
                    controller.set('msgPart3', '');
                    controller.set('msgPart4', '');
                    controller.set('msgLink', '');
                    controller.set('msgHref', '');
                    controller.set('msgCallback', null);
                },
            },

            /**
             * 
             *  Observers
             * 
             */
            
            hrefObserver: function() {
                // Baaaaad :(
                $('#message-box-popup #message-link').attr('href', Mist.notificationController.msgHref);
            }.observes('Mist.notificationController.msgHref')
        });
    }
);

define('app/views/messagebox', [
    'text!app/templates/messagebox.html',
    'ember'
        ],
    /**
     * Message Box Dialog
     *
     * @returns Class
     */
    function(messagebox_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(messagebox_html),
            
            closeMessage: function() {
                
                $('#message-box').popup('close');
                var controller = Mist.notificationController;
                if (controller.msgCallback) {
                    controller.msgCallback();
                }
                controller.set('msgHeader', '');
                controller.set('msgPart1', '');
                controller.set('msgPart2', '');
                controller.set('msgPart3', '');
                controller.set('msgPart4', '');
                controller.set('msgCallback', null);
            },
        });
    }
);

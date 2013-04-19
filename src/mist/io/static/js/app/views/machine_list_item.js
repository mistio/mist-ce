define('app/views/machine_list_item', [
    'text!app/templates/machine_list_item.html','ember'],
    /**
     *
     * Machine List Item View
     *
     * @returns Class
     */
    function(machine_list_item_html) {
        return Ember.View.extend({
                tagName:false,

                didInsertElement: function(){
                    $('#machines-list').listview('refresh');
                    $("#machines-list").trigger('create');
                },

                machineSelected: function(){
                    log('selected changed');
                    
                    var len = 0;
                    
                    Mist.backendsController.forEach(function(backend) {
                        backend.machines.forEach(function(machine) {
                            if (machine.selected){
                        	len++;
                            }
                        });
                    });
                    
                    if (len > 1) {
                        $('.machines-footer').fadeIn(140);
                        $('.machines #footer-console').addClass('ui-disabled');
                    } else if (len == 1) {
                        $('.machines-footer').fadeIn(140);
                        $('.machines #footer-console').removeClass('ui-disabled');
                    } else {
                        $('.machines-footer').fadeOut(200);
                    }
                    
                }.observes('machine.selected'),

                template: Ember.Handlebars.compile(machine_list_item_html),
        });

    }
);

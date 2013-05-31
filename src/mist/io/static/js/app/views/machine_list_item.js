                    //setTimeout(function(){

                    //},10);

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
                    var selector = '#' + this.machine.id + ' span.monitoring-icon';

                    var d = new Date();
                    var n = d.getTime()/1000 - 3600;
                    var mac_id = this.machine.id
                    var bac_id = this.machine.backend.id
                    var uri = URL_PREFIX + '/backends/' + bac_id + '/machines/' + mac_id + '/loadavg.png?time=' + n;
                    setInterval(function(){
                        var bgimage = new Image();
                        bgimage.src = uri;
                        bgimage.onload = function () {
                           $(selector).css('background-image', 'url(' + bgimage.src + ')');
                        };
                        warn(uri);
                        d = new Date();
                        n = d.getTime()/1000 - 3600;
                        uri = URL_PREFIX + '/backends/' + bac_id + '/machines/' + mac_id + '/loadavg.png?time=' + n;
                    },3*60*1000);

                },

                machineSelected: function(){
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

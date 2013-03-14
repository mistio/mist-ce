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

                    var that = this;

                    Em.run.next(function() {

                        try {
                            that.get('parentView').$().find("ul").listview('refresh');
                        } catch(e) {

                            try {
                                if($('.ui-page-active').attr('id') == 'machines'){
                                    that.get('parentView').$().find("ul").listview();
                                }
                            } catch(e) {
                                error('could not create listview');
                                error(e);
                            }
                        }
                    });
                },

                machineClick: function(){
                    log('machine clicked');

                    /*
                    if(event.target.tagName != 'A'){
                        if(event.target.tagName == 'INPUT'){
                            event.stopPropagation();
                            var $this = $(event.target);

                            $this.checkboxradio("refresh");

                            var len = $('#machines-list input:checked').length;

                            if (len > 0) {
                                $('#machines .machines-footer').fadeIn(140);

                            } else {
                                $('#machines .machines-footer').fadeOut(200);
                            }
                            return;
                        }
                    }
                    */
                    Mist.set('machine', this.machine);
                    $.mobile.changePage("#single-machine");
                },

                machineSelected: function(){
                    log('selected changed');

                    var that = this;

                    Em.run.next(function() {
                        try {
                            that.get('parentView').$().find("input[type='checkbox']").checkboxradio('refresh');
                        } catch (e) {
                            if (that.get('parentView') != null) {
                              that.get('parentView').$().find("input[type='checkbox']").checkboxradio();
                            }
                        }

                        var len = $('#machines-list input:checked').length; //FIXME use data instead of DOM
                        if (len > 1) {
                            $('#machines .machines-footer').fadeIn(140);
                            $('.machines #footer-console').addClass('ui-disabled');
                            Mist.set('machine', null);
                        } else if (len == 1) {
                            $('#machines .machines-footer').fadeIn(140);
                            $('.machines #footer-console').removeClass('ui-disabled');
                            
                            Mist.backendsController.forEach(function(backend) {
                                backend.machines.forEach(function(machine) {
                                    if (machine.selected && Mist.machine != machine) {
                                        Mist.set('machine', machine);
                                    }
                                });
                            });
                        } else {
                            $('#machines .machines-footer').fadeOut(200);
                            Mist.set('machine', null);
                        }
                    });

                }.observes('machine.selected'),

                template: Ember.Handlebars.compile(machine_list_item_html),
        });

    }
);

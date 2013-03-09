define('app/views/key_machine_list_item', [
    'text!app/templates/key_machine_list_item.html','ember'],
    /**
     *
     * Machine List Item View
     *
     * @returns Class
     */
    function(key_machine_list_item_html) {
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

                machineClick: function(event, el){
                    log('machine clicked');
                    if ($(event.target).parent().find("input[type='checkbox']").is(':checked')) {
                        $(event.target).parent().find("input[type='checkbox']").attr("checked",false).checkboxradio("refresh"); 
                    } else {
                        $(event.target).parent().find("input[type='checkbox']").attr("checked",true).checkboxradio("refresh"); 
                    }
                    event.stopPropagation();
                    var len = $('#machines-list input:checked').length;
                    Mist.set('machine', this.machine);
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
                            Mist.set('machine', null);
                        } else if (len == 1) {                            
                            Mist.backendsController.forEach(function(backend) {
                                backend.machines.forEach(function(machine) {
                                    if (machine.selected && Mist.machine != machine) {
                                        Mist.set('machine', machine);
                                    }
                                });
                            });
                        } else {
                            Mist.set('machine', null);
                        }
                    });

                }.observes('machine.selected'),

                init: function() {
                    this._super();
                    // cannot have template in home.pt as pt complains
                    this.set('template', Ember.Handlebars.compile(key_machine_list_item_html));
                },
        });

    }
);

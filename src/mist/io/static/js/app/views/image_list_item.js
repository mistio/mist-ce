define('app/views/image_list_item', [
    'text!app/templates/image_list_item.html','ember'],
    /**
     *
     * Image List Item View
     *
     * @returns Class
     */
    function(image_list_item_html) {
        return Ember.View.extend({
                tagName:false,

                didInsertElement: function(){

                    var that = this;

                    Em.run.next(function() {

                        try {
                            that.get('parentView').$().find("ul").listview('refresh');
                        } catch(e) {
                            try {
                                that.get('parentView').$().find("ul").listview();
                            } catch(e) {

                            }
                        }
                    });
                },

                createMachine: function(){
                    $.mobile.changePage('#dialog-add', 'pop', true, true);
                    Mist.machineAddController.set("newMachineBackend", this.image.backend);
                    Mist.machineAddController.set("newMachineImage", this.image);
                },

                init: function() {
                    this._super();
                    // cannot have template in home.pt as pt complains
                    this.set('template', Ember.Handlebars.compile(image_list_item_html));
                },
        });

    }
);

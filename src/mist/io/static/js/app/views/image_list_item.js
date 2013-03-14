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
                tagName:'li',

                didInsertElement: function(){
                    $('#images-list').listview('refresh');
                },

                click: function(){
                    $.mobile.changePage('#dialog-add', 'pop', true, true);
                    Mist.machineAddController.set("newMachineBackend", this.image.backend);
                    Mist.machineAddController.set("newMachineImage", this.image);
                    Ember.run.next(function(){
                        $('#createmachine-select-image').selectmenu('refresh');
                        $('#createmachine-select-provider').selectmenu('refresh');
                    });
                },

                template: Ember.Handlebars.compile(image_list_item_html),
        });

    }
);

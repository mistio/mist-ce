define('app/views/image_list_item', ['text!app/templates/image_list_item.html','ember'],
    /**
     *  Image List Item View
     *
     *  @returns Class
     */
    function(image_list_item_html) {
        return Ember.View.extend({
                
                image: null,
                tagName:'li',
                template: Ember.Handlebars.compile(image_list_item_html),
                
                actions: {

                    toggleImageStar: function() {
                        this.image.backend.toggleImageStar(this.image.id);
                    },

                    launchImage: function(){
                        var AddView = Mist.MachineAddView.create();
                        AddView.selectProvider(this.image.backend);
                        AddView.selectImage(this.image);
                        $('#images .dialog-add').panel('open');
                    }
                }    
        });
    }
);

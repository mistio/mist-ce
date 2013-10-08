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
                
                starImage: function() {
                    var payload = {
                        'action': 'star'
                    };
                    var backend_id = this.image.backend.id
                    var image_id = this.image.id;
                    $.ajax({
                        url: '/backends/' + backend_id + '/images/' + image_id,
                        type: "POST",
                        data: JSON.stringify(payload),
                        contentType: "application/json",
                        headers: { "cache-control": "no-cache" },
                        dataType: "json"
                    });    
                },
                
                didInsertElement: function(){
                    $('#images-list').listview('refresh');
                    try{
                        $('#images-list .ember-checkbox').checkboxradio();    
                    } catch(e){}
                    
                },

                launchImage: function(){
                    var AddView = Mist.MachineAddView.create();
                    AddView.selectProvider(this.image.backend);
                    AddView.selectImage(this.image);
                    $('#images .dialog-add').panel('open');
                },

                template: Ember.Handlebars.compile(image_list_item_html),
        });

    }
);

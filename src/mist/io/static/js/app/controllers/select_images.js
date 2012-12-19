define('app/controllers/select_images', [
    'ember'
    ],
    /**
     * Selected images controller
     *
     * @returns Class
     */
    function() {
        return Ember.ArrayController.extend({
            _content: [{name: 'All', id: 'all'},
                      { name: 'None', id: 'none'}],
            selection: null,

            //if only this would work...
            backendsChanged: function(){
                var content = new Array();

                this._content.forEach(function(item){
                    content.push({name: item.name, id: item.id});
                });

                Mist.backendsController.forEach(function(item){
                    content.push({name: item.title, id: item.provider});
                });

                //this.contentWillChange();
                this.set('content', content);
                //this.contentDidChange();
            }.observes('Mist.backendsController.@each'),

            selectionChanged: function(){

                var selection = this.selection.id;

                if(selection == 'none'){
                    Mist.backendsController.forEach(function(backend){
                        backend.images.forEach(function(image){
                            image.set('hidden', true);
                        });
                    });
                } else if(selection == 'all'){
                    Mist.backendsController.forEach(function(backend){
                        backend.images.forEach(function(image){
                            image.set('hidden', false);
                        });
                    });
                } else {
                    Mist.backendsController.forEach(function(backend){
                        if(backend.provider == selection){
                            backend.images.forEach(function(image){
                                image.set('hidden', false);
                            });
                        } else {
                            backend.images.forEach(function(image){
                                image.set('hidden', true);
                            });
                        }
                    });
                }
            }.observes('selection'),

            init: function() {
                this._super();
            }
        });
    }
);

define('app/controllers/select_machines', [
    'ember'
    ],
    /**
     * Selected machines controller
     *
     * @returns Class
     */
    function() {
        return Ember.ArrayController.extend({

            _content: [{name: 'All', id: 'all'},
                      { name: 'None', id: 'none'}],

            backendsChanged: function(){
                log("backends changed");
                var content = new Array();

                this._content.forEach(function(item){
                    content.push({name: item.name, id: item.id});
                });

                Mist.backendsController.forEach(function(item){
                    content.push({name: item.title, id: item.provider});
                });

                this.set('content', content);
            }.observes('Mist.backendsController.@each')
        });
    }
);

define('app/views/machine_key_list_item', [
    'text!app/templates/machine_key_list_item.html',
    'ember'
    ],
    /**
     *
     * Key List Item View
     *
     * @returns Class
     */
    function(machine_key_list_item_html) {
        return Ember.View.extend({

                tagName:false,

                keyClick: function(event, el){
                    log('key clicked');

                    Mist.set('key', this.key);
                },

                keyDisassociate: function(event, el){
                    //TODO: turn parent to listview and refresh it properly
                    console.log(this.key.name);
                    console.log([Mist.machine.backend.id, Mist.machine.id]);
                    Mist.keysController.disassociateKey(this.key, [Mist.machine.backend.id, Mist.machine.id]);
                },

                init: function() {
                    this._super();
                    // cannot have template in home.pt as pt complains
                    this.set('template', Ember.Handlebars.compile(machine_key_list_item_html));
                },
        });

    }
);

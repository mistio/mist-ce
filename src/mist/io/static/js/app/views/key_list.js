define('app/views/key_list', [
     'app/views/mistscreen',
    'text!app/templates/key_list.html',
    'ember'
    ],
    /**
     *
     * Key List View
     *
     * @returns Class
     */
    function(MistScreen, key_list_html) {
        return MistScreen.extend({
            
            template: Ember.Handlebars.compile(key_list_html),
            
            init: function() {
                this._super();
            },
            
            createKeyClicked: function() {
               $("#dialog-add-key").popup("open", {transition: 'pop'});
            },

            setDefaultKey: function() {
                var key = this.getSelectedKey();
                Mist.keysController.setDefaultKey(key.name);
            },

            deleteClicked: function() {
                var key = this.getSelectedKey();
                Mist.confirmationController.set('title', 'Delete key');
                Mist.confirmationController.set('text', 'Are you sure you want to delete ' + key.name +'?');
                Mist.confirmationController.set('callback', function() {
                    Mist.keysController.deleteKey(key.name);                
                });
                Mist.confirmationController.set('fromDialog', true);
                Mist.confirmationController.show();
            },

            getSelectedKey: function() {
                for (var i = 0; i < Mist.keysController.keys.length; ++i) {
                    var key = Mist.keysController.keys[i];
                    if (key.selected) {
                        return key;
                    }
                }
            }
        });
    }
);

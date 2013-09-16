define('app/views/key_list', [
     'app/views/mistscreen',
    'text!app/templates/key_list.html',
    'ember'
    ],
    /**
     * Key List View
     *
     * @returns Class
     */
    function(MistScreen, key_list_html) {
        return MistScreen.extend({

            template: Ember.Handlebars.compile(key_list_html),

            selectedKey: null,

            selectedKeysObserver: function() {
                var selectedKeysCount = 0;
                var that = this;
                Mist.keysController.keys.forEach(function(key) {
                    if (key.selected) {
                        selectedKeysCount++;
                        that.selectedKey = key;
                    }
                });
                if (selectedKeysCount == 0) {
                    $('#keys-footer').fadeOut(200);
                }
                else if (selectedKeysCount == 1) {
                    $('#keys-footer').fadeIn(200);
                    $('#keys-footer a').removeClass('ui-disabled');
                } else {
                    $('#keys-footer a').addClass('ui-disabled');
                }
            }.observes('Mist.keysController.keys.@each.selected'),

            createClicked: function() {
               $("#create-key-dialog").popup("open");
            },

            selectClicked: function() {
                $('#select-keys-dialog').popup('open');
            },

            selectModeClicked: function(mode) {
                Mist.keysController.keys.forEach(function(key){
                    key.set('selected', mode);
                });
                Ember.run.next(function(){
                    $("input[type='checkbox']").checkboxradio("refresh");
                });
                $('#select-keys-dialog').popup('close');
            },

            deleteClicked: function() {
                var that = this;
                Mist.confirmationController.set('title', 'Delete key');
                Mist.confirmationController.set('text', 'Are you sure you want to delete "' + that.selectedKey.name +'" ?');
                Mist.confirmationController.set('callback', function() {
                    Mist.keysController.deleteKey(that.selectedKey.name);                
                });
                Mist.confirmationController.set('fromDialog', true);
                Mist.confirmationController.show();
            },
            
            setDefaultClicked: function() {
                Mist.keysController.setDefaultKey(this.selectedKey.name);
            }
        });
    }
);

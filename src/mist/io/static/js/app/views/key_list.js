define('app/views/key_list', ['app/views/mistscreen', 'text!app/templates/key_list.html'],
    /**
     *  Key List View
     * 
     *  @returns Class
     */
    function(MistScreen, key_list_html) {
        return MistScreen.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(key_list_html),

            /**
             * 
             *  Initialization
             * 
             */

            init: function() {
                this._super();
                Mist.keysController.on('onKeyListChange', this, 'renderKeyList');
                Mist.keysController.on('onSelectedKeysChange', this, 'updateFooter');
            },


            load: function() {
                Ember.run(this, function() {
                    this.renderKeyList();
                    this.updateFooter();
                });
            }.on('didInsertElement'),



            /**
             * 
             *  Methods
             * 
             */

            renderKeyList: function() {
                Ember.run.next(function() {
                    if ($('#key-list-page .ui-listview').listview) {
                        $('#key-list-page .ui-listview').listview('refresh');
                    }
                    if ($('#key-list-page input.ember-checkbox').checkboxradio) {
                        $('#key-list-page input.ember-checkbox').checkboxradio();
                    }
                });
            },


            updateFooter: function() {
                switch (Mist.keysController.selectedKeys.length) {
                    case 0:
                        $('#key-list-page .ui-footer').slideUp();
                        break;
                    case 1:
                        $('#key-list-page .ui-footer').slideDown();
                        $('#key-list-page .ui-footer a').removeClass('ui-state-disabled');
                        break;
                    default:
                        $('#key-list-page .ui-footer').slideDown();
                        $('#key-list-page .ui-footer a').addClass('ui-state-disabled');
                        break;
                }
            },



            /**
             * 
             *  Actions
             * 
             */

            actions: {

                createClicked: function() {
                    Mist.keyAddController.open();
                },

                selectClicked: function() {
                    $('#select-keys-popup').popup('open');
                },

                selectionModeClicked: function(mode) {
                    Ember.run(function() {
                        $('#select-keys-popup').popup('close');
                        Mist.keysController.content.forEach(function(key) {
                            key.set('selected', mode);
                        });
                        Ember.run.next(function() {
                            $("input[type='checkbox']").checkboxradio('refresh');
                        });
                    });
                },

                renameClicked: function() {
                    Mist.keyEditController.open(Mist.keysController.selectedKeys[0].id);
                },

                setDefaultClicked: function() {
                    Mist.keysController.setDefaultKey(Mist.keysController.selectedKeys[0].id);
                },

                deleteClicked: function() {
                    var keyId = Mist.keysController.selectedKeys[0].id;
                    Mist.confirmationController.set('title', 'Delete key');
                    Mist.confirmationController.set('text', 'Are you sure you want to delete "' + keyId + '" ?');
                    Mist.confirmationController.set('callback', function() {
                        Mist.keysController.deleteKey(keyId);
                    });
                    Mist.confirmationController.show();
                },
            }
        });
    }
);
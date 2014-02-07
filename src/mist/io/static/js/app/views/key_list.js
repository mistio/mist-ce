define('app/views/key_list', ['app/views/mistscreen', 'text!app/templates/key_list.html'],
    /**
     *  Key List View
     *
     *  @returns Class
     */
    function (MistScreen, key_list_html) {
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

            load: function () {

                // Add event listeners
                Mist.keysController.on('onSelectedKeysChange', this, 'updateFooter');

                this.updateFooter();

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.keysController.off('onSelectedKeysChange', this, 'updateFooter');

            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

            updateFooter: function () {
                switch (Mist.keysController.selectedKeys.length) {
                case 0:
                    $('#key-list-page .ui-footer').slideUp();
                    break;
                case 1:
                    $('#key-list-page .ui-footer').slideDown().find('a').removeClass('ui-state-disabled');
                    break;
                default:
                    $('#key-list-page .ui-footer').slideDown().find('a').addClass('ui-state-disabled');
                    break;
                }
            },


            /**
             *
             *  Actions
             *
             */

            actions: {


                addClicked: function () {
                    $('#create-key-popup').popup('option', 'positionTo', '#add-key-btn');
                    Mist.keyAddController.open();
                },


                renameClicked: function () {
                    Mist.keyEditController.open(Mist.keysController.selectedKeys[0].id);
                },


                setDefaultClicked: function () {
                    Mist.keysController.setDefaultKey(Mist.keysController.selectedKeys[0].id);
                },


                selectClicked: function () {
                    $('#select-keys-popup').popup('open');
                },


                selectionModeClicked: function (mode) {

                    $('#select-keys-popup').popup('close');

                    Ember.run(function () {
                        Mist.keysController.content.forEach(function (key) {
                            key.set('selected', mode);
                        });
                    });
                },


                deleteClicked: function () {

                    var keyId = Mist.keysController.selectedKeys[0].id;

                    Mist.confirmationController.set('title', 'Delete key');
                    Mist.confirmationController.set('text', 'Are you sure you want to delete "' + keyId + '" ?');
                    Mist.confirmationController.set('callback', function () {
                        Mist.keysController.deleteKey(keyId);
                    });
                    Mist.confirmationController.show();
                }
            }
        });
    }
);

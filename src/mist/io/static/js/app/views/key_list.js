define('app/views/key_list', ['app/views/page'],
    /**
     *  Key List View
     *
     *  @returns Class
     */
    function (PageView) {
        return App.KeyListView = PageView.extend({

            templateName: 'key_list',

            //
            //  Initialization
            //

            load: function () {

                // Add event listeners
                Mist.keysController.on('onSelectedKeysChange', this, 'updateFooter');

                this.updateFooter();

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.keysController.off('onSelectedKeysChange', this, 'updateFooter');

            }.on('willDestroyElement'),


             //
             //  Methods
             //

            updateFooter: function () {
                switch (Mist.keysController.selectedKeys.length) {
                    case 0:
                        $('#key-list-page .ui-footer')
                        .slideUp()
                        .find('a').addClass('ui-state-disabled');
                        break;
                    case 1:
                        $('#key-list-page .ui-footer')
                        .slideDown()
                        .find('a').removeClass('ui-state-disabled');
                        break;
                    default:
                        $('#key-list-page .ui-footer')
                        .slideDown()
                        .find('#keys-delete-btn').removeClass('ui-state-disabled').end()
                        .find('#keys-rename-btn').addClass('ui-state-disabled').end()
                        .find('#keys-default-btn').addClass('ui-state-disabled');
                }
            },


            //
            //  Actions
            //

            actions: {


                addClicked: function () {
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
                        Mist.keysController.filteredKeys.forEach(function (key) {
                            key.set('selected', mode);
                        });
                    });
                },


                deleteClicked: function () {
                    var keyNames = Mist.keysController.selectedKeys.toStringByProperty('id');
                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete key',
                        body: [
                            {
                                paragraph: 'Are you sure you want to delete ' +
                                (Mist.keysController.selectedKeys.length > 1 ? 'these keys: ' : 'this key: ') +
                                    keyNames + ' ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                Mist.keysController.selectedKeys.forEach(function (key) {
                                    Mist.keysController.deleteKey(key.id);
                                });
                            }
                        }
                    });
                },


                clearClicked: function() {
                    Mist.keysController.clearSearch();
                },


                sortBy: function (criteria) {
                    Mist.keysController.set('sortByTerm', criteria);
                }
            }
        });
    }
);

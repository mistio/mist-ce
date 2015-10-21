define('app/views/script_list', ['app/views/page'],
    //
    //  Script List View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return App.ScriptListView = PageView.extend({

            templateName: 'script_list',
            controllerName: 'scriptsController',

            load: function () {

                // Add event listeners
                Mist.scriptsController.on('onSelectedChange', this, 'updateFooter');

                this.updateFooter();

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.scriptsController.off('onSelectedChange', this, 'updateFooter');

            }.on('willDestroyElement'),

            canRename: function () {
                return Mist.scriptsController.get('selectedObjects').length == 1;
            }.property('Mist.scriptsController.model.@each.selected'),

            canDelete: function () {
                return Mist.scriptsController.get('selectedObjects').length;
            }.property('Mist.scriptsController.model.@each.selected'),

            updateFooter: function () {
                if (Mist.scriptsController.get('selectedObjects').length) {
                    this.$('.ui-footer').slideDown();
                }else {
                    this.$('.ui-footer').slideUp();
                }
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                addClicked: function () {
                    Mist.scriptAddController.open();
                },

                editClicked: function () {
                    Mist.scriptEditController.open(Mist.scriptsController.get('selectedObjects')[0]);
                },

                selectClicked: function () {
                    $('#select-scripts-popup').popup('open');
                },

                selectionModeClicked: function (mode) {
                    $('#select-scripts-popup').popup('close');
                    Ember.run(function () {
                        Mist.scriptsController.get('filteredScripts').forEach(function (script) {
                            script.set('selected', mode);
                        });
                    });
                },

                deleteClicked: function () {

                    var scripts = Mist.scriptsController.get('selectedObjects');

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete scripts',
                        body: [
                            {
                                paragraph: 'Are you sure you want to delete ' + (scripts.length > 1 ? 'these scripts: ' : 'this script: ') + scripts.toStringByProperty('name') + ' ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (!didConfirm) return;
                            scripts.forEach(function (script) {
                                Mist.scriptsController.deleteScript({
                                    script: script
                                });
                            });
                        }
                    });
                },

                clearClicked: function() {
                    Mist.scriptsController.clearSearch();
                },

                sortBy: function (criteria) {
                    Mist.scriptsController.set('sortByTerm', criteria);
                }
            }
        });
    }
);

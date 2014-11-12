define('app/views/log_list', ['app/views/mistscreen'],
    //
    //  Log List View
    //
    //  @returns Class
    //
    function (MistScreen) {

        'use strict';

        return MistScreen.extend({


            //
            //
            //  Initialization
            //
            //


            load: function () {

                // Add event listeners
                Mist.logsController.on('onSelectedLogsChange', this, 'updateFooter');

                this.updateFooter();

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.logsController.off('onSelectedLogsChange', this, 'updateFooter');

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            updateFooter: function () {
                switch (Mist.logsController.selectedLogs.length) {
                case 0:
                    break;
                case 1:
                    break;
                default:
                    break;
                }
            },


            //
            //
            //  Actions
            //
            //


            actions: {


                selectClicked: function () {
                    $('#select-logs-popup').popup('open');
                },


                selectionModeClicked: function (mode) {

                    $('#select-logs-popup').popup('close');

                    Ember.run(function () {
                        Mist.logsController.content.forEach(function (log) {
                            log.set('selected', mode);
                        });
                    });
                },
            }
        });
    }
);

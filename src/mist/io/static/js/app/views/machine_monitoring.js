define('app/views/machine_monitoring', ['app/views/templated'],
    //
    //  Machine Monitoring View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            machine: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.set('machine', this.get('controller').get('model'));
            }.on('didInsertElement'),


            //
            //
            //  Actions
            //
            //


            actions: {


                enableMonitoringClicked: function () {

                    // Make sure user is logged in
                    if (!Mist.authenticated) {
                        Mist.loginController.open();
                        return;
                    }

                    // Make sure user has a monitoring plan
                    if (!Mist.current_plan) {
                        Mist.notificationController.messageBox.open({
                            title: 'No plan',
                            paragraphs: [
                                'In order to use our monitoring service' +
                                ' you have to purchase a plan',

                                'You can do that in the Account page, which can ' +
                                'be accessed from the menu button on the top right corner'
                            ]
                        });
                        return;
                    }

                    // Check if sure has a key on the machine
                    if (!this.machine.probed) {
                        Mist.machineManualMonitoringController.open(this.machine);
                        return;
                    }


                    var machine = this.machine;
                    Mist.confirmationController.set('title', 'Enable monitoring');
                    Mist.confirmationController.set('text',
                        'Are you sure you want to enable monitoring for this machine?');
                    Mist.confirmationController.set('callback', function () {
                        Mist.monitoringController.changeMonitoring(machine);
                    });
                    Mist.confirmationController.show();
                },


                addMetricClicked: function () {
                    Mist.metricAddController.open(this.machine);
                }
            },
        });
    }
);

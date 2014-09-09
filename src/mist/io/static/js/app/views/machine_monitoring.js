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
            gettingCommand: null,


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
                    if (!Mist.authenticated)
                        Mist.loginController.open();

                    // Make sure user has purchased a plan
                    else if (!Mist.current_plan)
                        this._showMissingPlanMessage();

                    // Make sure machine has a key
                    else if (!this.machine.probed)
                        this._showManualMonitoringCommand();

                    // Confrim to enable monitoring
                    else
                        this._showEnableMonitoringConfirmation();
                },


                addMetricClicked: function () {
                    Mist.metricAddController.open(this.machine);
                }
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _showMissingPlanMessage: function () {
                Mist.dialogController.open({
                    type: DIALOG_TYPES.OK,
                    head: 'No plan',
                    body: [
                        {
                            paragraph: 'In order to use our monitoring' +
                                ' service you have to purchase a plan'
                        },
                        {
                            paragraph: 'You can do that in the Account' +
                                ' page, which can be accessed from the' +
                                ' menu button on the top right corner, or' +
                                ' you can the link bellow:'
                        },
                        {
                            link: 'Account page',
                            href: 'https://mist.io/account'
                        }
                    ]
                });
            },


            _showManualMonitoringCommand: function () {

                var that = this;
                this.set('gettingCommand', true);
                Mist.monitoringController.getMonitoringCommand(
                    this.machine, function (success, data) {
                        if (success)
                            showPopup(data.command);
                        that.set('gettingCommand', false)
                });

                function showPopup (command) {
                    Mist.dialogController.open({
                        type: DIALOG_TYPES.OK_CANCEL,
                        head: 'Enable monitoring',
                        body: [
                            {
                                paragraph: 'Automatic installation of monitoring' +
                                    ' requires an SSH key'
                            },
                            {
                                paragraph: 'Run this command on your server for' +
                                    ' manual installation:'
                            },
                            {
                                command: command
                            },
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm)
                                Mist.monitoringController.enableMonitoring(
                                    that.machine, null, true
                                );
                        },
                    });
                }
            },


            _showEnableMonitoringConfirmation: function () {
                var machine = this.machine;
                Mist.dialogController.open({
                    type: DIALOG_TYPES.YES_NO,
                    head: 'Enable monitoring',
                    body: [
                        {
                            paragraph: 'Are you sure you want to enable' +
                                'monitoring for this machine?'
                        }
                    ],
                    callback: function (didConfirm) {
                        if (didConfirm)
                            Mist.monitoringController.enableMonitoring(machine);
                    }
                });
            },
        });
    }
);

define('app/views/machine_monitoring_dialog', [
    'text!app/templates/machine_monitoring_dialog.html',
    'ember'],
    /**
     *
     * Monitoring Dialog page
     *
     * @returns Class
     */
    function(machine_monitoring_dialog_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(machine_monitoring_dialog_html),

            tagName: false,

            openMonitoringDialog: function() {
                console.log('click');
                $("#monitoring-dialog").popup('option', 'positionTo', '.monitoring-button').popup('open');
            },

            changeMonitoringClicked: function() {
                var machine = this.get('controller').get('model');
                machine.changeMonitoring();
                $("#monitoring-dialog").popup('close');
            },

            backClicked: function() {
                $("#monitoring-dialog").popup('close');
            }
        });
    }
);

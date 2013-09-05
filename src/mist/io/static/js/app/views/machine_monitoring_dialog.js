define('app/views/machine_monitoring_dialog', [
    'text!app/templates/machine_monitoring_dialog.html',
    'ember'],
    /**
     *
     * Monitoring Dialog
     *
     * @returns Class
     */
    function(machine_monitoring_dialog_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(machine_monitoring_dialog_html),

            enableMonitoringClick: function() {
                if (Mist.authenticated) {
                    var machine = this.get('controller').get('model');
                    machine.openMonitoringDialog();
                } else {
                    $("#login-dialog").show();
                    $("#login-dialog").popup('open');
                }
            },

            closePlanDialog: function() {
                $("#monitoring-dialog").popup('close');
            },

            openTrialDialog: function() {
                $("#monitoring-dialog").popup('close');
                $("#trial-dialog").popup('open');
            },

            clickedPurchaseDialog: function() {
                $("#monitoring-dialog").popup('close');
                window.location.href = "https://mist.io/account";  
            }
            
            
        });
    }
);

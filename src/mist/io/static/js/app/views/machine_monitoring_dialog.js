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

            openMonitoringDialog: function() {
                var machine = this.get('controller').get('model');
                if (machine.hasMonitoring) {
                    $('#monitoring-dialog div h1').text('Disable monitoring');
                    $('#monitoring-enabled').show();
                    $('#monitoring-disabled').hide();
                    $('#button-back-enabled').on("click", function() {
                        $("#monitoring-dialog").popup('close');
                    });
                    $('#button-disable-monitoring').on("click", function() {
                        machine.changeMonitoring();
                        $("#monitoring-dialog").popup('close');
                    });
                } else {
                    $('#monitoring-dialog div h1').text('Enable monitoring');
                    $('#monitoring-disabled').show();
                    $('#monitoring-enabled').hide()
                    $('#button-back-disabled').on("click", function() {
                        $("#monitoring-dialog").popup('close');
                    });
                    $('#button-enable-monitoring').on("click", function() {
                        machine.changeMonitoring();
                        $("#monitoring-dialog").popup('close');
                    });
                }
                $("#monitoring-dialog").popup('open');
                this.emailReady();
            },
            
            emailReady: function(){
                if (Mist.email && Mist.password){
                    $('#auth-ok').button('enable');
                } else {
                    try{
                        $('#auth-ok').button('disable');
                    } catch(e){
                        $('#auth-ok').button();
                        $('#auth-ok').button('disable');
                    }
                }
            }.observes('Mist.email'),
    
            passReady: function(){
                this.emailReady();
            }.observes('Mist.password') 
            
            
        });
    }
);

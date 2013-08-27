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
                        $('#button-disable-monitoring').off("click");
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
                        $('#button-enable-monitoring').off("click");
                        $("#monitoring-dialog").popup('close');
                    });

                    //Reset all divs
                    $('#enable-monitoring-dialog').show();
                    $('#free-trial').show();
                    $('#plan-dialog').show();

                    if (Mist.current_plan['title']) {
                        if (Mist.current_plan['expired']) {
                            //Trial or Plan expired, hide monitoring-dialog, hide free-trial
                            $('#enable-monitoring-dialog').hide();
                            $('#free-trial').hide();
                        } else {
                            //Trial or Plan enabled. Check for quota 
                            if (Mist.current_plan['machine_limit'] <= Mist.monitored_machines.length) {
                                //Quota exceeded, show buy option
                                $('#enable-monitoring-dialog').hide();  
                                $('#free-trial').hide();                          
                            } else {
                                //Everything ok, show monitoring-dialog, hide plan-dialog
                                $('#enable-monitoring-dialog').show();
                                $('#plan-dialog').hide();
                            }
                        }
                    } else {
                        //There were never any plans, show plan-dialog, hide monitoring-dialog
                        $('#enable-monitoring-dialog').hide();
                        $('#plan-dialog').show(); 
                    }
                }
                $("#monitoring-dialog").popup('open');
                this.emailReady();
            },

            openTrialDialog: function() {
                $("#monitoring-dialog").popup('close');
                $("#trial-dialog").popup('open');               
            },

            clickedPurchaseDialog: function() {
                $("#monitoring-dialog").popup('close');
                window.location.href = URL_PREFIX + "/account";  
            },

            changeMonitoringClicked: function() {
                 var machine = this.get('controller').get('model');
                 machine.changeMonitoring();
                 $("#monitoring-dialog").popup('close');
            },

            backClicked: function() {
                $("#monitoring-dialog").popup('close');
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

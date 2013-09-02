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
                    this.openMonitoringDialog();
                } else {
                    $("#login-dialog").show();
                    $("#login-dialog").popup('open');
                }
            },

            openMonitoringDialog: function() {
                var machine = this.get('controller').get('model');
                if (Mist.authenticated) {
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
                        $('#monitoring-enabled').hide();
                        $('#button-back-disabled').on("click", function() {
                            $("#monitoring-dialog").popup('close');
                        });
                        $('#button-enable-monitoring').on("click", function() {
                            machine.changeMonitoring();
                            $('#button-enable-monitoring').off("click");
                            $("#monitoring-dialog").popup('close');
                        });

                        if ((Mist.current_plan) && (Mist.current_plan['title'])) {
                            if (Mist.current_plan['has_expired']) {
                                //Trial or Plan expired, hide monitoring-dialog, hide free-trial
                                $('#enable-monitoring-dialog').hide();
                                $('#plan-text span').text('You have to purchase a plan in order to enable monitoring.');
                                $('#button-enable-trial').closest('.ui-btn').hide();
                            } else {
                                //Trial or Plan enabled. Check for quota 
                                if (Mist.current_plan['machine_limit'] <= Mist.monitored_machines.length) {
                                    //Quota exceeded, show buy option
                                    $('#enable-monitoring-dialog').hide();  
                                    $('#plan-text span').text('You have reached the limits for your plan. Please upgrade plan in order to continue.');
                                } else {
                                    //Everything ok, show monitoring-dialog, hide plan-dialog
                                    $('#enable-monitoring-dialog').show();
                                    $('#plan-dialog').hide();
                                }
                            }
                        } else {
                            //no plans, show plan-dialog, hide monitoring-dialog
                            if ((Mist.user_details) && (Mist.user_details[0])) {
                                $('#trial-user-name').val(Mist.user_details[0]);
                            }
                            if ((Mist.user_details) && (Mist.user_details[1])) {
                                $('#trial-company-name').val(Mist.user_details[1]);
                            }
                            $('#enable-monitoring-dialog').hide();
                            $('#monitoring-enabled').hide();
                            $('#plan-dialog').show(); 
                            $('#plan-text span').text('Monitoring is a premium service. You can try it for free for one month, or purchase a plan.');
                            $('#button-enable-trial').closest('.ui-btn').show();
                            $('#button-purchase').closest('.ui-btn').hide();
                        }
                    }
                }
                $("#monitoring-dialog").popup('open');
                this.emailReady();
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

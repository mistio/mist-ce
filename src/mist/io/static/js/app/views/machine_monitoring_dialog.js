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

                    if ((Mist.current_plan) && (Mist.current_plan['title'])) {
                        if (Mist.current_plan['has_expired']) {
                            //Trial or Plan expired, hide monitoring-dialog, hide free-trial
                            $('#enable-monitoring-dialog').hide();
                            $('#free-trial').hide();
                            $('#purchase-plan').show();                                                       
                        } else {
                            //Trial or Plan enabled. Check for quota 
                            if (Mist.current_plan['machine_limit'] <= Mist.monitored_machines.length) {
                                //Quota exceeded, show buy option
                                $('#enable-monitoring-dialog').hide();  
                                $('#quota-plan').show();                          
                            } else {
                                //Everything ok, show monitoring-dialog, hide plan-dialog
                                $('#enable-monitoring-dialog').show();
                                $('#plan-dialog').hide();
                            }
                        }
                    } else {
                        //no plans, show plan-dialog, hide monitoring-dialog
                        if ((Mist.user_details) && (Mist.user_details[0])) {
                            $('#trial-user-name').val(Mist.user_details[0])
                        }
                        if ((Mist.user_details) && (Mist.user_details[1])) {
                            $('#trial-company-name').val(Mist.user_details[1])
                        }
                        $('#enable-monitoring-dialog').hide();
                        $('#plan-dialog').show(); 
                        $('#free-trial').show();   
                        $('.trial-button').show();                                               
                    }
                }
                $("#monitoring-dialog").popup('open');
                this.emailReady();
            },

            openTrialDialog: function() {
                $("#trial-user-details").show();      
                $('.trial-button').addClass('ui-disabled');    
            },

            clickedPurchaseDialog: function() {
                $("#monitoring-dialog").popup('close');
                window.location.href = "https://mist.io/account";  
            },

            checkValidLogin: function() {
                //sends email, passwords and check if auth is ok
                
                var payload = {
                    'email': Mist.email,
                    'password': CryptoJS.SHA256(Mist.password).toString()
                };
                $("#monitoring-dialog .ajax-loader").show()
                $.ajax({
                    url: '/auth',
                    type: 'POST',
                    headers: { "cache-control": "no-cache" },
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    dataType: 'json',
                    timeout : 60000,
                    success: function(data) {
                        Mist.set('authenticated', true);
                        Mist.set('current_plan', data.current_plan);
                        Mist.set('user_details', data.user_details);
                        $("#monitoring-dialog .ajax-loader").hide()
                        //If ok set Mist.auth, Mist.current_plan and Mist.user_details and keep on with enable monitoring (if current plan allows), or show the change plans dialog
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        $("#monitoring-dialog .ajax-loader").hide()
                        //Mist.notificationController.warn('Authentication error');
                    }
                });
                
                //$("#monitoring-dialog").popup('close');
                //this.openMonitoringDialog();
            },

            backClicked: function() {
                $("#monitoring-dialog").popup('close');
                $('#free-trial').hide();   
                $('#purchase-plan').hide();                   
                $('#quota-plan').hide();  
                $("#trial-user-details").hide();   
                $('.trial-button').removeClass('ui-disabled');                                                                                        
            },
            
            submitTrial: function(){
                if ($('#trial-user-name').val() && $('#trial-company-name').val()) {
                    var payload = {
                        "action": 'upgrade_plans', 
                        "plan": 'Basic',
                        "name": $('#trial-user-name').val(),
                        "company_name": $('#trial-company-name').val()                        
                    };
                    $('#trial-user-details .ajax-loader').show();  
                    $('#submit-trial').addClass('ui-disabled');                      
                    $.ajax({
                        url: 'https://mist.io/account',
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        headers: { "cache-control": "no-cache" },
                        data: JSON.stringify(payload),
                        success: function(result) {
                            $('#trial-user-details .ajax-loader').hide();     
                            $('#submit-trial').removeClass('ui-disabled');                                                                                         
                            $("#monitoring-dialog").popup('close');                            
                            Mist.set('current_plan', result);
                            $("a.monitoring-button").click()
                        },
                        error: function(jqXHR, textstate, errorThrown) {
                            //Mist.notificationController.notify(jqXHR.responseText);
                            //cannot use it because of buggy 'enabling/disabling' popup appearing
                            $('#trial-user-details .ajax-loader').hide();   
                            $('.trial-button').removeClass('ui-disabled');  
                            $('#submit-trial').removeClass('ui-disabled');
                                                                                                                                                                                                                                                                                                                                                    
                        }
                    });

                } else {
                    if (!($('#trial-user-name').val())) {
                        $('#trial-user-name').focus();
                    } else {
                        $('#trial-company-name').focus();
                    }
                }
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

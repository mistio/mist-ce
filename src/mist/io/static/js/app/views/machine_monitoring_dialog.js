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
            tagName: false,
            machineBinding: 'Mist.machine',

            changeMonitoringClicked: function() {
                this.machine.changeMonitoring();
                history.back();
            },

            backClicked: function() {
                history.back();
            },
            
            authenticate: function(){
                
                payload = { 'email': Mist.email,
                            'password' : Mist.password };
                             
                $.ajax({
                    url: URL_PREFIX + '/login',
                    type: 'GET',
                    dataType: 'jsonp',
                    timeout: 10000,
                    data: JSON.stringify(payload),
                    success: function(data) {
                        if (data['auth']){
                            Mist.set('authenticated',true);
                        
                            warn("authenticated!");
                            Ember.run.next(function(){
                                $('#create-ok').button();
                                $('#create-cancel').button();
                                $('#create-ok-cancel').controlgroup();
                            });
                        } else {
                            Mist.notificationController.notify('Authentication failed');
                        }
                        
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Authentication failed');
                        error(textstate, errorThrown, 'while authenticating');
                    }
                });   
            },

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(machine_monitoring_dialog_html));
            },
        });
    }
);

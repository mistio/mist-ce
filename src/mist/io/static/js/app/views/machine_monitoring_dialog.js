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
            
            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(machine_monitoring_dialog_html));
                
            },
        });
    }
);

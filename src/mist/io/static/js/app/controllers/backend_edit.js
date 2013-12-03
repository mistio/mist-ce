define('app/controllers/backend_edit', ['ember'],
    /**
     *  Backend Edit Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            backend: null,

            deleteBackend: function() {
                $('#button-confirm-disable').addClass('ui-state-disabled');
                
                // TODO: This should be done by the server.
                var monitoredMachines = this.backend.getMonitoredMachines();
                if (monitoredMachines.length) {
                    monitoredMachines.forEach(function(machine) {
                        machine.changeMonitoring();
                    });
                }
                
                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.id,
                    type: 'DELETE',
                    success: function() {
                        $('#edit-backend-popup').popup('close');
                        $('#backend-delete-confirm').slideUp();
                        $('#button-confirm-disable').removeClass('ui--state-disabled');
                        
                        Mist.backendsController.removeObject(that.backend);
                        Ember.run.next(function() {
                            $('#backend-buttons').controlgroup('refresh');
                        });
                    },
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error deleting backend: ' + jqXHR.responseText);
                        $('#button-confirm-disable').removeClass('ui-disabled');
                        $('#edit-backend .ajax-loader').fadeOut(200);
                    }
                });
            },

            toggleBackend: function() {
                var newState = $('#backend-toggle').val();
                var newStateToBoolean = (newState == '1' ? true : false);
                var newStateToString = (newState == '1' ? 'True' : 'False');
                
                var payload = {
                    'newState': newStateToString
                };
                
                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.id,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function() {
                        info('Successfully toggled backend');
                        that.backend.set('enabled', newStateToBoolean);
                    },
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error toggling backend: ' + jqXHR.responseText);
                        Ember.run.next(function() {
                            $('#backend-toggle').val(newState == '1' ? '0' : '1').slider('refresh');
                        });
                    }
                });
            }
        });
    }
);

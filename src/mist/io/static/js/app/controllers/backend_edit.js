define('app/controllers/backend_edit', [
    'ember'
    ],
    /**
     * Backend Edit Controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            backend: null,

            deleteBackend: function() {
                $('#edit-backend .ajax-loader').fadeIn(200);
                $('#button-confirm-disable').addClass('ui-disabled');
                
                var monitoredMachines = this.backend.getMonitoredMachines();
                if (monitoredMachines.length) {
                    monitoredMachines.forEach(function(machine) {
                        machine.changeMonitoring();
                    });
                }
               
                $.ajax({
                    url: '/backends/' + this.backend.id,
                    type: 'DELETE',
                    success: function() {
                        info('Successfully deleted backend:', this.backend.id);
                        $('#backend-delete-confirm').slideUp();
                        $('#edit-backend .ajax-loader').fadeOut(200);
                        $('#button-confirm-disable').removeClass('ui-disabled');
                        Mist.backendsController.arrayContentWillChange();
                        Mist.backendsController.removeObject(that.backend);
                        Mist.backendsController.arrayContentDidChange();
                        Ember.run.next(function(){
                            $('#backend-buttons').controlgroup('refresh');
                        });
                        $("#edit-backend").popup("close");
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting backend: ' + jqXHR.responseText);
                        $('#edit-backend .ajax-loader').fadeOut(200);
                        $('#button-confirm-disable').removeClass('ui-disabled');
                    }
                });
            },

            toggleBackend: function() {
                var newState = $('#backend-toggle').val();
                var newStateToBoolean = (newState == "1" ? true : false);
                var newStateToString = (newState == "1" ? "True" : "False");
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
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while toggling backend: ' + jqXHR.responseText);
                        Ember.run.next(function() {
                            $('#backend-toggle').val(newState == "1" ? "0" : "1").slider('refresh');
                        });
                    }
                });
            }
        });
    }
);

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
                    monitoredMachines.forEach(function(monitored_machine) {
                        monitored_machine.changeMonitoring();
                    });
                }
               
                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.id,
                    type: 'DELETE',
                    success: function() {
                        $('#edit-backend .ajax-loader').fadeOut(200);
                        $('#backend-delete-confirm').slideUp();
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
                        $('#edit-backend .ajax-loader').fadeOut(200);
                        $('#button-confirm-disable').removeClass('ui-disabled');
                        Mist.notificationController.notify('Error while deleting backend: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while deleting backend');
                    }
                });
            },

            toggleBackend: function() {
                var newStateToNum = $('#backend-toggle').val();
                var newState = newStateToNum == "1" ? "True" : "False";
                var payload = {
                    'newState': newState
                };
                newState = newState == "True" ? true : false;
                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.id,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function() {
                        info('Successfully toggled backend');
                        that.backend.set('enabled', newState);
                        that.backend.toggle();
                        Ember.run.next(function(){
                            $('.backend-toggle').slider('refresh');
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while toggling backend: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while toggling backend');
                        that.backend.set('enabled', !newState);
                        that.backend.toggle();
                        Ember.run.next(function() {
                            $('.backend-toggle').val(newStateToNum == "1" ? "0" : "1");
                            $('.backend-toggle').slider('refresh');
                        });
                    }
                });
            }
        });
    }
);

define('app/views/backend_edit', [
    'text!app/templates/backend_edit_dialog.html',
    'ember'],
    /**
     *
     * Edit Backend Dialog
     *
     * @returns Class
     */
    function(edit_backend_dialog_html) {

        return Ember.View.extend({

            backButtonClick: function(){
                $('#backend-delete-confirm').slideUp();
                $("#edit-backend").popup("close");
            },

            deleteButtonClick: function(){
                if (this.getMonitoredMachines().length > 0) {
                    $('#backend-has-monitoring').show();
                } else {
                    $('#backend-has-monitoring').hide();
                }
                $('#backend-delete-confirm').slideDown();
            },

            deleteCancelButtonClick: function(){
                $('#backend-delete-confirm').slideUp();
            },

            deleteConfirmButtonClick: function(){
                $('#edit-backend .ajax-loader').fadeIn(200);
                $('#button-confirm-disable').button('disable');
                var that = this;
                var monitoredMachines = this.getMonitoredMachines();
                if (monitoredMachines.length > 0) {
                    monitoredMachines.forEach(function(monitored_machine) {
                        monitored_machine.changeMonitoring();
                    });
                }
                $.ajax({
                    url: '/backends/' + this.backend.id,
                    type: 'DELETE',
                    success: function(result) {
                        $('#edit-backend .ajax-loader').fadeOut(200);
                        $('#backend-delete-confirm').slideUp();
                        $('#button-confirm-disable').button('enable');
                        var i = Mist.backendsController.content.indexOf(that.backend);
                        // refresh backend buttons
                        Mist.backendsController.arrayContentWillChange();
                        Mist.backendsController.removeObject(that.backend);
                        Mist.backendsController.arrayContentDidChange();
                        Ember.run.next(function(){
                            $('#backend-buttons').controlgroup('refresh');
                        });
                        $("#edit-backend").popup("close");
                    }
                });
            },

            toggleBackend: function(){
                Mist.backend.set('enabled',!Mist.backend.enabled);
                Ember.run.next(function(){
                    $('.backend-toggle').slider('refresh');
                });
            },

            getMonitoredMachines: function(){
                var monitoredMachines = [];
                this.backend.machines.forEach(function(machine_iter) {
                    if (machine_iter.hasMonitoring) {
                        monitoredMachines.push(machine_iter);
                    }
                });
                return monitoredMachines;
            },

            template: Ember.Handlebars.compile(edit_backend_dialog_html),
        });
    }
);

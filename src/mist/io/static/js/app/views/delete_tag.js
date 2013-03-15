define('app/views/delete_tag', [
    'ember',
    'jquery'
    ],
    /**
     *
     * Delete tag view
     *
     * @returns Class
     */
    function() {
        return Ember.View.extend({
            tagName: false,

            didInsertElement: function(e){
                $("a.tagButton").button();
            },

            deleteTag: function() {
                var tag = this.tag;
                var machine = this.get('machine');

                if(!machine.tags){
                    machine = machine.get('model');
                }

                log("tag to delete: " + tag);

                var payload = {
                    'tag': tag.toString()
                };

                machine.set('pendingDeleteTag', true);
                $.ajax({
                    url: 'backends/' + machine.backend.id + '/machines/' + machine.id + '/metadata',
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully deleted tag from machine', machine.name);
                        machine.tags.removeObject(tag);
                        machine.set('pendingDeleteTag', false);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting tag from machine ' +
                                machine.name);
                        error(textstate, errorThrown, 'while deleting tag from machine machine', machine.name);
                        machine.set('pendingDeleteTag', false);
                    }
                });
            }
        });
    }
);

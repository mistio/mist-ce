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
            tagName: 'li',

            didInsertElement: function() {
                $("a.tag-button").button();
            },

            deleteTag: function() {
                var tag = this.tag;
                var machine = this.get('machine');

                if(!machine.tags){
                    machine = machine.get('model');
                }


                var payload = {
                    'tag': tag.toString()
                };
                $('#tags-container .ajax-loader').fadeIn(200);
                machine.set('pendingDeleteTag', true);
                $.ajax({
                    url: 'backends/' + machine.backend.id + '/machines/' + machine.id + '/metadata',
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully deleted tag from machine', machine.name);
                        //machine.tags.removeObject(this.tag.toString());

                        machine.set('pendingDeleteTag', false);
                        machine.tags.removeObject(tag.toString());
                        $('#tags-container .ajax-loader').hide();
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting tag from machine ' +
                                machine.name);
                        error(textstate, errorThrown, 'while deleting tag from machine machine', machine.name);
                        machine.set('pendingDeleteTag', false);
                        $('#tags-container .ajax-loader').hide();
                    }
                });
            }
        });
    }
);

define('app/views/machine_tags_dialog',[
    'text!app/templates/machine_tags_dialog.html',
    'ember',
    'jquery'
    ],
    /**
     *
     * Machine Tags Dialog page
     *
     * @returns Class
     */
    function(machine_tags_dialog_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(machine_tags_dialog_html),

            submit: function() {
                var tag = this.tag;

                var machine = this.get('machine');

                if (!machine || !this.tag) {
                    return;
                }

                if(!machine.tags){
                    machine = machine.get('model');
                }

                var payload = {
                    'tag' : tag
                };
                $('#tags-container .ajax-loader').fadeIn(200);
                machine.set('pendingAddTag', true);
                $.ajax({
                    url: 'backends/' + machine.backend.id + '/machines/' + machine.id + '/metadata',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully added tag to machine', machine.name);
                        machine.set('pendingAddTag', false);
                        machine.tags.addObject(tag);
                        $('#tags-container .ajax-loader').hide();
                        $('#tags-container input[type=text]').val('')
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while adding tag to machine ' + machine.name);
                        error(textstate, errorThrown, 'while adding tag to machine machine', machine.name);
                        machine.tags.removeObject(tag);
                        machine.set('pendingAddTag', false);
                        $('#tags-container .ajax-loader').hide();
                    }
                });
            },

            disabledClass: function() {
                if (this.tag && this.tag.length > 0) {
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('tag')
        });
    }
);

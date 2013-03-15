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

            submit: function() {
                var tag = this.tag;

                var machine = this.get('machine');
                if(!machine){
                    machine = this.get('controller').get('model');
                }

                if (!machine || !this.tag) {
                    return;
                }

                machine.tags.addObject(tag);

                log("tag to add: " + tag);

                var payload = {
                    'tag' : tag
                };

                machine.set('pendingAddTag', true);
                $.ajax({
                    url: 'backends/' + machine.backend.id + '/machines/' + machine.id + '/metadata',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully added tag to machine', machine.name);
                        machine.set('pendingAddTag', false);

                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while adding tag to machine ' + machine.name);
                        error(textstate, errorThrown, 'while adding tag to machine machine', machine.name);
                        machine.tags.removeObject(tag);
                        machine.set('pendingAddTag', false);
                    }
                });
            },

            deleteTag: function(){
                warn('delete tag');
            },

            disabledClass: function() {
                if (this.tag && this.tag.length > 0) {
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('tag'),

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(machine_tags_dialog_html));
            }
        });
    }
);

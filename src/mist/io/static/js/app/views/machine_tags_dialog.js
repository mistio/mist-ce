define('app/views/machine_tags_dialog', [
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
            tagName: false,

            machine: function(){
                 var machine = Mist.machine;
			if (!machine) {
				Mist.backendsController.forEach(function(backend) {
					backend.machines.forEach(function(m) {
						if (m.selected) {
							log('machine selected');
							return m;
						}
					});
				});
			}
                  return machine;
		
            }.property("Mist.backendsController.@each.machines.@each.selected"),

            submit: function(){
                var tag = this.tag;

                var machine = Mist.machine;
			if (!machine) {
				Mist.backendsController.forEach(function(backend) {
					backend.machines.forEach(function(m) {
						if (m.selected && m.hasKey) {
							log('machine selected');
							machine = m;
						}
					});
				});
			}
			if (!machine || !this.tag) {
				return;
			}


                machine.tags.addObject(tag);

                log("tag to add: " + tag);

                var payload = {
                    'tag': tag
                };

                $.ajax({
                    url: 'backends/' + machine.backend.index + '/machines/' + machine.id + '/metadata',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully added tag to machine', machine.name);

                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while adding tag to machine ' +
                                machine.name);
                        error(textstate, errorThrown, 'while adding tag to machine machine', machine.name);
                        machine.tags.removeObject(tag);
                    }
                });
            },

            disabledClass : function() {
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

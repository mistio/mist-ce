define('app/views/machine_tags_dialog', [
	'text!app/templates/machine_tags_dialog.html','ember'],
	/**
	 *
	 * Machine Tags Dialog page
	 *
	 * @returns Class
	 */
	function(machine_tags_dialog_html) {
		return Ember.View.extend({
			tagName: false,
	
            addTag: function(){
			    var tag = this.tag;
			    
			    var machine = Mist.machine;
			    
			    log("tag to add: " + tag);
			    $.ajax({
                    url: 'backends/' + machine.backend.index + '/machines/' + machine.id + '/metadata',
                    type: 'POST',
                    data: 'metadata='  + tag,
                    success: function(data) {
                        info('Successfully added tag to machine', machine.name);
                        machine.tags.addObject(tag);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while adding tag to machine ' +
                                machine.name);
                        error(textstate, errorThrown, 'while adding tag to machine machine', machine.name);
                    }
                });
		    },

		    init: function() {
				this._super();
				this.set('template', Ember.Handlebars.compile(machine_tags_dialog_html));
		    }
		});
	}
);

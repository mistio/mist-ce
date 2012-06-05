define('app/controllers/backends', [
    'app/models/backend',
    'text!app/views/backend_button.html'],
	/**
	 * Backends controller
	 *
	 * @returns Class
	 */
	function(Backend, backend_button_html) {
		return Ember.ArrayController.extend({
			content: [],
			
			// Compile and render the Backends buttons view
			backendsButtonsView: Ember.CollectionView.create({
			    tagName: 'div',
			    itemViewClass: Ember.View.extend({
			    	attributeBindings: ['data-role', 'data-rel', 'href', 'data-theme',
			    	                    'data-inline', 'data-transition', 'data-corners',
			    	                    'data-shadow'],
			        href: "#edit-backend",
			        'data-rel': "dialog",
			        'data-theme': "c",
			        'data-inline': "true",
			        'data-transition': "slidedown", 
			        'data-corners': "false",
			        'data-shadow': "false",
			        'data-role': "button",
			        //class="backend-state-{{content.status}}"
			      tagName: 'a',	
			      template: Ember.Handlebars.compile('{{content.title}}')
			    }),
			    contentBinding:Ember.Binding.oneWay('Mist.backendsController.content'),
			    contentLengthDidChange: function(){
			        console.log('backend buttons changed');
			        var that = this;
			        Em.run.next(function() {
			            that.$().trigger('create'); //FIXME
			        });
			    }.observes('content.length')
            }),

			init: function() {
				this._super();
				
				var that = this;
				$.getJSON('/backends', function(data) {
					data.forEach(function(item){
						that.pushObject(Backend.create(item));
					});
				});

				this.get('backendsButtonsView').appendTo('#backend-buttons');
			}
		});
	}
);
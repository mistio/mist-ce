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
			    contentBinding:Ember.Binding.oneWay('Mist.backendsController.content'),
			    itemViewClass: Ember.View.extend({
                    tagName:false,
                    template: Ember.Handlebars.compile(backend_button_html),
                    didInsertElement: function(e){
                      $("#backend-buttons").trigger('create');
                    }
			    }),
            }),

            machineCount: 0,
            imageCount: 0,

			init: function() {
				this._super();

				var that = this;
				$.getJSON('/backends', function(data) {
					data.forEach(function(item){
						that.pushObject(Backend.create(item));
					});

					that.content.forEach(function(item){
						item.machines.addObserver('length', function() {
							var count = 0;
							that.content.forEach(function(item){
								count = count + item.machines.get('length');
							});
							that.set('machineCount', count);
						});
						item.images.addObserver('length', function() {
							var count = 0;
							that.content.forEach(function(item){
								count = count + item.images.get('length');
							});
							that.set('imageCount', count);
						});
					});
				});

				this.get('backendsButtonsView').appendTo('#backend-buttons');
			}
		});
	}
);

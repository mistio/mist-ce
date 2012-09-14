define('app/controllers/select_machines', ['ember'],
	/**
	 * Selected machines controller
	 *
	 * @returns Class
	 */
	function() {
		return Ember.ArrayController.extend({
			_content: [{name: 'All', id: 'all'},
			          { name: 'None', id: 'none'}],
			selection: null,

			//if only this would work...
			backendsChanged: function(){
				log("backends changed");
				var content = new Array();

				this._content.forEach(function(item){
					content.push({name: item.name, id: item.id});
				});

				Mist.backendsController.forEach(function(item){
					content.push({name: item.title, id: item.provider});
				});

				this.contentWillChange();
				this.set('content', content);
				this.contentDidChange();


			}.observes('Mist.backendsController.@each'),

			selectionChanged: function(){

				var selection = this.selection.id;

				if(selection == 'none'){
					Mist.backendsController.forEach(function(backend){
						backend.machines.forEach(function(machine){
							log('deselecting machine: ' + machine.name);
							machine.set('selected', false);
						});
					});
				} else if(selection == 'all'){
					Mist.backendsController.forEach(function(backend){
						backend.machines.forEach(function(machine){
							log('selecting machine: ' + machine.name);
							machine.set('selected', true);
						});
					});
				} else {
					Mist.backendsController.forEach(function(backend){
						if(backend.provider == selection){
							backend.machines.forEach(function(machine){
								log('selecting machine: ' + machine.name);
								machine.set('selected', true);
							});
						} else {
							backend.machines.forEach(function(machine){
								log('deselecting machine: ' + machine.name);
								machine.set('selected', false);
							});
						}
					});
				}
			}.observes('selection'),

			init: function() {
				this._super();
			}
		});
	}
);

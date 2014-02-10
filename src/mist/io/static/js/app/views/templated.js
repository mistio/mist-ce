define('app/views/templated', ['ember'],
    /**
     *  Templated View
     *
     *  @returns Class
     */
	function() {
		return Ember.View.extend({

			/**
			 *  Initialization
			 */

            init: function() {
                this._super();
                if (!this.name) return;
                this.set('template', Ember.TEMPLATES[this.name + '/html']);
            }
		});
	}
);

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

                var templateName = this.name;

                // Automatically discover the template of this view
                if (!templateName) {

                    // The constructor's name will be something like
                    // this: Mist.aTotalyRandomView
                    // We store the "aTotalyRandom" to "name" variable
                    var name = this.constructor.toString().split('.')[1].split('View')[0];

                    // Then we replace all lower case letters that are followed by
                    // an upper case letter to meet the template naming convensions.
                    // For example, aTotalyRandom would be converted to a_totaly_random
                    templateName = name.replace(/([a-z])([A-Z])/g, function(a,b) {
                        return b + '_' + a.slice(1).toLowerCase();
                    });
                }

                this.set('template', Ember.TEMPLATES[templateName + '/html']);
            }
		});
	}
);

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

            	// This view exists to easily set the template
            	// of a view based on the global JS_BUILD flag
                this._super();

                // If the view doesn't specify a name, do not attempt
                // to set it's template
                if (!this.name) return;

                if (JS_BUILD) {

	                // When JS_BUILD equals to true, the app serves the 
	                // precompiled templates which have been loaded from
	                // the app/templates/build.js file
                    info('Getting precompiled template for: ' + this.name);
                	this.set('template', Ember.TEMPLATES[this.name + '/html']);

                } else {

                	// When JS_BUILD equals to false, the app compiles the
                	// templates on the client.
                	var that = this;
                    require(['text!app/templates/'+this.name+'.html'], function(template) {

                        info('Compiling template for: ' + that.name);
                        that.set('template', Ember.Handlebars.compile(template)).rerender();
                        
                        Ember.run.next(function() {
                            $('#'+that.elementId).trigger('create');
                        });
                    });  
                }
            }
		});
	}
);

// Define libraries
require.config({
	baseUrl: 'static/js/',
	paths: {
		jquery: 'lib/jquery-1.7.1.min',
        ember: 'lib/ember-0.9.8.1.min',
        mobile: 'lib/jquery.mobile-1.1.0.min',
		text: 'lib/require/text',
		mocha: 'lib/mocha',
		chai: 'lib/chai'
	}
});

// Load our app
define( 'app', [
	'jquery',
    'app/controllers/backends',
    'app/views/machines_number_view',
	'ember',
	'mobile',
	], function($, BackendsController, MachinesNumberView) {
		var App = Ember.Application.create({

			VERSION: '0.3-ember',

			// Sets up mocha to run some integration tests
			specsRunner: function( chai ) {
				// Create placeholder for mocha output
				// TODO: Make this shit look better and inside body
				$( document.body ).before( '<div id="mocha"></div>' );

				// Setup mocha and expose chai matchers
				window.expect = chai.expect;
				mocha.setup('bdd');

				// Load testsuite
				require([
					'app/specs/models/store',
					'app/specs/views/basic_acceptance',
					'app/specs/controllers/todos'
				], function() {
						mocha.run().globals( [ '$', 'Ember', 'Todos' ] );
					}
				);
			},

			// Constructor
			init: function() {
				this._super();

				// Initiate main controller
				this.set(
					'backendsController',
					BackendsController.create()
				);
				
				this.set(
						'machinesNumberView',
						MachinesNumberView.create({app: this})
					);
					

				// Run specs if asked
				if ( location.hash.match( /specs/ ) ) {
					require( [ 'chai', 'mocha' ], this.specsRunner );
				}
			}
		});

		// Expose the application globally
		return window.Mist = App;
	}
);

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
    'app/controllers/confirmation',
    'app/controllers/notification',
    'app/controllers/machine_add',
    'app/controllers/select_machines',
    'app/views/count',
    'app/views/backend_button',
    'app/views/edit_backend',
    'app/views/machine_list_item',
    'app/views/image_list',
    'app/views/enable_backend_button',
    'app/views/machine_add_dialog',
    'app/views/machine',
    'app/views/confirmation_dialog',
    'app/views/machine_actions_dialog',
    'app/views/single_machine_actions_dialog',
    'app/views/shell',
	'ember',
	'mobile',
	], function($, BackendsController, ConfirmationController,
			NotificationController, MachineAddController,
			SelectMachinesController,
			Count, BackendButton, EditBackend, MachineList, ImageList,
			EnableBackendButton, MachineAddDialog, MachineView, ConfirmationDialog,
			MachineActionsDialog,
			SingleMachineActionsDialog, Shell) {
		var App = Ember.Application.create({

			VERSION: '0.3-ember',

			// Sets up mocha to run some integration tests
			specsRunner: function( chai ) {
				// Create placeholder for mocha output
				$( document.body ).before( '<div id="mocha"></div>' );

				// Setup mocha and expose chai matchers
				window.expect = chai.expect;
				mocha.setup('bdd');

				// Load testsuite
				require([
					'app/specs/templates/basic_acceptance'
				], function() {
						mocha.run().globals( [ '$', 'Ember', 'Mist' ] );
					}
				);
			},

			// Constructor
			init: function() {
				this._super();

				this.set(
					'backendsController',
					BackendsController.create()
				);

				this.set(
						'confirmationController',
						ConfirmationController.create()
					);

				this.set(
						'notificationController',
						NotificationController.create()
					);

				this.set(
						'machineAddController',
						MachineAddController.create()
					);

				this.set(
						'selectMachinesController',
						SelectMachinesController.create()
					);

				// Run specs if asked
				if ( location.hash.match( /specs/ ) ) {
					require( [ 'chai', 'mocha' ], this.specsRunner );
				}


				location.hash = '#splash';


				setTimeout(function(){
					if($('.ui-page-active').attr('id') == 'splash'){
						$.mobile.changePage('#home', {
							transition: 'fade',
						});
					}
				}, 2000);


			}
		});



		$(document).on( 'pagebeforeshow', '#machines', function(){
		    $('#machines-list').listview('refresh');
		});
		
		$(document).on( 'pagebeforeshow', '#dialog-power', function(){
			$("#dialog-power a").button();
		});
		
		$(document).on( 'pagebeforeshow', '#dialog-single-power', function(){
			$("#dialog-single-power a").button();
		});
		
		$(document).on( 'pagebeforeshow', '#images', function(){
			$("#images-list").listview('refresh');
		});

		App.Select = Ember.Select.extend({
		    attributeBindings: ['name', "data-theme", "data-icon",
                "data-native-menu", 'disabled'],

            didInsertElement: function(){

			    var that = this;

	    	    //Em.run.next(function() {
	    	    //		that.get('parentView').$().trigger('create');

	    		//});
	        },
		});

		App.TextField = Ember.TextField.extend({
		    attributeBindings: ['name', "data-theme"]
		});

		App.Checkbox = Ember.Checkbox.extend({
		    attributeBindings: ['name', "id"]
		});

		App.CountView = Count;
		App.BackendButtonView = BackendButton;
		App.EditBackendView = EditBackend;
		App.MachineListView = MachineList;
		App.ImageListView = ImageList;
		App.EnableBackendButtonView = EnableBackendButton;
		App.onOff = ['on', 'off'];

		var addDialog = MachineAddDialog.create();
		addDialog.append();

		var machineView = MachineView.create();
		machineView.append();

		var confirmationDialog = ConfirmationDialog.create();
		confirmationDialog.append();

		var machineActionsDialog = MachineActionsDialog.create();
		machineActionsDialog.append();
		var dialog = SingleMachineActionsDialog.create();
		dialog.append();
		var shellDialog = Shell.create();
		shellDialog.append();

		$(document).on( 'pagebeforeshow', '#dialog-add', function(){
		    $('#dialog-add').trigger('create');
		});

		// Expose the application globally
		return window.Mist = App;
	}
);

/**
 * Some acceptance testing for view templates
 */

describe( 'views/*', function() {

	it( 'should validate confirmation dialog template', function( done ) {
		require( [ 'text!app/templates/confirmation_dialog.html' ], function( html ){
			expect( html ).to.be.a( 'string' );
			expect(function(){ Em.Handlebars.compile( html );}).to.not.throw( Error );
			done();
		});
	});

	it( 'should validate edit backend dialog template', function( done ) {
		require( [ 'text!app/templates/edit_backend_dialog.html' ], function( html ) {
			expect( html ).to.be.a( 'string' );
			expect(function(){ Em.Handlebars.compile( html ) }).to.not.throw( Error );
			done();
		});
	});

	it( 'should validate machine add dialog template', function( done ) {
		require( [ 'text!app/templates/machine_add_dialog.html' ], function( html ) {
			expect( html ).to.be.a( 'string' );
			expect(function(){ Em.Handlebars.compile( html ) }).to.not.throw( Error );
			done();
		});
	});
	
	it( 'should validate machine list item template', function( done ) {
		require( [ 'text!app/templates/machine_list_item.html' ], function( html ) {
			expect( html ).to.be.a( 'string' );
			Em.Handlebars.compile( html );
			expect(function(){ Em.Handlebars.compile( html ) }).to.not.throw( Error );
			done();
		});
	});
	
	it( 'should validate machine template', function( done ) {
		require( [ 'text!app/templates/machine.html' ], function( html ) {
			expect( html ).to.be.a( 'string' );
			expect(function(){ Em.Handlebars.compile( html ) }).to.not.throw( Error );
			done();
		});
	});
	
});
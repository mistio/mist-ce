define('app/controllers/images', [
    'app/models/image'],
	/**
	 * Images controller
	 *
	 *
	 * @returns Class
	 */
	function(Image) {
		return Ember.ArrayController.extend({
			backend: null,
			
			getImageType: function(imageId, callback){
				var that = this;
				
				this.getImage(imageId, function(image){
					for(type in that.TYPES){
						if(image.name.toLowerCase().search(type) != -1){
							callback(type);
							return;
						}
					}
				});
			},
			
			getImage: function(id, callback){
		    	retImage = false;
		    	
		    	$.each(this.content, function(idx, image){
					if(image.id == id){
						retImage = image;
						return false;
					}
				});
		    	
		    	if(retImage){
		    		callback(retImage);
		    	} else {
		    		var that = this;
		    		
		    		$.ajax({
	                    url: 'backends/' + this.backend.index + '/image_details',
	                    data: {id: id},
	                    success: function(data) {
	                    	var image = Image.create(data);
	                    	that.content.push(image);
	                        callback(image);
	                    },
	                    error: function(jqXHR, textStatus, errorThrown) {
	        				Mist.notificationController.notify("Error loading image id:" + id);
	        				
	                    }
	                });
		    	}
		    },
			
			init: function() {
				this._super();
			
				var that = this;
				$.getJSON('/backends/' + this.backend.index + '/images', function(data) {
					var content = new Array();
					data.forEach(function(item){
						content.push(Image.create(item));
					});
					that.set('content', content);
				}).error(function() {
					Mist.notificationController.notify("Error loading images for backend: " + that.backend.title);
				});
			}
		});
	}
);
define('app/views/count', ['ember'],
    /**
     *
     * Count on home page
     *
     * @returns Class
     */
    function() {
        return Ember.View.extend({
            didInsertElement: function(e){
                try{
                  $("#home-menu").listview('refresh');
                } catch(e) {}
            },
        });
    }
);

define('app/views/list_item', ['ember'],
    /**
     *  List Item View
     *
     *  @returns Class
     */
    function() {
        return Ember.View.extend({

            /**
             *  Initialization
             */

            renderListItem: function() {
                
                // Prevent bad rendering from showing up
                
                var element = $('#' + this.elementId).hide();
                Ember.run.next(this, function() {
                    element = element.trigger('create')
                                     .show()
                                     .parent();
                    try {
                        element.listview('refresh');
                    } catch (e) {}
                });
            }.on('didInsertElement')
        });
    }
);

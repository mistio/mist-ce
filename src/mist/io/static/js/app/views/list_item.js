define('app/views/list_item', ['ember'],
    /**
     *  List Item View
     *
     *  @returns Class
     */
    function() {
        return Ember.View.extend({

            /**
             *
             *  Initialization
             *
             */

            renderListItem: function() {
                Ember.run.next(this, function() {
                    var element = $('#' + this.elementId).parent()
                    if (element.listview) {
                        element.listview('refresh');
                    }
                });
            }.on('didInsertElement')
        });
    }
);

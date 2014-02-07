define('app/views/list_item', ['ember'],
    /**
     *  List Item View
     *
     *  @returns Class
     */
    function () {
        return Ember.View.extend({

            /**
             *  Properties
             */

            tagName: 'li',


            /**
             *
             *  Initialization
             *
             */

            renderListItem: function () {

                // Prevent bad rendering
                // (or at least... try to...)

                var element = $('#' + this.elementId).hide();
                Ember.run.next(this, function () {
                    try {
                        element.trigger('create')
                            .show()
                            .parent()
                            .listview('refresh');
                    } catch (e) {}
                });
            }.on('didInsertElement')
        });
    }
);

define('app/views/list_item', [],
    /**
     *  List Item View
     *
     *  @returns Class
     */
    function () {
        return Ember.Component.extend({

            //
            //  Properties
            //

            tagName: 'li',


            //
            //  Initialization
            //

            renderListItem: function () {
                // Prevent bad rendering
                // (or at least... try to...)
                var element = $('#' + this.elementId).hide();
                Ember.run.next(this, function () {
                    try {
                        element.enhanceWithin()
                            .show()
                            .parent()
                            .listview('refresh');
                    } catch (e) {}
                });
            }.on('didInsertElement')
        });
    }
);

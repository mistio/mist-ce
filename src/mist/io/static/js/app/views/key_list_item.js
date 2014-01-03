define('app/views/key_list_item', ['app/views/list_item', 'text!app/templates/key_list_item.html'],
    /**
     *  Key List Item View
     *
     *  @returns Class
     */
    function (ListItemView, key_list_item_html) {
        return ListItemView.extend({

            /**
             *  Properties
             */

            key: null,
            template: Ember.Handlebars.compile(key_list_item_html),


            /**
             *
             *  Methods
             *
             */

            updateCheckbox: function () {
                var element = $('#' + this.elementId + ' input.ember-checkbox');
                Ember.run.next(this, function () {
                    if (element.checkboxradio) {
                        element.checkboxradio()
                               .checkboxradio('refresh');
                    }
                });
            },


            /**
             *
             *  Observers
             *
             */

            keySelectedObserver: function () {
                Ember.run.once(this, 'updateCheckbox');
            }.observes('key.selected')
        });
    }
);

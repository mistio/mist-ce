define('app/views/key_list_item', ['app/views/list_item'],
    /**
     *  Key List Item View
     *
     *  @returns Class
     */
    function (ListItemComponent) {
        return App.KeyListItemComponent = ListItemComponent.extend({

            /**
             *  Properties
             */
            layoutName: 'key_list_item',
            key: null,


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

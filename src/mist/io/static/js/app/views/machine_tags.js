define('app/views/machine_tags', ['text!app/templates/machine_tags.html', 'ember'],
    /**
     *  Machine Tags View
     *
     *  @returns Class
     */
    function(machine_tags_html) {
        return Ember.View.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(machine_tags_html),

            /**
             *  Actions
             */

            actions: {

                addClicked: function() {
                    Mist.machineTagsController.add();
                },
                
                deleteTagClicked: function(tag) {
                    Mist.machineTagsController.deleteTag(tag);
                },
                
                backClicked: function() {
                    Mist.machineTagsController.close();
                }
            }
        });
    }
);

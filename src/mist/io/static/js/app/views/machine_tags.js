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
            
            machine: null,
            template: Ember.Handlebars.compile(machine_tags_html),

            submit: function() {

            },

            disabledClass: function() {
                if (this.tag && this.tag.length > 0) {
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('tag')
        });
    }
);

define('app/views/home', [
    'app/views/mistscreen',
    'text!app/templates/home.html','ember'],
    /**
     *
     * Home page
     *
     * @returns Class
     */
    function(MistScreen, home_html) {
        return MistScreen.extend({
            template: Ember.Handlebars.compile(home_html)
        });
    }
);

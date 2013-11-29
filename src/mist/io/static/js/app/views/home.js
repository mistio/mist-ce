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

            template: Ember.Handlebars.compile(home_html),
            
            didInsertElement: function() { // Overrides mistscreen
                
                this._super();
                
                // Welcome message to the new users
                
                // Get data from registration
                var data = JSON.parse(sessionStorage.getItem('data'));
                sessionStorage.clear();

                if (data) {

                    var promo = null;
                    var selectedPlan = data.selectedPlan; // Selected plans are only "Lite" and "Trial" at this point
                    var hasPromo = data.hasPromo;
                    var controller = Mist.notificationController;
                    controller.set('msgHeader', 'Welcome to Mist.io!');
                    
                    if (selectedPlan == 'Trial' && hasPromo) {
                        controller.set('msgPart1', 'Enjoy your 15-day trial, it\'s totaly free!');
                        
                        controller.set('msgPart2', 'Don\'t forget that there is a discount waiting just for you on the "account-settings" page. \
                                                    Make sure to use it before it\'s expiration!');
                    } else if (selectedPlan == 'Lite' && hasPromo) {
                        controller.set('msgPart1', 'You have chosen the "Lite" plan, but in order to give you a taste \
                                                    of our monitoring services, we assigned you a trial.');
                        controller.set('msgPart2', 'It is completely free and lasts for 15 days, enjoy!');
                        
                        controller.set('msgPart3', 'Don\'t forget that there is a discount waiting just for you on the "account-settings" page. \
                                                    Make sure to use it before it\'s expiration!');
                    } else if (selectedPlan == 'Trial') {
                        controller.set('msgPart1', 'Enjoy your 15-day trial, it\'s totaly free!');
                    } else if (selectedPlan == 'Lite') {
                        controller.set('msgPart1', 'You have chosen the "Lite" plan, but in order to give you a taste \
                                                    of our monitoring services, we assigned you a trial.');
                        controller.set('msgPart2', 'It is completely free and lasts for 15 days, enjoy!');
                    } else if (hasPromo) {
                        controller.set('msgPart1', 'In order to give you a taste of our monitoring services, we assigned you a trial.');
                        controller.set('msgPart2', 'It is completely free and lasts for 15 days, enjoy!');
                        controller.set('msgPart3', 'Don\'t forget that there is a discount waiting just for you on the "account-settings" page. \
                                                    Make sure to use it before it\'s expiration!');
                    } else {
                        //controller.set('msgPart1', 'In order to give you a taste of our monitoring services, we assigned you a trial.');
                        //controller.set('msgPart2', 'It is completely free and lasts for 15 days, enjoy!');
                        return;
                    }
                    
                    controller.set('msgPart4', 'To manage your account settings click "Me" > "My account".');
                    
                    Ember.run.later(function() {
                        controller.showMessagebox();
                    }, 1500);
                }
            }
        });
    }
);

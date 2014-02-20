define('app/views/mistscreen', ['app/views/templated', 'ember'],
    /**
     *  Mistscreen View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return TemplatedView.extend({

            /**
             *  Initialization
             */
            
            didInsertElement: function () {
                if ($('.ui-page-active').page) {
                    $('.ui-page-active').page();
                }
            }
        });
    }
);

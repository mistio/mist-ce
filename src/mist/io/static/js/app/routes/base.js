define('app/routes/base', ['ember'],
    //
    //  Base Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Route.extend({

            documentTitle: '',

            setDocumentTitle: function () {
                document.title = this.get('documentTitle');
            }.observes('documentTitle'),

            activate: function () {
                this.setDocumentTitle();
            }
        });
    }
);

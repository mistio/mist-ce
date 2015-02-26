define('app/views/templated', ['ember'],
    //
    //  Templated View
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.View.extend({


            //
            //
            //  Initialization
            //
            //


            init: function () {

                this._super();

                var templateName = Mist.decapitalizeArray(
                    Mist.splitWords(
                        Mist.getViewName(this)
                    )
                ).join('_')

                this.set('template', Ember.TEMPLATES[templateName]);
            }
        });
    }
);

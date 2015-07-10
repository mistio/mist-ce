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
                //var templateName = this.__proto__._debugContainerKey.split(':')[1].toUnderscore();
                //warn(templateName);
                //this.set('templateName', this.templateForName(this.getName()));
            }
        });
    }
);

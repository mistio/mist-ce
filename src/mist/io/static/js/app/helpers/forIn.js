define('app/helpers/forIn', [],
    //
    //  forIn Helper
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.ForInHelper = Ember.Helper.extend({
            compute: function(params, hash) {
                var data = [], el, obj = params[0];

                // check if not empty the container object
                if (! $.isEmptyObject(obj)) {

                    // loop through pairs
                    for (el in obj) {
                        if(obj[el]) {
                            // If the value is not object or array
                            if (! (obj[el] instanceof Array) && ! (obj[el] instanceof Object)) {
                                data.push({key: el, value: obj[el]});
                            }
                        }
                    }

                    sortArr(data);
                }

                // Create final template
                function createTpl (data) {
                    var tpl = ''

                    for (var i = 0, len = data.length; i < len; i++) {
                        if (data[i].key == 'xml_description') {
                            tpl += "<tr><td>" + processKeys(data[i].key) + "</td>";
                            tpl += "<td><pre class='plain_code'>" + data[i].value + "</pre></td></tr>";
                        } else {
                            tpl += "<tr><td>" + processKeys(data[i].key) + "</td><td>" + data[i].value + "</td></tr>";
                        }
                    }

                    return tpl;
                }

                // Transform this 'abc_bcd_cde' to 'Abc Bcd Cde' for keys presentation
                function processKeys (str) {
                    var words = str.split('_'), result = '', gap, word;
                    for (var i = 0, len = words.length; i < len; i++) {
                        gap = i == 0 ? '' : ' ';
                        word = Ember.String.capitalize(words[i])
                        result += gap.concat(word);
                    }
                    return result;
                }

                // Sort metadata
                function sortArr (array) {
                    array.sort(function (a, b) {
                        var x = a.key; var y = b.key;
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });
                }

                // Ensure produced html won't be escaped
                return Ember.String.htmlSafe(createTpl(data));
            }
        });
    }
);

define('app/helpers/forIn', [],
    //
    //  forIn Helper
    //
    //  @returns Class
    //
    function () {

    	'use strict'

    	return App.ForInHelper = Ember.Helper.extend({
            compute(params, hash) {
        		var tpl = '', el, type, obj = params[0];

        		// check if not empty the container object
        		if (! $.isEmptyObject(obj)) {

        			// loop through pairs
        			for (el in obj) {
        				if(obj[el]) {

        					// If the value is not object or array
    	    				if (! (obj[el] instanceof Array) && ! (obj[el] instanceof Object)) {
    	    					tpl += "<tr><td>" + processString(el) + "</td><td>" + obj[el] + "</td></tr>";
    	    				}

    	    				// If the key is tags
    	    				if (el == 'tags') {
    	    					if (! $.isEmptyObject(obj[el])) {
    		    					var tags = obj[el], result = '', tag;
    		    					for (var i = 0, len = tags.length; i < len; i++) {
    		    						tag = tags[i];
    		    						result += '<span class="tag">' + tag + '</span>';
    		    					}
    		    					tpl += "<tr><td>Tags</td><td>" + result + "</td></tr>";
    		    				}
    	    				}
    	    			}
        			}
        		}

        		// Transform this 'abc_bcd_cde' to 'Abc Bcd Cde' for keys presentation
        		function processString(str) {
        			var words = str.split('_'), result = '', gap, word;
        			for (var i = 0, len = words.length; i < len; i++) {
        				gap = i == 0 ? '' : ' ';
        				word = Ember.String.capitalize(words[i])
        				result += gap.concat(word);
        			}
        			return result;
        		}

        		// Ensure produced html won't be escaped
        		return Ember.String.htmlSafe(tpl);
            }
    	});
    }
);
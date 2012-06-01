//js mist/scripts/doc.js

load('steal/rhino/rhino.js');
steal("documentjs").then(function(){
	DocumentJS('mist/mist.html', {
		markdown : ['mist']
	});
});
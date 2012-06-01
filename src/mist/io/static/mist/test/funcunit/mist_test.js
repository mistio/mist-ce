steal("funcunit", function(){
	module("mist test", { 
		setup: function(){
			S.open("//mist/mist.html");
		}
	});
	
	test("Copy Test", function(){
		equals(S("h1").text(), "Welcome to JavaScriptMVC 3.2!","welcome text");
	});
})
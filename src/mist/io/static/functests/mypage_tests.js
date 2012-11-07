
module("MistIoLocal", {
  setup: function() {
    // opens the page you want to test
    S.open("http://127.0.0.1:6543");
  }
});


test("Home page loaded", function(){
  ok( S("#home-menu li").size() == 2, "loaded home page")
});


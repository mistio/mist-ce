
module("MistIoLocal", {
  setup: function() {
    // opens the page you want to test
    S.open("http://127.0.0.1:6543");
  }
});


test("Home page loaded", function(){
  ok( S("#home-menu li").size() == 2, "loaded home page");

  var num = S("#cloud-buttons a").size();

  for(var i =0; i < num; i++){
    S("#cloud-buttons a:eq("+i+")").visible().click();
    S('#edit-cloud-ok').visible().click(); 
  }

  S('#machines-count').visible().click(); 

//  var num = S("#machines-list a").visible().size(1).size();
  //for(var i =0; i < num; i++){
    S("#machines-list a:eq("+0+")").visible().click();
    S("#single-machine a[data-direction=reverse]").visible().click();
  //}

  S("#machines a[data-icon=home]").visible().click();
  
  S('#images-count').visible().click(); 
  S("#images a[data-icon=home]").visible().click();
  
});


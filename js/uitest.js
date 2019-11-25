//test basic UI navigation
//
//
$(document).ready(function(){
  $.ajaxSetup({
    cache: false
  });
  // jQuery methods go here... (main logic)

  // prevent normal form submissions, we're using jQuery instead
  $("form").submit(function(event){
    event.preventDefault(); //prevent default action 
  });

  // default load
  $("div.viewport").load("html/home.html");

  // static link handlers
  $("a#prerequisites").click(function() {
     $("div.viewport").load("html/prerequisites-1.html");
  });

  $("a#begin").click(function() {
     $("div.viewport").load("html/configurator/connect.html");
  });

  $("a#overview").click(function() {
     $("div.viewport").load("html/overview.html");
  });

  $("a#home").click(function() {
     $("div.viewport").load("html/home.html");
  });

  $("a#logo").click(function() {
     $("div.viewport").load("html/home.html");
  });

  $("a#funneltest").click(function() {
     $("div.viewport").load("html/funnel-v2.html");
  });

  // global button handler
  $("div.viewport").on("click", "input:button", function() {
    switch(this.id)
    {
	case "connect":
	   $("div.viewport").load("html/configurator/main.html");
	   break;
	case "deleteApp":
	   $("div.viewport").load("html/configurator/listApp.html");
	   break;
	case "deleteFunnel":
	   $("div.viewport").load("html/configurator/listFunnel.html");
	   break;
	case "deleteTenant":
	   $("div.viewport").load("html/configurator/listTenant.html");
	   break;
	case "deployApp-1":
	   $("div.viewport").load("html/configurator/deployApp-1.html");
	   break;
	case "deployApp-2":
	   $("div.viewport").load("html/configurator/deployApp-2.html");
	   break;
	case "deployApp-3":
	   $("div.viewport").load("html/configurator/deployApp-3.html");
	   break;
	case "deployFunnel":
	   $("div.viewport").load("html/configurator/deployFunnel.html");
	   break;
	case "deployTenant":
	   $("div.viewport").load("html/configurator/deployTenant.html");
	   break;
	case "editFunnel":
	   alert("editFunnel");
	   break;
	case "funnelbuttons":
	   alert("funnelbuttons");
	   break;
	case "json":
	   alert("json");
	   break;
	case "listApp":
	   $("div.viewport").load("html/configurator/listApp.html");
	   break;
	case "listFunnel":
	   $("div.viewport").load("html/configurator/listFunnel.html");
	   break;
	case "listTenant":
	   $("div.viewport").load("html/configurator/listTenant.html");
	   break;
	case "minus":
	   alert("minus");
	   break;
	case "other":
	   alert("other");
	   break;
	case "plus":
	   alert("plus");
	   break;
	case "updateLabel":
	   alert("updateLabel");
	   break;
	case "upgradeTenant":
	   $("div.viewport").load("html/configurator/listTenant.html");
	   break;
	case "uploadApp":
	   $("div.viewport").load("html/configurator/listApp.html");
	   break;
	case "uploadFunnel":
	   $("div.viewport").load("html/configurator/listFunnel.html");
	   break;
	case "uploadTenant":
	   $("div.viewport").load("html/configurator/tenantMenu.html");
	   break;
	default:
	   alert("Unknown Button: " + this.id);
    }
  });

  //handle breadcrumb navigation
  $("div.viewport").on("click", "div a", function() {
    switch(this.id)
    {
	case "connect":
	   $("div.viewport").load("html/configurator/connect.html");
	   break;
	case "deployApp-1":
	   $("div.viewport").load("html/configurator/deployApp-1.html");
	   break;
	case "deployApp-2":
	   $("div.viewport").load("html/configurator/deployApp-2.html");
	   break;
	case "deployApp-3":
	   $("div.viewport").load("html/configurator/deployApp-3.html");
	   break;
	case "deployFunnel":
	   $("div.viewport").load("html/configurator/deployFunnel.html");
	   break;
	case "deployTenant":
	   $("div.viewport").load("html/configurator/deployTenant.html");
	   break;
	case "editFunnel":
	   alert("editFunnel");
	   break;
	case "listApp":
	   $("div.viewport").load("html/configurator/listApp.html");
	   break;
	case "listFunnel":
	   $("div.viewport").load("html/configurator/listFunnel.html");
	   break;
	case "listTenant":
	   $("div.viewport").load("html/configurator/listTenant.html");
	   break;
	case "pencil":
	   pencilToggle();
	   break;
	default:
	   alert("Unknown Breadcrumb: " + this.id);
    }
  });

});

function pencilToggle() {
  if( $("#whereClause").attr('readonly') ) {
    $("#whereClause").attr('readonly',false);
    $("#whereClause").addClass("pencilMode");
    //disable options LIs
    $("#goallist li").draggable({ disabled: true });
    $("#goallist li").addClass("pencilMode");
    //disable funnel
      //handled in funnelClickHandler
      options.block.fill.scale=d3.schemeGreys[9];
      options.label.fill="#000";
      chart.draw(data, options);
    //change pencil color
    $("#pencil").addClass("pencilMode");
  } else {
    $("#whereClause").attr('readonly',true);
    $("#whereClause").removeClass("pencilMode");
    $("#goallist li").draggable({ disabled: false});
    $("#goallist li").removeClass("pencilMode");
      options.block.fill.scale=d3.schemeCategory10;
      options.label.fill="#fff";
      chart.draw(data, options);
    $("#pencil").removeClass("pencilMode");

    updateWhere();
  }
}

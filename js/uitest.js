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
	case "deployApp":
	   $("div.viewport").load("html/configurator/deployApp.html");
	   break;
	case "deployFunnel-1":
	   $("div.viewport").load("html/configurator/deployFunnel-1.html");
	   break;
	case "deployFunnel-2":
	   $("div.viewport").load("html/configurator/deployFunnel-2.html");
	   break;
	case "deployFunnel-3":
	   $("div.viewport").load("html/configurator/deployFunnel-3.html");
	   break;
	case "deployFunnel-4":
	   $("div.viewport").load("html/configurator/deployFunnel-4.html");
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
	   if( $("input#whereClause").attr('readonly') ) { //do nothing if in pencil mode
		funnelData.pop();
		chart.draw(funnelData, options);
		updateWhere(funnelData);
	   }
	   break;
	case "other":
	   alert("other");
	   break;
	case "plus":
	   if( $("input#whereClause").attr('readonly') ) { //do nothing if in pencil mode
		funnelData.push({ label: 'name', value: '', clauses: [] });
		chart.draw(funnelData, options);
		updateWhere(funnelData);
	   }
	   break;
	case "updateLabel":
	   let i = $( "#labelForm input#i").val();
	   let label = $( "#labelForm #labelInput").val();
	   funnelData[i].label=label;
	   $( "#labelForm" ).hide();
	   chart.draw(funnelData, options);
	   updateWhere(funnelData);
	   break;
	case "upgradeTenant":
	   $("div.viewport").load("html/configurator/listTenant.html");
	   break;
	case "uploadApp":
	   $("div.viewport").load("html/configurator/listApp.html");
	   break;
	case "uploadTenant":
	   $("div.viewport").load("html/configurator/tenantMenu.html");
	   break;
	case "uploadFunnel":
	   selection.config.funnelData=funnelData;
	   //do upload here
	   $("div.viewport").load("html/configurator/deployFunnel-5.html");
	   break;
	case "downloadConfig":
	   download("myfunnel.json",JSON.stringify(selection.config));
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
	case "deployApp":
	   $("div.viewport").load("html/configurator/deployApp.html");
	   break;
	case "deployFunnel-1":
	   $("div.viewport").load("html/configurator/deployFunnel-1.html");
	   break;
	case "deployFunnel-2":
	   $("div.viewport").load("html/configurator/deployFunnel-2.html");
	   break;
	case "deployFunnel-3":
	   $("div.viewport").load("html/configurator/deployFunnel-3.html");
	   break;
	case "deployFunnel-4":
	   $("div.viewport").load("html/configurator/deployFunnel-4.html", function(){
	    var funnelData = [
		{ label: 'Home', value: '/easytravel/home', clauses: ['useraction.name="/easytravel/home"'] },
		{ label: 'Product', value: '/easytravel/product_detail', clauses: ['useraction.name="/easytravel/product_detail"'] },
		{ label: 'Cart', value: '/easytravel/add_to_cart', clauses: ['useraction.name="/easytravel/add_to_cart"'] },
		{ label: 'Order', value: '/easytravel/place_order', clauses: ['useraction.name="/easytravel/place_order"'] }
	    ];
	    chart.draw(funnelData, options);
	    updateWhere(funnelData);
	    $( "#goallist li" ).draggable();
	   });
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
    $("#goallist li").draggable({ disabled: true });
    $("#goallist li").addClass("pencilMode");
    //disable funnel
      //handled in funnelClickHandler
      options.block.fill.scale=d3.schemeGreys[9];
      options.label.fill="#000";
      chart.draw(funnelData, options);
    $("#pencil").addClass("pencilMode");
  } else if(confirm("Revert where clause to funnel?")) {
    $("#whereClause").attr('readonly',true);
    $("#whereClause").removeClass("pencilMode");
    $("#goallist li").draggable({ disabled: false});
    $("#goallist li").removeClass("pencilMode");
      options.block.fill.scale=d3.schemeCategory10;
      options.label.fill="#fff";
      chart.draw(funnelData, options);
    $("#pencil").removeClass("pencilMode");

    updateWhere(funnelData);

  }
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

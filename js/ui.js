//UI navigation & painting
//
//
$(document).ready(function(){
  jqueryInit();
  // jQuery methods go here... (main logic)


  // default page load
  $("div.viewport").load("html/home.html", function(){
    // static link handlers
    loadStaticHandlers();

    // global button handler
    $("div.viewport").on("click", "input:button", globalButtonHandler);

    //handle breadcrumb navigation
    $("div.viewport").on("click", "a", linkHandler);

  });

});

////////// Functions ////////////

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

function linkHandler(e) {
    if ($(this)[0].nodeName == 'A') {
      let a = $(this)[0];
      let id = a.id;
      if(a.classList.contains("newTab"))return e; //don't handle popups with jQuery
      switch(id) {
	case "bc-connect":
	   $("div.viewport").load("html/configurator/connect.html",fieldsetPainter);
	   break;
	case "bc-deployApp":
	   $("div.viewport").load("html/configurator/deployApp.html",fieldsetPainter);
	   break;
	case "bc-deployFunnel-1":
	   $("div.viewport").load("html/configurator/deployFunnel-1.html",fieldsetPainter);
	   break;
	case "bc-deployFunnel-2":
	   $("div.viewport").load("html/configurator/deployFunnel-2.html",fieldsetPainter);
	   break;
	case "bc-deployFunnel-3":
	   $("div.viewport").load("html/configurator/deployFunnel-3.html",fieldsetPainter);
	   break;
	case "bc-deployFunnel-4":
	   $("div.viewport").load("html/configurator/deployFunnel-4.html",fieldsetPainter);
	   break;
	case "bc-deployTenant":
	   $("div.viewport").load("html/configurator/deployTenant.html",fieldsetPainter);
	   break;
	case "bc-editFunnel":
	   alert("editFunnel");
	   break;
	case "bc-listApp":
	   $("div.viewport").load("html/configurator/listApp.html",fieldsetPainter);
	   break;
	case "bc-listFunnel":
	   $("div.viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
	   break;
	case "bc-listTenant":
	   $("div.viewport").load("html/configurator/listTenant.html",fieldsetPainter);
	   break;
	case "pencil":
	   pencilToggle();
	   break;
	case "folder":
	   $("#loadConfigDiv").toggle();
	   break;
	default:
	   alert("Unknown Breadcrumb: " + id);
	}
    }
}

function globalButtonHandler() {
    if ($(this)[0].nodeName == 'INPUT') {
      let id = $(this)[0].id;
      switch(id) {
	case "connect": 
	   url=$("input#url").val();
	   token=$("input#token").val();
	   let p_connect = testConnect();

	   $.when(p_connect).done(function(data) {
	     processTestConnect(data);
	     $("div.viewport").load("html/configurator/main.html",fieldsetPainter); 
	   });
	   break;
	case "deleteApp": {
  	   $(this).val("Deleting...");
  	   $(this).prop('disabled', true);
	   let TOid = $("#TOid").text();
	   let AOid = $(this)[0].parentNode.id;
	   let count = 1;
	  
	   let re = new RegExp("^"+AOid.substring(0,24));
	   DBAdashboards.forEach(function(db) {
	    if(re.test(db.id) && db.id!=AOid) {
		count++;
	     }
	   });

	   if(window.confirm("DELETE " + count + " dashboards? This cannot be undone...")) {
	     let p1 = deleteApp(AOid);

	     $.when(p1).done(function(){
  	       $(this).val("Deleted");
	       $("div.viewport").load("html/configurator/listApp.html",fieldsetPainter);
	       updateTenantOverview(TOid);
	     });
	   } else {
  	     $(this).val("Delete");
  	     $(this).prop('disabled', false);
	   }
	   break;
	}
	case "deleteFunnel": {
  	   $(this).val("Deleting...");
  	   $(this).prop('disabled', true);
	   let AOid = $("#AOid").text();
	   let FOid = $(this)[0].parentNode.id;
	   let count = 1;
	  
	   let re = new RegExp("^"+FOid.substring(0,24));
	   DBAdashboards.forEach(function(db) {
	    if(re.test(db.id) && db.id!=FOid) {
		count++;
	     }
	   });

	   if(window.confirm("DELETE " + count + " dashboards? This cannot be undone...")) {
	     let p1 = deleteFunnel(FOid);

	     $.when(p1).done(function(){
  	       $(this).val("Deleted");
	       $("div.viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
	       updateAppOverview(AOid);
	     });
	   } else {
  	     $(this).val("Delete");
  	     $(this).prop('disabled', false);
	   }
	   break;
	}
	case "deleteTenant": {
  	   $(this).val("Deleting...");
  	   $(this).prop('disabled', true);
	   let TOid = $(this)[0].parentNode.id;
	   let count = 1;
	  
	   let re = new RegExp("^"+TOid.substring(0,24));
	   DBAdashboards.forEach(function(db) {
	    if(re.test(db.id) && db.id!=TOid) {
		count++;
	     }
	   });

	   if(window.confirm("DELETE " + count + " dashboards? This cannot be undone...")) {
	     let p1 = deleteTenant(TOid);

	     $.when(p1).done(function(){
  	       $(this).val("Deleted");
	       $("div.viewport").load("html/configurator/listTenant.html",fieldsetPainter);
	     });
	   } else {
  	     $(this).val("Delete");
  	     $(this).prop('disabled', false);
	   }
	   break;
	}
	case "deployApp":
	   selection.TOid=$(this)[0].parentNode.id;
	   $("div.viewport").load("html/configurator/deployApp.html",fieldsetPainter);
	   break;
	case "deployAnotherApp":
	   selection.TOid=$("#TOid").text();
	   $("div.viewport").load("html/configurator/deployApp.html",fieldsetPainter);
	   break;
	case "deployAnotherFunnel":
	   $("div.viewport").load("html/configurator/deployFunnel-1.html",fieldsetPainter);
	   break;
	case "deployFunnel-1":
	   selection.AOid=$(this)[0].parentNode.id;
	   $("div.viewport").load("html/configurator/deployFunnel-1.html",fieldsetPainter);
	   break;
	case "deployFunnel-2":
	   selection.config.funnelName=$("#funnelName").val();
	   $("div.viewport").load("html/configurator/deployFunnel-2.html",fieldsetPainter);
	   break;
	case "deployFunnel-3":
	   selection.config.kpi=$("#usplist").val();
	   selection.config.kpiName=$("#kpiName").val();
	   $("div.viewport").load("html/configurator/deployFunnel-3.html",fieldsetPainter);
	   break;
	case "deployFunnel-4":
	   selection.config.compareFunnel=$("#compareFunnel").val();
	   selection.config.compareAppID=$("#compareAppList").val();
	   selection.config.compareAppName=$("#compareAppList option:selected").text();
	   selection.config.compareTime=$("#compareTimeList").val();
	   $("div.viewport").load("html/configurator/deployFunnel-4.html",fieldsetPainter);
	   break;
	case "deployTenant": 
	   let p_mz = getMZs();
	   $.when(p_mz).done(function(data1) {
	     processMZs(data1);
	     $("div.viewport").load("html/configurator/deployTenant.html",fieldsetPainter);
	   });
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
	   selection.TOid=$(this)[0].parentNode.id;
	   $("div.viewport").load("html/configurator/listApp.html",fieldsetPainter);
	   break;
	case "returnListFunnel":
	   selection.config={};
	   $("div.viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
	   break;
	case "listFunnel":
	   selection.AOid=$(this)[0].parentNode.id;
	   $("div.viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
	   break;
	case "listTenant":
	   $("div.viewport").load("html/configurator/listTenant.html",fieldsetPainter);
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
	   $("div.viewport").load("html/configurator/listTenant.html",fieldsetPainter);
	   break;
	case "uploadApp": {
  	   $("input#uploadApp").val("Uploading...");
  	   $("input#uploadApp").prop('disabled', true);
	   let TOid =$("#TOid").text(); 
	   let p1 = uploadAppOverview({
	     AOname: $("#appName").val(),
	     appID: $("#applist").val(), 
	     appName: $("#applist option:selected").text(),
	     TOid: TOid, 
	     TOname: $("#TOname").text()
	   });
	   $.when(p1) .done(function(){
  	     $("input#uploadApp").val("Uploaded");
	     $("div.viewport").load("html/configurator/listApp.html",fieldsetPainter);
	     updateTenantOverview(TOid);
	   });
	   break;
	}
	case "uploadTenant": {
  	   $("input#uploadTenant").val("Uploading...");
  	   $("input#uploadTenant").prop('disabled', true);
	   let p1 = uploadTenantOverview({
	   TOname: $("#TOname").val(),
	   mz: $("#mzlist").val(),  
	   mzname: $("#mzlist option:selected").text()
	   });  

	   $.when(p1).done(function(){
  	     $("input#uploadTenant").val("Uploaded");
	     $("div.viewport").load("html/configurator/listTenant.html",fieldsetPainter);
	   });
	   break;
	}
	case "uploadFunnel": {
	   //do upload here
	   selection.config.whereClause=$("#whereClause").val();
	   selection.config.funnelData=funnelData;

	   let p1 = uploadFunnel(selection.config);

	   $.when(p1).done(function(){
	     $("div.viewport").load("html/configurator/deployFunnel-5.html",fieldsetPainter);
	     updateAppOverview(selection.AOid);
	   });
	   break;
	}
	case "downloadConfig":
	   download("myfunnel.json",JSON.stringify(selection.config));
	   break;
	case undefined:
	   console.log("undefined button");
	   break;
	default:
	   alert("Unknown Button: " + id);
	   console.log($(this));
    }
    } else console.log($(this));
}

function loadStaticHandlers() {
  $("a#prerequisites").click(function() {
     $("div.viewport").load("html/prerequisites-1.html");
  });

  $("a#begin").click(function() {
     $("div.viewport").load("html/configurator/connect.html",fieldsetPainter);
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
}

function jqueryInit() {
  //prevent caching of XHR loads, consider turning off once production ready
  $.ajaxSetup({
    cache: false,
  });
  // prevent normal form submissions, we're using jQuery instead
  $("form").submit(function(event){
    event.preventDefault(); //prevent default action 
  });
  $(document).ajaxStart(function(){
      // show gif here, eg:
      $("#loaderwrapper").show();
    });
  $(document).ajaxStop(function(){
      // hide gif here, eg:
      $("#loaderwrapper").hide();
    });
}

function fieldsetPainter() {
    let id = $("fieldset").attr("id");
    switch(id) {
	case "connect":
	   $("#url").val(url);
	   $("#token").val(token);
	   break;
	case "main":
	   $("#owner").text(owner);
	   let p_DBA = getDBAdashboards();
	   $("#bc-connect").text(tenantID);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     $("#numDBADashboards").text(DBAdashboards.length);
	   });
	   break;
	case "deleteApp":
	   break;
	case "deleteFunnel":
	   break;
	case "deleteTenant":
	   break;
	case "deployAnotherApp": 
	case "deployApp": {
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);

	   let p1 = getApps();
	   $.when(p1).done(function(data) {
		drawApps(data);
	   });
	   break;
	}
	case "deployFunnel-1": {
	   let p1 = loadDashboard(configID(selection.AOid));
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);

	   $.when(p1).done(function(data) {
	     selection.config=parseConfigDashboard(data);
	     $("#appName").text(selection.config.appName);
	     $("#appID").text(selection.config.appID);
	   });
	   break;
	}
	case "deployFunnel-2": {
	   let p1 = getKPIs(selection.config.appName);
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-1").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);

	   $.when(p1).done(function(data) {
		let kpis = parseKPIs(data);
		drawKPIs(kpis);
	   });
	   break;
	}
	case "deployFunnel-3": {
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-1").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);

	   let p1 = getApps();
	   $.when(p1).done(function(data) {
		drawCompareApps(data);
	   });
	   break;
	}
	case "deployFunnel-4": {
	   let p1 = getGoals(selection.config.appName);
	   let p2 = getKeyActions(selection.config.appName);
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-1").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);
	   $("#goallist").html("");

	   funnelData = [
	        { label: 'Awareness', value: '', clauses: [] },
	        { label: 'Interest', value: '', clauses: [] },
	        { label: 'Evaluation', value: '', clauses: [] },
	        { label: 'Decision', value: '', clauses: [] }
	    ];
	    chart.draw(funnelData, options);
	    updateWhere(funnelData);

	   $.when(p1,p2).done(function(data1,data2) {
		addGoals(parseKeyActions(data2[0]));
		//addGoals(parseGoals(data1[0]));
	        $( "#goallist li" ).draggable();
	   });
	   break;
	}
	case "deployFunnel-5":
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-1").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);
	   $("#finalWhereClause").text(selection.config.whereClause);
	   break;
	case "deployTenant":
	   $("#bc-connect").text(tenantID);
	   drawMZs();
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
	case "listApp": {
	   let p_DBA = getDBAdashboards();
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawAppOverviewList(selection.TOid);
	   });
	   break;
	}
	case "listFunnel": {
	   let p_DBA = getDBAdashboards();
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#AOid").text(selection.AOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawFunnelList(selection.AOid);
	   });
	   break;
	}
	case "listTenant": {
	   let p_DBA = getDBAdashboards();
	   $("#bc-connect").text(tenantID);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawTenantOverviewList();
	   });
	   break;
	}
	case "updateLabel":
	   alert("updateLabel");
	   break;
	case "upgradeTenant":
	   break;
	case "downloadConfig":
	   break;
	default:
	   alert("Unknown Fieldset: " + id);
   }
}

function drawTenantOverviewList() {
  $("#tenantList").html("<dl></dl>");

  let TO = /bbbbbbbb-[0-9]{4}-0000-0000-000000000000/;
  DBAdashboards.forEach(function(dashboard) {
    if(TO.test(dashboard.id)) {
	let dt = "<dt><a target='_blank' href='"+url+"/#dashboard;id="+dashboard.id+"' class='newTab'>"+
	  dashboard.name+" <img src='images/link.svg'></a> ("+dashboard.owner+")</dt>";
	let dd = "<dd id='"+dashboard.id+"'>"+
	  "<input type='button' id='listApp' value='List App Overviews'>"+
          "<input type='button' id='deployApp' value='Deploy App Overview'>"+
          "<input type='button' id='deleteTenant' value='Delete'>"+
          "<input type='button' id='upgradeTenant' value='Upgrade'>"+
		"</dd>";
	$("#tenantList dl").append(dt+dd);
    } //else console.log(dashboardid+" did not match");
  });
}

function drawAppOverviewList(TOid) {
  $("#appList").html("<dl></dl>");
  
  let to = TOid.split("-")[1];
  let reS = "bbbbbbbb-"+to+"-[0-9]{4}-0000-000000000000";
  let re = new RegExp(reS);
  DBAdashboards.forEach(function(dashboard) {
    if(re.test(dashboard.id) && dashboard.id != TOid) {
	let dt = "<dt><a target='_blank' href='"+url+"/#dashboard;id="+dashboard.id+"' class='newTab'>"+
	  dashboard.name+" <img src='images/link.svg'></a> ("+dashboard.owner+")</dt>";
	let dd = "<dd id='"+dashboard.id+"'>"+
	  "<input type='button' id='listFunnel' value='List Funnels'>"+
          "<input type='button' id='deployFunnel-1' value='Deploy Funnel'>"+
          "<input type='button' id='deleteApp' value='Delete'>"+
		"</dd>";
	$("#appList dl").append(dt+dd);
    } //else console.log(dashboardid+" did not match");
  });
}

function drawFunnelList(AOid) {
  $("#funnelList").html("<dl></dl>");
  
  let to = AOid.split("-")[1];
  let ao = AOid.split("-")[2];
  let reS = "bbbbbbbb-"+to+"-"+ao+"-[0-9]{4}-000000000000";
  let re = new RegExp(reS);
  DBAdashboards.forEach(function(dashboard) {
    if(re.test(dashboard.id) && dashboard.id!=AOid) {
	let dt = "<dt><a target='_blank' href='"+url+"/#dashboard;id="+dashboard.id+"' class='newTab'>"+
	  dashboard.name+" <img src='images/link.svg'></a> ("+dashboard.owner+")</dt>";
	let dd = "<dd id='"+dashboard.id+"'>"+
          "<input type='button' id='editFunnel' value='Edit'>"+
          "<input type='button' id='deleteFunnel' value='Delete'>"+
		"</dd>";
	$("#funnelList dl").append(dt+dd);
    } //else console.log(dashboardid+" did not match");
  });
}

function drawMZs() {
  let options = "<option value=''></option>";
  MZs.forEach(function(mz) {
    options += "<option value='"+mz.id+"'>"+mz.name+"</option>";
  });
  $("#mzlist").html(options);
}

function drawApps(apps) {
  apps.sort((a, b) => (a.displayName.toLowerCase() > b.displayName.toLowerCase()) ? 1 : -1);
  let options = "<option value=''>None</option>";
  apps.forEach(function(app) {
    options += "<option value='"+app.entityId+"'>"+app.displayName+"</option>";
  });
  $("#applist").html(options);
}

function drawCompareApps(apps) {
  let options = "<option value=''>None</option>";
  apps.forEach(function(app) {
    options += "<option value='"+app.entityId+"'>"+app.displayName+"</option>";
  });
  $("#compareAppList").html(options);
}

function drawKPIs(kpis) {
  let options = "";
  kpis.forEach(function(kpi) {
    options += "<option value='"+kpi.type+"."+kpi.key+"'>"+kpi.key+"</option>";
  });
  $("#usplist").html(options);
}

function addGoals(goals) {
  let list = "";
  goals.goals.forEach(function(goal) {
     list += "<li class='ui-corner-all ui-widget-content'><input id='"+goal+
	     "' data-colname='"+goals.type+"' type='hidden'>"+goal+"</li>";
  });
  $("#goallist").append(list);
}

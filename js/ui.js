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

    loadInputChangeHandlers();
  });
  
  // get stuff from GitHub
  loadDBList();
});

////////// Functions ////////////

function pencilToggle(on) {
  if(on===true || $("#whereClause").attr('readonly') ) {
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
  } else if(on===false || confirm("Revert where clause to funnel?")) {
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
	case "bc-deployFunnel-name":
	   $("div.viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
	   break;
	case "bc-deployFunnel-kpi":
	   $("div.viewport").load("html/configurator/deployFunnel-kpi.html",fieldsetPainter);
	   break;
	case "bc-deployFunnel-compare":
	   $("div.viewport").load("html/configurator/deployFunnel-compare.html",fieldsetPainter);
	   break;
	case "bc-deployFunnel-funnel":
	   $("div.viewport").load("html/configurator/deployFunnel-funnel.html",fieldsetPainter);
	   break;
	case "bc-deployTenant":
	   $("div.viewport").load("html/configurator/deployTenant.html",fieldsetPainter);
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
    //a little cleanup first
    $("#errorBox").hide();
    $("#errorBox").html("");
    //handle buttons
    if ($(this)[0].nodeName == 'INPUT') {
      let id = $(this)[0].id;
      switch(id) {
	case "connect": 
	   url=$("input#url").val();
	   if(url.length>1 && url.charAt(url.length-1)=="/")
		url = url.substring(0,url.length-1);
	   token=$("input#token").val();
	   let p_connect = testConnect();

	   $.when(p_connect).done(function(data) {
	      processTestConnect(data);
	      $("div.viewport").load("html/configurator/main.html",fieldsetPainter); 
          processVersion(getVersion());
	   });
	   $.when(p_connect).fail(errorbox);
	   break;
	case "deleteApp": {
  	   $(this).val("Deleting...");
  	   $(this).prop('disabled', true);
	   let TOid = $("#TOid").text();
	   let AOid = $(this)[0].parentNode.id;
	   let count = 1;
	  
	   let re = new RegExp("^"+AOid.substring(0,19));
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
	  
	   let re = new RegExp("^"+TOid.substring(0,14));
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
	   selection.AOid=$("#AOid").text();
	   selection.funnelLoaded=false;
	   $("div.viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
	   break;
	case "deployFunnel":
	   selection.AOid=$(this)[0].parentNode.id;
	   selection.funnelLoaded=false;
	   $("div.viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
	   break;
	case "deployFunnel-name-next":
	   selection.config.funnelName=$("#funnelName").val();
	   $("div.viewport").load("html/configurator/deployFunnel-kpi.html",fieldsetPainter);
	   break;
	case "deployFunnel-kpi-next":
	   selection.config.kpi=$("#usplist").val();
	   selection.config.kpiName=$("#kpiName").val();
	   $("div.viewport").load("html/configurator/deployFunnel-funnel.html",fieldsetPainter);
	   break;
	case "deployFunnel-funnel-next":
	   selection.config.whereClause=$("#whereClause").val();
	   selection.config.funnelData=funnelData;
	   $("div.viewport").load("html/configurator/deployFunnel-compare.html",fieldsetPainter);
	   break;
	case "deployTenant": 
	   let p_mz = getMZs();
	   $.when(p_mz).done(function(data1) {
	     processMZs(data1);
	     $("div.viewport").load("html/configurator/deployTenant.html",fieldsetPainter);
	   });
	   break;
	case "editFunnel":
	   selection.FOid = $(this)[0].parentNode.id;
	   let p1 = loadDashboard(configID(selection.FOid));

	   $.when(p1).done(function(data) {
	       selection.config = parseConfigDashboard(data);
	       selection.funnelLoaded=true;
	       $("div.viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
	   }); 
	   break;
	case "json":
	   $("#jsonviewer").toggle();
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
	   selection.config.compareFunnel=$("#compareFunnel").val();
	   selection.config.compareAppID=$("#compareAppList").val();
	   selection.config.compareAppName=$("#compareAppList option:selected").text();
	   selection.config.compareFirstStep=$("#compareFirstStep option:selected").text();
	   selection.config.compareLastStep=$("#compareLastStep option:selected").text();
	   selection.config.compareRevenue=$("#compareRevenue").val();
	   selection.config.compareTime=$("#compareTimeList").val();
	   selection.config.campaignStep1=$("#campaignStep1").val();
	   selection.config.promHeaderStep=$("#promHeaderStep").val();
	   selection.config.campaignActive=$("#campaignActive").prop('checked');
	   //do upload here

	   let p1 = uploadFunnel(selection.config);

	   $.when(p1).done(function(){
	     $("div.viewport").load("html/configurator/deployFunnel-finish.html",fieldsetPainter);
	     updateAppOverview(selection.AOid);
	   });
	   break;
	}
	case "downloadConfig":
	   let filename = selection.config.funnelName + "-" +
			  Date.now() +
			  ".json";
	   download(filename,JSON.stringify( (({config}) => ({config}))(selection)  ));
	   break;
	case "loadConfig": {
	   let file = $("#funnelConfig").prop("files")[0];
           fr = new FileReader();
           fr.onload = function() {
		let res = fr.result;
		let json = JSON.parse(res);
		if('config' in json) {
		    selection.funnelLoaded=true;
		    selection.config = json.config;
		    fieldsetPainter();
		}
	   };
           fr.readAsText(file);
	   break;
	}
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

  $("#v5test").click(v5handler);

  $("#githubtest").click(function() {
    testRepo(0);      
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
	     jsonviewer(data);
	   });
	   break;
	case "deployAnotherApp": 
	case "deployApp": {
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);

	   let p0 = loadDashboard(configID(selection.TOid));
	   $.when(p0).done(function(d1) {
	     selection.config = parseConfigDashboard(d1);
	     let p1 = getApps(selection.config.mz);
	     $.when(p1).done(function(data) {
		jsonviewer(data);
		drawApps(data);
	     });
	   });
	   break;
	}
	case "deployFunnel-name": {
	   let p1 = (!selection.funnelLoaded ? loadDashboard(configID(selection.AOid)) : null);
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);

	   $.when(p1).done(function(data) {
	     jsonviewer(data);
	     if(!selection.funnelLoaded)
	       selection.config = parseConfigDashboard(data);
	     $("#appName").text(selection.config.appName);
	     $("#appID").text(selection.config.appID);

	     if('funnelName' in selection.config) $("#funnelName").val(selection.config.funnelName);
	   });
	   break;
	}
	case "deployFunnel-kpi": {
	   let p1 = getKPIs(selection.config.appName);
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);

	   $.when(p1).done(function(data) {
		jsonviewer(data);
		let kpis = parseKPIs(data);
		drawKPIs(kpis);

	     if('kpi' in selection.config) $("#usplist").val(selection.config.kpi);
	     if('kpiName' in selection.config) $("#kpiName").val(selection.config.kpiName);
	     uspListChangeHandler();
	   });
	   break;
	}
	case "deployFunnel-compare": {
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);

	   let p1 = getApps();
	   $.when(p1).done(function(data) {
	     jsonviewer(data);
	     drawCompareApps(data);

	     if('compareFunnel' in selection.config) $("#compareFunnel").val(selection.config.compareFunnel);
         if('compareAppID' in selection.config) $("#compareAppList").val(selection.config.compareAppID);
         if('compareTime' in selection.config) $("#compareTimeList").val(selection.config.compareTime);
         if('campaignActive' in selection.config) $("#campaignActive").prop('checked',selection.config.campaignActive);

	     let p2 = compareAppChangeHandler(); 
	     $.when(p2).done(function() {
               if('compareFirstStep' in selection.config) $("#compareFirstStep").val(selection.config.compareFirstStep);
               if('compareLastStep' in selection.config) $("#compareLastStep").val(selection.config.compareLastStep);
               if('compareRevenue' in selection.config) $("#compareRevenue").val(selection.config.compareRevenue);
	     });
         let p3 = campaignChangeHandler();
         $.when(p3).done(function() {
               if('campaignStep1' in selection.config) $("#campaignStep1").val(selection.config.campaignStep1);
               if('promHeaderStep' in selection.config) $("#promHeaderStep").val(selection.config.promHeaderStep);
         });
	   });
	   break;
	}
	case "deployFunnel-funnel": {
	   let p1 = getGoals(selection.config.appName);
	   let p2 = getKeyActions(selection.config.appName);
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);

	   //paint info we already have
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);
	   $("#goallist").html("");

	   //load the funnel and whereClause
           if("funnelData" in selection.config) funnelData=selection.config.funnelData;
	   else funnelData = [
	        { label: 'Awareness', value: '', clauses: [] },
	        { label: 'Interest', value: '', clauses: [] },
	        { label: 'Evaluation', value: '', clauses: [] },
	        { label: 'Decision', value: '', clauses: [] }
	    ];
	    chart.draw(funnelData, options);
	    updateWhere(funnelData);
	    if("whereClause" in selection.config &&
	       $("#whereClause").val() != selection.config.whereClause) {
		pencilToggle(true);
		$("whereClause").val(selection.config.whereClause);
	    }

	   //once XHRs are finished, do some stuff
	   $.when(p1,p2).done(function(data1,data2) {
		drawGoals(parseKeyActions(data2[0]));
		drawGoals(parseGoals(data1[0]));
	        $( "#goallist li" ).draggable();
		jsonviewer([data1[0],data2[0]]);
	   });
	   break;
	}
	case "deployFunnel-finish":
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);
	   $("#finalWhereClause").text(selection.config.whereClause);

	   $("#deployFunnel-finish").append("Uploaded: <a target='_blank' href='"+url+"/#dashboard;id="+selection.config.FOid+"' class='newTab'>"+
	      selection.config.dashboardName+" <img src='images/link.svg'></a>");
	   break;
	case "deployTenant":
	   $("#bc-connect").text(tenantID);
	   drawMZs();
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
	     jsonviewer(DBAdashboards); //do NOT display raw dashboard list
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
	     jsonviewer(DBAdashboards); //do NOT display raw dashboard list
	   });
	   break;
	}
	case "listTenant": {
	   let p_DBA = getDBAdashboards();
	   $("#bc-connect").text(tenantID);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawTenantOverviewList();
	     jsonviewer(DBAdashboards); //do NOT display raw dashboard list
	   });
	   break;
	}
	case "upgradeTenant":
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
          "<input type='button' id='deployFunnel' value='Deploy Funnel'>"+
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
  let options = "<option value=''>All</option>";
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
  let options = "<option value''>n/a</option>";
  kpis.forEach(function(kpi) {
    options += "<option value='"+kpi.type+"."+kpi.key+"'>"+kpi.key+"</option>";
  });
  $("#usplist").html(options);
}

function drawGoals(goals) {
  let list = "";
  goals.goals.forEach(function(goal) {
     let type = "";
     switch(goals.type) {
     case "useraction.name":
	type="KUA";
	break;
     case "useraction.matchingConversionGoals":
	type="Conv. Goal";
	break;
     }

     list += "<li class='ui-corner-all ui-widget-content'><input id='"+goal+
	"' data-colname='"+goals.type+"' type='hidden'><span class='goaltype'>"+
	type+"</span>: "+goal+"</li>";
  });
  $("#goallist").append(list);
}

function jsonviewer(result,show=false,name="",selector="#jsonviewer") {
  //Load the JSON viewer
  $(selector).hide();
  $(selector).load("html/jsonviewer.html", function(){
    $(selector+" #jsontitle").append(name);
    let json = JSON.stringify(result);
    if(json.length >10000) {
	let subjson = json.substring(0,10000);
	$(selector+" div#results").append("<pre>JSON to large to format!\n"+ subjson + 
	   "\n... plus " + (json.length - 10000) + " more characters.</pre>");
    } else {
	$(selector+" div#results").append(json);
	$('.jsonFormatter').jsonFormatter();
    }
    if(show){
	$(selector).show();
     	if($(selector).is(":visible")) $("input#json").val("Hide");
    }
  });
}
    
function loadInputChangeHandlers(){
    $("div.viewport").on("change", "#compareAppList", compareAppChangeHandler);
    $("div.viewport").on("change", "#usplist", uspListChangeHandler);
    $("div.viewport").on("change", "#campaignActive", campaignChangeHandler);
}

function compareAppChangeHandler(e){
  $("#compareFirstStep").html("");
  $("#compareLastStep").html("");
  $("#compareRevenue").html("");
  let compareApp = $("#compareAppList option:selected").text();

  if(compareApp != "None") {
    let p1 = getKeyActions(compareApp);
    let p2 = getKPIs(compareApp);

    return $.when(p1,p2).done(function(d1,d2) {
      let KAs = parseKeyActions(d1[0]);
      let kpis = parseKPIs(d2[0]);
      let KAlist = "";
      let KPIlist = "";

      if(KAs.goals.length>0) KAs.goals.forEach(function(ka) {
	    KAlist += "<option value='"+ka+"' data-colname='"+KAs.type+"'>"+ka+"</option>";
      });
      if(kpis.length>0) kpis.forEach(function(kpi) {
        KPIlist  += "<option value='"+kpi.type+"."+kpi.key+"'>"+kpi.key+"</option>";
      });
      $("#compareFirstStep").append(KAlist);
      $("#compareLastStep").append(KAlist);
      $("#compareRevenue").append(KPIlist);
      $("#compareFirstStep").show();
      $("#compareLastStep").show();
      $("#compareRevenue").show();
    });
  } else {
    $("#compareFirstStep").hide();
    $("#compareLastStep").hide();
    $("#compareRevenue").hide();
  }
}

function uspListChangeHandler(e) {
  if($("#usplist").val()=="n/a")
	$("#kpiName").hide();
  else
	$("#kpiName").show();
}

function campaignChangeHandler(e) {
  if($("#campaignActive").prop('checked')==true) {
    let p1 = getKeyActions(selection.config.appName);
    return $.when(p1).done(function(d1) {
        let KAs = parseKeyActions(d1); 
        let KAlist = "";
        if(KAs.goals.length>0) KAs.goals.forEach(function(ka) {
	      KAlist += "<option value='"+ka+"' data-colname='"+KAs.type+"'>"+ka+"</option>";
        });
        $("#campaignStep1").html(KAlist);
	    $(".campaignActive").show();
    });
  } else {
	$(".campaignActive").hide();
  }
}

function errorbox(jqXHR, textStatus, errorThrown) {
     let errorMsg = "dtAPIQuery failed ("+jqXHR.status+"): "+this.url;
     let responseText = "<pre>"+jqXHR.responseText.replace(/<([^>]*)>/g,"&lt$1&gt")+"</pre>";
     responseText = responseText.replace(/\n/g,"");
     if(errorThrown.length>0) errorMsg+="\nError: "+errorThrown;
     if(typeof(jqXHR.responseText)!=="undefined") errorMsg+="\nResponse: "+responseText;
     if(jqXHR.status==0) errorMsg+="\nPossible CORS failure, check Browser Console (F12)";
     $("#errorBox").html(errorMsg);
     $("#errorBox").show();
     console.log(errorMsg);
}

function v5handler() {
    v5test=(v5test?false:true);
    $("#v5test").text( (v5test?"Back to V4":"V5 Test") );
    loadDBList( (v5test?1:0) );
}

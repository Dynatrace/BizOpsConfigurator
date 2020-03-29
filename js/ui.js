//UI navigation & painting
//
//
$(document).ready(function(){
  jqueryInit();
  // jQuery methods go here... (main logic)

  // default page load
  $("#viewport").load("html/home.html", function(){
    staticCleanup();
    // static link handlers
    loadStaticHandlers();

    // global button handler
    $("#viewport, #repo_config").on("click", "input:button", globalButtonHandler);

    //anchor handler
    $("#bcwrapper, #viewport, #repo_config, #dashboard_list").on("click", "a", linkHandler);

    loadInputChangeHandlers();
  });
  
});

////////// Functions ////////////
function loadStaticHandlers() {
  $("a#prerequisites").click(function() {
     $("#viewport").load("html/prerequisites-1.html");
     staticCleanup();
  });

  $("a#begin").click(function() {
     $("#viewport").load("html/configurator/connect.html",fieldsetPainter);
  });

  $("a#overview").click(function() {
     $("#viewport").load("html/overview.html");
     staticCleanup();
  });

  $("a#home").click(function() {
     $("#viewport").load("html/home.html");
     staticCleanup();
  });

  $("a#logo").click(function() {
     $("#viewport").load("html/home.html");
     staticCleanup();
  });

  $("a#funneltest").click(function() {
     $("#viewport").load("html/funnel-v2.html");
     staticCleanup();
  });

  $("#v5test").click(v5handler);

  $("#githubtest").click(function() {
    testRepo(0);      
     staticCleanup();
  });

  $("#faq").click(function() {
     $("#viewport").load("html/faq.html");
     staticCleanup();
  });
  $("#arrow").click(function() {
        $("#lhs").hide();
        $("#hamburger").css('display', 'inline-flex');
  });
  $("#hamburger").click(function() {
        $("#lhs").show();
        $("#hamburger").hide();
  });
  $("#gear").click(function() {
        $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        $("#repo_config").show();
  });
  $("#dbbutton").click(function() {
        $("#dashboard_list").load("html/dashboard_list.html",fieldsetPainter);
        $("#dashboard_list").show();
  });
}

function staticCleanup() {
    $("#bcwrapper").hide();
    $("#errorbox").hide();
}

function loadInputChangeHandlers(){
    $("#viewport").on("change", "#compareAppList", compareAppChangeHandler);
    $("#viewport").on("change", "#compareAppList1, #compareAppList2", xappCompareAppChangeHandler);
    $("#viewport").on("change", "#usplist", uspListChangeHandler);
    $("#viewport").on("change", "#campaignActive", campaignChangeHandler);
    $("#viewport").on("change", "#featureAdded", featureChangeHandler);
    $("#viewport").on("change", "#authgithub", authgithubChangeHandler);
    $("#viewport").on("change", "#MyTime", MyTimeChangeHandler);
    $("#viewport").on("change", ".uspFilter", uspFilterChangeHandler);
    $("#viewport").on("change", ".regionFilter", regionsChangeHandler);
    $("#viewport").on("change", "#xapp", xappChangeHandler);
    $("#viewport").on("change", "#appOverview", appOverviewChangeHandler);
    $("#viewport").on("change", "#tenantOverview", tenantOverviewChangeHandler);
}

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
    $("#plus").prop( "disabled", true );
    $("#minus").prop( "disabled", true);
    
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
    if(selection.config.funnelData.length<=10)$("#plus").prop( "disabled", false );
    if(selection.config.funnelData.length>=2)$("#minus").prop( "disabled", false );

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
    if(typeof dtrum !== "undefined") dtrum.actionName("linkHandler("+id+")");
    if(a.classList.contains("newTab"))return e; //don't handle new tabs with jQuery
    if(a.classList.contains("dashboardList"))return e; //handled by custom listener
    switch(id) {
    case "bc-connect":
      //$("#viewport").load("html/configurator/connect.html",fieldsetPainter);
      selection.config={};
      $("#viewport").load("html/configurator/main.html",fieldsetPainter);
      break;
    case "bc-deployApp":
      $("#viewport").load("html/configurator/deployApp.html",fieldsetPainter);
      break;
    case "bc-deployFunnel-name":
      $("#viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
      break;
    case "bc-deployFunnel-kpi":
      $("#viewport").load("html/configurator/deployFunnel-kpi.html",fieldsetPainter);
      break;
    case "bc-deployFunnel-compare":
      $("#viewport").load("html/configurator/deployFunnel-compare.html",fieldsetPainter);
      break;
    case "bc-deployFunnel-filters":
      $("#viewport").load("html/configurator/deployFunnel-filters.html",fieldsetPainter);
      break;
    case "bc-deployFunnel-funnel":
      $("#viewport").load("html/configurator/deployFunnel-funnel.html",fieldsetPainter);
      break;
    case "bc-deployTenant":
      $("#viewport").load("html/configurator/deployTenant.html",fieldsetPainter);
      break;
    case "bc-listApp":
      selection.config={};
      $("#viewport").load("html/configurator/listApp.html",fieldsetPainter);
      break;
    case "bc-listFunnel":
      selection.config={};
      $("#viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
      break;
    case "bc-listTenant":
      selection.config={};
      $("#viewport").load("html/configurator/listTenant.html",fieldsetPainter);
      break;
    case "pencil":
      pencilToggle();
      break;
    case "folder":
      $("#loadConfigDiv").toggle();
      break;
    case "x_a":
      $(this).parent().parent().hide();
      break;
    case "revealToken":
      if($("#revealToken").hasClass("revealed")){
        $("#revealToken").removeClass("revealed");
        $("#token").prop('type','password');
      } else {
        $("#revealToken").addClass("revealed");
        $("#token").prop('type','text');
      }
      break;
    default:
      alert("Unknown Link: " + id);
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
      if(typeof dtrum !== "undefined") dtrum.actionName("globalButtonHandler("+id+")");
      switch(id) {
	case "connect": 
	   url=$("input#url").val();
	   if(url.length>1 && url.charAt(url.length-1)=="/")
		url = url.substring(0,url.length-1);
	   token=$("input#token").val();
       githubuser=$("#githubuser").val();
       githubpat=$("#githubpat").val();
	   let p_connect = testConnect();

	   $.when(p_connect).done(function(data) {
	      if(processTestConnect(data)) {
              $("#viewport").load("html/configurator/main.html",fieldsetPainter); 
              getVersion()
                .then(processVersion)
                .then(loadDBList)
                .then(downloadDBsFromList);
          }
	   });
	   $.when(p_connect).fail(errorboxJQXHR);
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
	       $("#viewport").load("html/configurator/listApp.html",fieldsetPainter);
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
	       $("#viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
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
	       $("#viewport").load("html/configurator/listTenant.html",fieldsetPainter);
	     });
	   } else {
  	     $(this).val("Delete");
  	     $(this).prop('disabled', false);
	   }
	   break;
	}
	case "deployApp":
	   selection.TOid=$(this)[0].parentNode.id;
       delete selection.AOid;
	   $("#viewport").load("html/configurator/deployApp.html",fieldsetPainter);
	   break;
	case "deployAnotherApp":
	   selection.TOid=$("#TOid").text();
       delete selection.AOid;
	   $("#viewport").load("html/configurator/deployApp.html",fieldsetPainter);
	   break;
	case "editApp": 
	   selection.AOid = $(this)[0].parentNode.id;
	   $("#viewport").load("html/configurator/deployApp.html",fieldsetPainter);
       break;
	case "deployAnotherFunnel":
	   selection.AOid=$("#AOid").text();
	   selection.funnelLoaded=false;
	   $("#viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
	   break;
	case "deployFunnel":
	   selection.AOid=$(this)[0].parentNode.id;
	   selection.funnelLoaded=false;
	   $("#viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
	   break;
	case "deployFunnel-name-next":
	    selection.config.funnelName=$("#funnelName").val();
        selection.config.journeyOverview = $("#journeyOverview").val();
        selection.config.journeyOverviewName = $("#journeyOverview option:selected").text();
        selection.config.xapp=$("#xapp").prop('checked');
        if(selection.config.xapp)
            selection.config.xapps=$("#xapp_apps").val();
        else
            delete selection.config.xapps;
	   $("#viewport").load("html/configurator/deployFunnel-kpi.html",fieldsetPainter);
	   break;
	case "deployFunnel-kpi-next":
	   selection.config.kpi=$("#usplist").val();
	   selection.config.kpiName=$("#kpiName").val();
	   $("#viewport").load("html/configurator/deployFunnel-funnel.html",fieldsetPainter);
	   break;
	case "deployFunnel-funnel-next":
	   selection.config.whereClause=$("#whereClause").val();
	   selection.config.funnelData=funnelData;
	   $("#viewport").load("html/configurator/deployFunnel-filters.html",fieldsetPainter);
	   break;
	case "deployFunnel-filters-next":
	   selection.config.filterClause=$("#filterClause").val();
	   selection.config.filterData={
        country: $("#countryList").val(),
        region: $("#regionList").val(),
        city: $("#cityList").val(),
        key: $("#uspKey").val(),
        type: $("#uspKey option:selected")[0].dataset['colname'],
        val: $("#uspVal").val()
       }
	   $("#viewport").load("html/configurator/deployFunnel-compare.html",fieldsetPainter);
	   break;
	case "deployTenant": 
	   let p_mz = getMZs();
	   $.when(p_mz).done(function(data1) {
	     processMZs(data1);
	     $("#viewport").load("html/configurator/deployTenant.html",fieldsetPainter);
	   });
	   break;
	case "editFunnel": {
           selection.FOid = $(this)[0].parentNode.id;
           let p1 = loadDashboard(configID(selection.FOid));

           $.when(p1).done(function(data) {
               selection.config = parseConfigDashboard(data);
               selection.funnelLoaded=true;
               $("#viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
           }); 
        }
	   break;
    case "updateFunnelForecast": {
        let button = $(this);
        let originalText = button.text();
        $(this).text('Updating...');
        let ov = $(this)[0].parentNode.id;
        let p1 = loadDashboard(configID(ov));

        //get some vals from a popup
        let popupHeader = "Enter expected traffic factor";
        let inputs = [{name:'tfactor', value:'100%', label:"Traffic Factor"}];
        let desc = "Allows you to adjust for expected traffic changes, ie 110% is a 10% increase, eg to account for an advertising spot. Keep at 100% normally.";

        $.when(p1).done(function(data) {
            selection.config = parseConfigDashboard(data);
            let popup_p = popup(inputs,popupHeader,desc);
            let p2 = generateFunnelForecast(selection.config);

            if(typeof selection.config.subids == "undefined")
                errorbox("Sorry, journey data is too old, please edit and re-upload, then try again.");
            else $.when(p2,popup_p).done(function(r1,r2) {
                selection.config.tfactor = r2[0].val.replace('%','');
                let revs=r1;
                let deferreds = updateFunnelForecast(selection.config,ov,revs);

                $.when.apply(deferreds).done(function() {
                    button.text(originalText);
                });
            });
        }); 
      }
      break;
    case "updateAppForecast": {
        let button = $(this);
        let originalText = button.text();
        $(this).text('Updating...');
        let ov = $(this)[0].parentNode.id;
        let p1 = loadDashboard(configID(ov));

        //get some vals from a popup
        let popupHeader = "Enter expected traffic factor";
        let inputs = [{name:'tfactor', value:'100%', label:"Traffic Factor"}];
        let desc = "Allows you to adjust for expected traffic changes, ie 110% is a 10% increase, eg to account for an advertising spot. Keep at 100% normally.";

        $.when(p1).done(function(data) {
            selection.config = parseConfigDashboard(data);
            popup_p = popup(inputs,popupHeader,desc);
            let p2 = generateAppForecast(selection.config);
            if(typeof selection.config.subids == "undefined")
                errorbox("Sorry, AppOverview data is too old, please edit and re-upload, then try again.");
            else $.when(p2,popup_p).done(function(r1,r2) {
                selection.config.tfactor = r2[0].val.replace('%','');
                let revs=r1;
                let deferreds = updateAppForecast(selection.config,ov,revs);

                $.when.apply(deferreds).done(function() {
                    button.text(originalText);
                });
            });
        }); 
      }
      break;
	case "json":
	   $("#jsonviewer").toggle();
	   break;
	case "listApp": 
	   selection.TOid=$(this)[0].parentNode.id;
        selection.config={};
	   $("#viewport").load("html/configurator/listApp.html",fieldsetPainter);
	   break;
	case "returnListFunnel":
	   selection.config={};
	   $("#viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
	   break;
	case "listFunnel":
	   selection.AOid=$(this)[0].parentNode.id;
        selection.config={};
	   $("#viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
	   break;
	case "listTenant":
        selection.config={};
	   $("#viewport").load("html/configurator/listTenant.html",fieldsetPainter);
	   break;
	case "minus":
	   if( $("input#whereClause").attr('readonly') &&
            funnelData.length>2) { //do nothing if in pencil mode
		funnelData.pop();
		chart.draw(funnelData, options);
		updateWhere(funnelData);
        $("#plus").prop( "disabled", false );
	   } else {
        $("#minus").prop( "disabled", true );
       }
	   break;
	case "other":
	   alert("other");
	   break;
	case "plus":
	   if( $("input#whereClause").attr('readonly') &&
            funnelData.length<10) { //do nothing if in pencil mode
		funnelData.push({ label: 'name', value: '', clauses: [] });
		chart.draw(funnelData, options);
		updateWhere(funnelData);
        $("#minus").prop( "disabled", false );
	   } else {
        $("#plus").prop( "disabled", true );
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
	/*case "upgradeTenant":
	   $("#viewport").load("html/configurator/listTenant.html",fieldsetPainter);
	   break;*/
	case "uploadApp": {
  	    $("input#uploadApp").val("Uploading...");
  	    $("input#uploadApp").prop('disabled', true);
	    let TOid =$("#TOid").text(); 
	    selection.config.MyCompareApp=$("#MyCompareApp").val();
	    selection.config.compareAppID=$("#compareAppList").val();
      selection.config.compareAppName=$("#compareAppList option:selected").text();
      selection.config.compareMZid=$("#compareMZ select").val();
      selection.config.compareMZname=$("#compareMZ select option:selected").text();
	    selection.config.MyTime=$("#MyTime").val();
	    selection.config.compareTime=$("#compareTimeList").val();
      selection.config.AOname=$("#appName").val();
	    selection.config.appID=$("#applist").val(); 
	    selection.config.appName=$("#applist option:selected").text();
	    selection.config.TOid=TOid; 
	    selection.config.TOname=$("#TOname").text();
      selection.config.appOverview= $("#appOverview").val();
      selection.config.appOverviewName= $("#appOverview option:selected").text();
      selection.config.ipUpperBound = $("#ipUpperBound").val();
      selection.config.ipLowerBound = $("#ipLowerBound").val();

        if(typeof $("#mz").val() != "undefined") {
          selection.config.mz=$("#mz").val();
          selection.config.mzname=$("#mzname").val();
        
        } else if(typeof $("#mzlist").val() != "undefined") {
          selection.config.mz=$("#mzlist").val();
	        selection.config.mzname=$("#mzlist option:selected").text();
        }

        let p0 = getAppDetail(selection.config.appID);
        $.when(p0).done(function(d0) {
            if(typeof d0 != "undefined") {
                let appDetail = parseAppDetail(d0);
                selection.config.costControlUserSessionPercentage=appDetail.costControlUserSessionPercentage;
            }

	        let p1 = uploadAppOverview(selection.config);
	        $.when(p1) .done(function(){
  	            $("input#uploadApp").val("Uploaded");
	            $("#viewport").load("html/configurator/listApp.html",fieldsetPainter);
	            updateTenantOverview(TOid);
	        });
        });
	   break;
	}
	case "uploadTenant": {
  	 $("input#uploadTenant").val("Uploading...");
     $("input#uploadTenant").prop('disabled', true);
     selection.config = {};
     selection.config.TOname = $("#TOname").val();
     selection.config.mz = $("#mzlist").val();
     selection.config.mzname = $("#mzlist option:selected").text();
     selection.config.tenantOverview = $("#tenantOverview").val();
     selection.config.tenantOverviewName = $("#tenantOverview option:selected").text();

	   let p1 = uploadTenantOverview(selection.config);  

	   $.when(p1).done(function(){
  	     $("input#uploadTenant").val("Uploaded");
	     $("#viewport").load("html/configurator/listTenant.html",fieldsetPainter);
	   });
	   break;
	}
	case "uploadFunnel": {
       if('xapp' in selection.config && selection.config.xapp) {
	        selection.config.compareFunnel=$("#xapp_compareFunnel").val();
            selection.config.xapp_compareAppID1=$("#compareAppList1").val();
	        selection.config.xapp_compareAppName1=$("#compareAppList1 option:selected").text();
            selection.config.xapp_compareAppID2=$("#compareAppList2").val();
	        selection.config.xapp_compareAppName2=$("#compareAppList2 option:selected").text();

           if(selection.config.xapp_compareAppName1!="None" && selection.config.xapp_compareAppName2!="None") {
              selection.config.compareFirstStep = {
                'colname': $("#xapp_compareFirstStep option:selected")[0].dataset['colname'],
                'name': $("#xapp_compareFirstStep option:selected").text()};
              selection.config.compareLastStep = {
                'colname': $("#xapp_compareLastStep option:selected")[0].dataset['colname'],
                'name': $("#xapp_compareLastStep option:selected").text()};
              selection.config.compareRevenue=$("#xapp_compareRevenue").val();
           }
       } else {
	        selection.config.compareFunnel=$("#compareFunnel").val();
	        selection.config.compareAppID=$("#compareAppList").val();
	        selection.config.compareAppName=$("#compareAppList option:selected").text();
           if(selection.config.compareAppName!="None" ) {
              selection.config.compareFirstStep = {
                'colname': $("#compareFirstStep option:selected")[0].dataset['colname'],
                'name': $("#compareFirstStep option:selected").text()};
              selection.config.compareLastStep = {
                'colname': $("#compareLastStep option:selected")[0].dataset['colname'],
                'name': $("#compareLastStep option:selected").text()};
              selection.config.compareRevenue=$("#compareRevenue").val();
           }
       }
	   selection.config.compareTime=$("#compareTimeList").val();
	   selection.config.campaignActive=$("#campaignActive").prop('checked');
       if(selection.config.campaignActive) {
	      selection.config.campaignStep1 = {'colname': $("#campaignStep1 option:selected")[0].dataset['colname'],
            'name': $("#campaignStep1").val()};
	      selection.config.promHeaderStep=$("#promHeaderStep").val();
       }
	   selection.config.featureAdded=$("#featureAdded").prop('checked');
       if(selection.config.featureAdded) {
	      selection.config.FeatureHeaderStep=$("#FeatureHeaderStep").val();
	      selection.config.StepNewFeature1= {'colname': $("#StepNewFeature1 option:selected")[0].dataset['colname'],
            'name': $("#StepNewFeature1").val()};
        }
	    selection.config.MyTime=$("#MyTime").val();
	    selection.config.compareTime=$("#compareTimeList").val();

        let p0 = getAppDetail(selection.config.appID);
        $.when(p0).done(function(d0) {
            if(typeof d0 != "undefined") {
                let appDetail = parseAppDetail(d0);
                selection.config.costControlUserSessionPercentage=appDetail.costControlUserSessionPercentage;
            }

	        let p1 = uploadFunnel(selection.config);

    	    $.when(p1).done(function(){
	            $("#viewport").load("html/configurator/deployFunnel-finish.html",fieldsetPainter);
	            updateAppOverview(selection.AOid);
	        });
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
    case "clearFunnel": {
        selection.config.funnelData.forEach(function(f,i,a) {
            a[i].value="";
            a[i].clauses=[];
        });
		updateWhere(selection.config.funnelData);
        selection.config.whereClause=$( "#whereClause").val();
	   $("#viewport").load("html/configurator/deployFunnel-funnel.html",fieldsetPainter);
        break;
    }
    case "reloadCSS": {
        var css = $("#css")[0];
        var queryString = '?reload=' + new Date().getTime();
        css.href = css.href.replace(/\?.*|$/, queryString);
        break;
    }
    case "saveRepoConfig": {
        repoList[1].owner = $("#default_repo_owner").val();
        repoList[1].repo = $("#default_repo_repo").val();
        repoList[0].owner = $("#old_repo_owner").val();
        repoList[0].repo = $("#old_repo_repo").val();
        oldVersion = parseInt($("#oldVersion").val());
        dbTagsVersion = parseInt($("#dbTagsVersion").val());
        dbTO = $("#dbTO").val();
        dbAO = $("#dbAO").val();
        dbFunnelTrue = $("#dbFunnelTrue").val();
        dbFunnelFalse = $("#dbFunnelFalse").val();
        
        $("input.repo_owner[data-index]").each(function(index, element) {
            let i = element.dataset.index;
            repoList[i].owner = element.value;
        });
        $("input.repo_repo[data-index]").each(function(index, element) {
            let i = element.dataset.index;
            if(element.value.includes('/')){
              let paths = element.value.split('/');
              repoList[i].repo = paths.shift();
              repoList[i].path = paths.join('/');
            } else {
              repoList[i].repo = element.value;
              repoList[i].path = '';
            }
        });
        $("input.tenantOverview_name[data-index]").each(function(index, element) {
            let i = element.dataset.index;
            tenantOverviews[i].name = element.value;
        });
        $("input.tenantOverview_filename[data-index]").each(function(index, element) {
            let i = element.dataset.index;
            tenantOverviews[i].filename = element.value;
        });
        $("input.appOverview_name[data-index]").each(function(index, element) {
            let i = element.dataset.index;
            appOverviews[i].name = element.value;
        });
        $("input.appOverview_filename[data-index]").each(function(index, element) {
            let i = element.dataset.index;
            appOverviews[i].filename = element.value;
        });
        $("input.journeyOverview_name[data-index]").each(function(index, element) {
            let i = element.dataset.index;
            journeyOverviews[i].name = element.value;
        });
        $("input.journeyOverview_filename[data-index]").each(function(index, element) {
            let i = element.dataset.index;
            journeyOverviews[i].filename = element.value;
        });
        break;
    }
    case "reloadDBs": {
        let p = loadDBList();
        $.when(p).done(function() {
            downloadDBsFromList();
        });
        break;
    }
    case "addRepo": {
      let owner = $("#add_repo_owner").val();
      let repo = $("#add_repo_repo").val();
      let path = "";
      if(repo.includes('/')){
        let paths = repo.split('/');
        repo = paths.shift();
        path = paths.join('/');
      } else {
        repo = repo;
        path = '';
      }
      repoList.push({'owner': owner, 'repo': repo, 'path': path});
      $("#repo_config").load("html/repo_config.html",fieldsetPainter);
      break;
    }
    case "addTenantOverview": {
        tenantOverviews.push({'name': $("#add_tenantOverview_name").val(), 'filename': $("#add_tenantOverview_filename").val()});
        $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        break;
    }
    case "addAppOverview": {
        appOverviews.push({'name': $("#add_appOverview_name").val(), 'filename': $("#add_appOverview_filename").val()});
        $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        break;
    }
    case "addJourneyOverview": {
        journeyOverviews.push({'name': $("#add_journeyOverview_name").val(), 'filename': $("#add_journeyOverview_filename").val()});
        $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        break;
    }
    case "deployAutoTag": {
        let tech = $("#deployAutoTag")[0].dataset['tech'];
        let appname = $("#applist option:selected").text();
        let swaps = [{'to': '${appname}', 'from': appname}];
        let p1 = deployAutoTag("json/autoTags/"+tech+".json",swaps);
        $.when(p1).done(appOverviewChangeHandler);
        break;
    }
    case "deployMZ": {
        let tech = $("#deployMZ")[0].dataset['tech'];
        let swaps = [];
        let p1 = deployMZ("json/managementZones/"+tech+"Overview.json",swaps);
        $.when(p1).done(appOverviewChangeHandler);
        break;
    }
    case "dashboardCleanup": {
	    $("#viewport").load("html/dashboardCleanup.html",fieldsetPainter);
        break;
    }
	case "":
	case undefined:
	   console.log("undefined button");
	   break;
	default:
	   alert("Unknown Button: " + id);
	   console.log($(this));
    }
  } else console.log($(this));
}

function jqueryInit() {
  //test for ES6 support and fail otherwise
    try {
      new Function("(a = 0) => a");
    }
    catch (err) {
      alert("Your browser is too old. Please use a modern browser.");
    }

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
    let id = $(this).find("fieldset").attr("id");
    $("#bcwrapper").show();
    $("#bcwrapper").empty();
    $("div.bc").prependTo($("#bcwrapper"));
    switch(id) {
    case "config":
        $("#default_repo_owner").val(repoList[1].owner);
        $("#default_repo_repo").val(repoList[1].repo);
        $("#old_repo_owner").val(repoList[0].owner);
        $("#old_repo_repo").val(repoList[0].repo);
        $("#oldVersion").val(oldVersion);
        $("#dbTagsVersion").val(dbTagsVersion);
        $("#dbTO").val(dbTO);
        $("#dbAO").val(dbAO);
        $("#dbFunnelTrue").val(dbFunnelTrue);
        $("#dbFunnelFalse").val(dbFunnelFalse);

        for(let i=2; i<repoList.length; i++) {
            let html = `<tr><td>Repo #${i}:</td><td class='right'><input type='text' class='repo_owner' data-index='${i}' value='${repoList[i].owner}'> / <input type='text' class='repo_repo' data-index='${i}' value='${repoList[i].repo}${repoList[i].path.length > 0 ? "/" + repoList[i].path : ''}'><input type='button' class='removeRepo' data-index='${i}' value='-'></td></tr>`;
            $("#additionalRepos").after(html);
        }
        $("input.removeRepo").on("click", function() { 
            let i = $(this)[0].dataset['index'];
            repoList.splice(i,1);
            $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        });
        
        for(let i=0; i<tenantOverviews.length; i++) {
            let html = `<tr><td>TenantOverview #${i}:</td><td class='right'><input type='text' class='tenantOverview_name' data-index='${i}' value='${tenantOverviews[i].name}'>: <input type='text' class='tenantOverview_filename' data-index='${i}' value='${tenantOverviews[i].filename}'><input type='button' class='removeTenantOverview' data-index='${i}' value='-'></td></tr>`;
            $("#tenantOverviews").after(html);
        }
        $("input.removeTenantOverview").on("click", function() { 
            let i = $(this)[0].dataset['index'];
            tenantOverviews.splice(i,1);
            $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        });
        
        for(let i=0; i<appOverviews.length; i++) {
            let html = `<tr><td>AppOverview #${i}:</td><td class='right'><input type='text' class='appOverview_name' data-index='${i}' value='${appOverviews[i].name}'>: <input type='text' class='appOverview_filename' data-index='${i}' value='${appOverviews[i].filename}'><input type='button' class='removeAppOverview' data-index='${i}' value='-'></td></tr>`;
            $("#appOverviews").after(html);
        }
        $("input.removeAppOverview").on("click", function() { 
            let i = $(this)[0].dataset['index'];
            appOverviews.splice(i,1);
            $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        });
        
        for(let i=0; i<journeyOverviews.length; i++) {
            let html = `<tr><td>JourneyOverview #${i}:</td><td class='right'><input type='text' class='journeyOverview_name' data-index='${i}' value='${journeyOverviews[i].name}'>: <input type='text' class='journeyOverview_filename' data-index='${i}' value='${journeyOverviews[i].filename}'><input type='button' class='removeJourneyOverview' data-index='${i}' value='-'></td></tr>`;
            $("#journeyOverviews").after(html);
        }
        $("input.removeJourneyOverview").on("click", function() { 
            let i = $(this)[0].dataset['index'];
            journeyOverviews.splice(i,1);
            $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        });
        
        break;
	case "connect":
	   $("#url").val(url);
	   $("#token").val(token);
        $("div.bc").hide();
	   break;
	case "main":
	   $("#owner").text(owner);
	   let p_DBA = getAllDashboards();
	   $("#bc-connect").text(tenantID);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     $("#numDBADashboards").text(DBAdashboards.length);
	     jsonviewer(data);
	   });
	   break;
	case "deployApp": {
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);

	   let p0 = loadDashboard(configID("AOid" in selection?selection.AOid:selection.TOid));
	   $.when(p0).done(function(d1) {
            selection.config = parseConfigDashboard(d1);
            drawTimeInterval( ("MyTime" in selection.config)?selection.config.MyTime:"Last 2 hours" );
            appOverviews.forEach(function(ov) {
                $("#appOverview").append("<option value='"+ov.filename+"'>"+ov.name+"</option>");
            });
            if("appOverview" in selection.config) $("#appOverview").val(selection.config.appOverview);
	        let p1 = getApps(selection.config.mz);
	        let p2 = getApps();
	        $.when(p1,p2).done(function(d1,d2) {
                let appList = d1[0];
                let compareAppList = d2[0];
                jsonviewer([appList,compareAppList]);
                drawApps(appList,selection.config);
                appOverviewChangeHandler();
                drawCompareApps(compareAppList,selection.config);
                MyTimeChangeHandler();
                if("AOname" in selection.config)$("#appName").val(selection.config.AOname);
                if("MyCompareApp" in selection.config)$("#MyCompareApp").val(selection.config.MyCompareApp);
	        });
	   });
        $("#applist").on("change",function(){ //autofill with app name
            if($("#appName").val()=="")
                $("#appName").val($("#appList option:selected").text());
        });
        $("#compareAppList").on("change",function(){ //autofil with compare app name
            if($("#MyCompareApp").val()=="")
                $("#MyCompareApp").val($("#compareAppList option:selected").text());
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
         journeyOverviews.forEach(function(ov) {
                $("#journeyOverview").append("<option value='"+ov.filename+"'>"+ov.name+"</option>");
         });
          if("journeyOverview" in selection.config) $("#journeyOverview").val(selection.config.journeyOverview);
         if("xapp" in selection.config)$("#xapp").prop('checked',selection.config.xapp);
         let p2 = xappChangeHandler();
         $.when(p2).done(function() {
            if("xapps" in selection.config)$("#xapp_apps").val(selection.config.xapps);
         });

	     if('funnelName' in selection.config) $("#funnelName").val(selection.config.funnelName);
	   });
	   break;
	}
	case "deployFunnel-kpi": {
	   let p1 = getKPIs(selection.config.xapp?selection.config.xapps:selection.config.appName);
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
    case "deployFunnel-filters": {
        let p1 = getUSPs(selection.config.xapp?selection.config.xapps:selection.config.appName);
        let p2 = getRegions(selection.config.xapp?selection.config.xapps:selection.config.appName);
        
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);
        $("#TOid").text(selection.TOid);
        $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
        $("#AOid").text(selection.AOid);
        $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
        $("#appName").text(selection.config.appName);
        $("#appID").text(selection.config.appID);
        $("#kpi").text(selection.config.kpiName);
        
        $.when(p1,p2).done(function(d1,d2) {
            let usps = d1[0];
            let regions = d2[0];
            jsonviewer([usps,regions]);
            parseUSPFilter(usps);
            parseRegions(regions);
            regionsChangeHandler();
            uspFilterChangeHandler();
            if("filterClause" in selection.config)
                $("#filterClause").val(selection.config.filterClause);
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
       drawTimeInterval( ("MyTime" in selection.config)?selection.config.MyTime:"Last 2 hours" );

        if("xapp" in selection.config && selection.config.xapp) {
            $("#xapp_compare").show();
            $("#compareApp").hide();
        }

	   let p1 = getApps();
	   $.when(p1).done(function(data) {
	     jsonviewer(data);
	     drawCompareApps(data,selection.config);

	     if('compareFunnel' in selection.config) $("#compareFunnel").val(selection.config.compareFunnel);
         if('compareAppID' in selection.config) $("#compareAppList").val(selection.config.compareAppID);
         if('campaignActive' in selection.config) $("#campaignActive").prop('checked',selection.config.campaignActive);
         if('featureAdded' in selection.config) $("#featureAdded").prop('checked',selection.config.featureAdded);

         if('xapp' in selection.config && selection.config.xapp) {
            if('xapp_compareAppID1' in selection.config) $("#compareAppList1").val(selection.config.xapp_compareAppID1);
            if('xapp_compareAppID2' in selection.config) $("#compareAppList2").val(selection.config.xapp_compareAppID2);
         }

	     let p2 = compareAppChangeHandler(); 
	     $.when(p2).done(function() {
               if('compareFirstStep' in selection.config) $("#compareFirstStep").val(selection.config.compareFirstStep.name);
               if('compareLastStep' in selection.config) $("#compareLastStep").val(selection.config.compareLastStep.name);
               if('compareRevenue' in selection.config) $("#compareRevenue").val(selection.config.compareRevenue);
	     });
         let p3 = campaignChangeHandler();
         $.when(p3).done(function() {
               if('campaignStep1' in selection.config) $("#campaignStep1").val(selection.config.campaignStep1.name);
               if('promHeaderStep' in selection.config) $("#promHeaderStep").val(selection.config.promHeaderStep);
         });
         let p4 = featureChangeHandler();
         $.when(p4).done(function() {
               if('StepNewFeature1' in selection.config) $("#StepNewFeature1").val(selection.config.StepNewFeature1.name);
               if('FeatureHeaderStep' in selection.config) $("#FeatureHeaderStep").val(selection.config.FeatureHeaderStep);
         });
	   });
	   break;
	}
	case "deployFunnel-funnel": {
       let mobileHack = (selection.config.appID.split('-')[0]=="APPLICATION"?false:true);
	   let p1 = getGoals(selection.config.xapp?selection.config.xapps:selection.config.appName);
	   let p2 = getKeyActions(selection.config.xapp?selection.config.xapps:selection.config.appName,mobileHack);
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
		drawSteps(parseSteps(data2[0]));
		drawSteps(parseSteps(data1[0]));
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

        tenantOverviews.forEach(function(ov) {
            $("#tenantOverview").append("<option value='"+ov.filename+"'>"+ov.name+"</option>");
        });
        if("tenantOverview" in selection.config) $("#tenantOverview").val(selection.config.tenantOverview);
	   break;
	case "listApp": {
	   let p_DBA = getAllDashboards();
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawAppOverviewList(selection.TOid);
	     jsonviewer(DBAdashboards); //do NOT display raw dashboard list
         if(version < 183) $("#updateAppForecast").hide();
         else $("#updateAppForecast").show();
	   });
	   break;
	}
	case "listFunnel": {
	   let p_DBA = getAllDashboards();
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
         if(version < 183) $("#updateFunnelForecast").hide();
         else $("#updateFunnelForecast").show();
	   });
	   break;
	}
	case "listTenant": {
	   let p_DBA = getAllDashboards();
	   $("#bc-connect").text(tenantID);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawTenantOverviewList();
	     jsonviewer(DBAdashboards); //do NOT display raw dashboard list
	   });
	   break;
	}
    case "dashboardList": {
      let html = "";
      let list = [].concat(tenantOverviews, appOverviews, journeyOverviews);
      let topLevelIDs = [];
      let usedIndexes = [];
      //get list of topLevelIDs
      list.forEach(function(overview) {
        let i = dbList.findIndex( ({ name }) => name === overview.filename );
        if(i > -1) topLevelIDs.push(dbList[i].file.id);
      });
      //traverse the list building sub dashboard list
      list.forEach(function(overview) {
        let i = dbList.findIndex( ({ name }) => name === overview.filename );
        usedIndexes.push(i);
        if(i < 0) {
            html += "<li>"+overview.name+" ("+overview.filename+")</li>";
        } else {
            html += "<li>"+overview.name+" - (<a class='dashboardList' href='#json' data-index='"+i+"'>"+overview.filename+"</a>):<br><ul>"
            let subs = getStaticSubDBs(dbList[i].file,topLevelIDs);
            subs.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
            subs.forEach(function(s) {
                let j = dbList.findIndex( ({ name }) => name === s.name );
                usedIndexes.push(j);
                html += "<li><a class='dashboardList' href='#json' data-index='"+j+"'>"+s.name+"</a></li>"
            });
            html += "</ul></li>";
        }
      });
      //find a list of orphans
      let orphanIndexes = [];
      for(let i of dbList.keys()) {
        if(!usedIndexes.includes(i)) orphanIndexes.push(i);
      }
      if(orphanIndexes.length > 0) {
        html += "<li>Orphan Dashboards::<br><ul>";
        orphanIndexes.forEach(function(i) {
                html += "<li><a class='dashboardList' href='#json' data-index='"+i+"'>"+dbList[i].name+"</a></li>"
        });
        html += "</ul></li>";
      }
      $("#dashboardList ul").html(html);
      $("#dashboardList ul").on("click", "a", function() { 
        let i = $(this)[0].dataset['index'];
        jsonviewer(dbList[i].file,true,dbList[i].name,"#popupjsonviewer"); 
      });
      break;
    }
    case "dashboardCleanup": {
        let p1 = getAllDashboards();

        $.when(p1).done(function(data) {
            let allDBs = data["dashboards"];
            
            //get owners and number of dashboards
            let owners = new Map();
            for(const x of allDBs) {
                if(!owners.has(x.owner))
                    owners.set(x.owner, 1);
                else
                    owners.set(x.owner, owners.get(x.owner)+1);
            } 

            //sort
            owners = new Map(Array
                .from(owners)
                .sort((a,b) => b[1] - a[1]));

            //sum 
            let total = [...owners].reduce((acc,val) => acc + val[1], 0);

            //print out the list of owners and counts
            let html = "";
            for(let [owner,count] of owners) {
                html += "<li>"+owner+": "+count+"</li>";
            }
            html += "";
            $("#dashboardCleanup ul").append(html);
            $("#total").text(total);
            $("#owners").text(owners.size);
        });
        break;
    }
	/*case "upgradeTenant":
	   break;*/
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
	      "<input type='button' id='listFunnel' value='List Journeys'>"+
          "<input type='button' id='deployFunnel' value='Deploy Journey'>"+
          "<input type='button' id='updateAppForecast' value='Update Forecast'>"+
          "<input type='button' id='editApp' value='Edit App Overview'>"+
          "<input type='button' id='deleteApp' value='Delete App Overview'>"+
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
          "<input type='button' id='updateFunnelForecast' value='Update Forecast'>"+
          "<input type='button' id='editFunnel' value='Edit'>"+
          "<input type='button' id='deleteFunnel' value='Delete'>"+
		"</dd>";
	$("#funnelList dl").append(dt+dd);
    } //else console.log(dashboardid+" did not match");
  });
}

function drawMZs(locator="#mzlist") {
  let p0 = $.Deferred();
  let p = (MZs.length<1?getMZs():$.when(false));
  $.when(p).done(function(d) {
    if(d!=false) processMZs(d);
    let options = "<option value=''>All</option>";
    MZs.forEach(function(mz) {
      options += "<option value='"+mz.id+"'>"+mz.name+"</option>";
    });
    $(locator).html(options);
    p0.resolve();
  });
  return p0;
}

function drawApps(apps,config) {
  apps.sort((a, b) => (a.displayName.toLowerCase() > b.displayName.toLowerCase()) ? 1 : -1);
  //let options = "<option value=''>None</option>"; //this was for Shady's cross app journey idea
  let options = "";
  apps.forEach(function(app) {
    options += "<option value='"+app.entityId+"'>"+app.displayName+"</option>";
  });
  $("#applist").html(options);

  if("appID" in config)$("#applist").val(config.appID);
}

function drawCompareApps(apps,config) {
  let options = "<option value=''>None</option>";
  apps.forEach(function(app) {
    options += "<option value='"+app.entityId+"'>"+app.displayName+"</option>";
  });
  $("#compareAppList").html(options);
  $("#compareAppList1").html(options);
  $("#compareAppList2").html(options);

  if("compareAppID" in config)$("#compareAppList").val(config.compareAppID);
  if("xapp_compareAppID1" in config)$("#compareAppList1").val(config.compareAppID1);
  if("xapp_compareAppID2" in config)$("#compareAppList2").val(config.compareAppID2);
}

function drawKPIs(kpis) {
  let options = "<option value''>n/a</option>";
  kpis.forEach(function(kpi) {
    options += "<option value='"+kpi.type+"."+kpi.key+"'>"+kpi.key+"</option>";
  });
  $("#usplist").html(options);
}

function drawSteps(steps) {
  let list = "";
  steps.steps.forEach(function(step) {
     let type = "";
     switch(steps.type) {
     case "useraction.name":
	type="KUA";
	break;
     case "useraction.matchingConversionGoals":
	type="Conv. Goal";
	break;
     }

     list += "<li class='ui-corner-all ui-widget-content tooltip'><input id='"+step.step+
	"' data-colname='"+steps.type+"' data-appName='"+step.appName+"' " +
    "type='hidden'><span class='steptype'>"+
	type+"</span>: "+step.step+
    ("xapp" in selection.config && selection.config.xapp ? 
        "<span class='tooltiptext'>"+step.appName+"</span>"
    :"")+
    "</li>";
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
	    //let subjson = json.substring(0,10000);
	    $(selector+" div#results").append("<span class='warning'>JSON too large to pretty format!</span>\n");
        //$(selector+" div#results").append(subjson + "\n... plus " + (json.length - 10000) + " more characters.</pre>");
	    $(selector+" div#results").append("<pre>"+JSON.stringify(result,null,2)+"</pre>\n");
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
    
function compareAppChangeHandler(e){
  $("#compareFirstStep").html("");
  $("#compareLastStep").html("");
  $("#compareRevenue").html("");
  let compareApp = $("#compareAppList option:selected").text();

  if(compareApp != "None") {
    let p1 = getKeyActions(compareApp);
    let p2 = getKPIs(compareApp);

    return $.when(p1,p2).done(function(d1,d2) {
      let KAs = parseSteps(d1[0]);
      let kpis = parseKPIs(d2[0]);
      let KAlist = "";
      let KPIlist = "";

      if(KAs.steps.length>0) KAs.steps.forEach(function(ka) {
	    KAlist += "<option value='"+ka.step+"' data-colname='"+KAs.type+"'>"+ka.step+"</option>";
      });
      if(kpis.length>0) kpis.forEach(function(kpi) {
        KPIlist  += "<option value='"+kpi.type+"."+kpi.key+"'>"+kpi.key+"</option>";
      });
      $("#compareFirstStep").append(KAlist);
      $("#compareLastStep").append(KAlist);
      $("#compareRevenue").append(KPIlist);
      $(".compareApp").show();
    });
  } else {
    $(".compareApp").hide();
  }
}

function xappCompareAppChangeHandler(e){
  $("#xapp_compareFirstStep").html("");
  $("#xapp_compareLastStep").html("");
  $("#xapp_compareRevenue").html("");
  let compareApp1 = $("#compareAppList1 option:selected").text();
  let compareApp2 = $("#compareAppList2 option:selected").text();

  if(compareApp1 != "None" && compareApp2 != "None") {
    let p1 = getKeyActions(compareApp1);
    let p2 = getKPIs([compareApp1,compareApp2]);
    let p3 = getKeyActions(compareApp2);

    return $.when(p1,p2,p3).done(function(d1,d2,d3) {
      let KAs1 = parseSteps(d1[0]);
      let KAs2 = parseSteps(d3[0]);
      let kpis = parseKPIs(d2[0]);
      let KAlist1 = "";
      let KAlist2 = "";
      let KPIlist = "";

      if(KAs1.steps.length>0) KAs1.steps.forEach(function(ka) {
	    KAlist1 += "<option value='"+ka.step+"' data-colname='"+KAs1.type+"'>"+ka.step+"</option>";
      });
      if(KAs2.steps.length>0) KAs2.steps.forEach(function(ka) {
	    KAlist2 += "<option value='"+ka.step+"' data-colname='"+KAs2.type+"'>"+ka.step+"</option>";
      });
      if(kpis.length>0) kpis.forEach(function(kpi) {
        KPIlist  += "<option value='"+kpi.type+"."+kpi.key+"'>"+kpi.key+"</option>";
      });
      $("#xapp_compareFirstStep").append(KAlist1);
      $("#xapp_compareLastStep").append(KAlist2);
      $("#xapp_compareRevenue").append(KPIlist);
      $(".xapp_compare").show();
    });
  } else {
    $(".xapp_compare").hide();
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

function featureChangeHandler(e) {
  if($("#featureAdded").prop('checked')==true) {
    let p1 = getKeyActions(selection.config.appName);
    return $.when(p1).done(function(d1) {
        let KAs = parseKeyActions(d1); 
        let KAlist = "";
        if(KAs.goals.length>0) KAs.goals.forEach(function(ka) {
	      KAlist += "<option value='"+ka+"' data-colname='"+KAs.type+"'>"+ka+"</option>";
        });
        $("#StepNewFeature1").html(KAlist);
	    $(".featureAdded").show();
    });
  } else {
	$(".featureAdded").hide();
  }
}

function errorboxJQXHR(jqXHR, textStatus, errorThrown) {
    var errorMsg = "";
     switch(jqXHR.status) { 
        case 429: {//rate limiting
            $("#errorBox").addClass("info"); 
            let seconds = 0;
            try {
                let then = jqXHR.responseText.match(/Reset time:.*\(([0-9]+)\)/)[1];
                let now = new Date().getTime();
                seconds = (then - now)/1000;
            } catch(e) {seconds=60;} //if we didn't capture the reset time, just default to a minute
            errorMsg = "API Ratelimit Exceeded. Will automatically retry in "+seconds+" seconds...";
            break;
        }
        case 0: { //probably CORS error 
            $("#errorBox").removeClass("info"); 
            errorMsg+="Browser blocked XHR call, check Browser Console (F12).\nPossible CORS failure on "+
                this.url+".";
            break;
        }
        default: {
         errorMsg = "dtAPIQuery failed ("+jqXHR.status+"): "+this.url;
         if(this.url.includes('v1/dashboards')){
           let name = this.data.match(/dashboardMetadata[^}]*(name"?:"[^"]*")/);
           if(name!==null && name.length>2) errorMsg += ` (${name[1]})`;
         }
         if(errorThrown.length>0) errorMsg+="\nError: "+errorThrown;
         if(typeof(jqXHR.responseText)!=="undefined") {
            let responseText = "<pre>"+jqXHR.responseText.replace(/<([^>]*)>/g,"&lt$1&gt")+"</pre>";
            responseText = responseText.replace(/\n/g,"");
            errorMsg+="\nResponse: "+responseText;
         }
        }
     }
     $("#errorBox").html(errorMsg);
     $("#errorBox").show();
     console.log(errorMsg);
    if(typeof dtrum !== "undefined") dtrum.reportError(errorMsg);
}

function errorbox(e) {
    var errorMsg =""
    if(e instanceof Error)
        errorMsg = "ERROR! "+e.name+": "+e.message;
    if(typeof e == "string")
        errorMsg = e;
    $("#errorBox").html(errorMsg);
    $("#errorBox").show();
    console.log(errorMsg);
    if(typeof dtrum !== "undefined") dtrum.reportError(errorMsg);
}

function v5handler() {
    v5test=(v5test?false:true);
    $("#v5test").text( (v5test?"Back to V4":"V5 Test") );
    loadDBList( (v5test?1:0) );
}

function authgithubChangeHandler() {
  if($("#authgithub").prop('checked')==true) {
    $("tr.github").show();
  } else {
    $("tr.github").hide();
  }
}

function MyTimeChangeHandler() {
  selection.config.MyTime = $("#MyTime").val();
  let compareTimeList = "";
  
  timeTable.forEach(function(t) {
    if(t.MyTime == selection.config.MyTime) {
        t.MyCompareTimes.forEach(function(ct) {
            compareTimeList += "<option value='"+ct+"'>"+ct+"</option>";
        });
    }
  });
  $("#compareTimeList").html(compareTimeList);
  if("compareTime" in selection.config && selection.config.compareTime > "")
    $("#compareTimeList").val(selection.config.compareTime);
  else
    $("#compareTimeList option:first").attr('selected','selected');
}

function drawTimeInterval(v) {
  let timeList = "";
  
  timeTable.forEach(function(t) {
    if(typeof t.MyTime !== "undefined")
     timeList += "<option value='"+t.MyTime+"'>"+t.MyTime+"</option>";
  });
  $("#MyTime").html(timeList);
  $("#MyTime").val(v);
  MyTimeChangeHandler();
}

function popup(inputs,popupHeader,desc) {
  let deferred = new $.Deferred();
  let html = "<div id='popup'>" +
    "<span class='header'>"+popupHeader+"</span>" +
    "<table>";

  inputs.forEach(function(i) {
    html += "<tr><td>"+i.label+": </td>";
    html += "<td><input name='"+i.name+"' value='"+i.value+"'></td></tr>";
  });

  html += "<tr><td colspan=2 class='desc'>"+desc+"</td></tr>";
  html += "<tr><td colspan=2><input type='button' name='ok' value='Ok' id='popup_ok'></td></tr></table></div>";
  $("#viewport").append(html);
  $("#popup_ok").on("click", function() { popout(deferred); });

  return deferred;
}

function popout(popup_p) {
  let outputs=[];
  $("#popup input").each(function() { 
    let output= {
        name:$(this).attr('name'),
        val:$(this).val() };
    outputs.push(output);
  });
  $("#popup").remove();

  popup_p.resolve(outputs);
}

function regionsChangeHandler() {
  let countryOs = "<option value''></option>";
  let regionOs = "<option value''></option>";
  let cityOs = "<option value''></option>";
  let country = $("#countryList").val();
  let region = $("#regionList").val();
  let city = $("#cityList").val();

  if(typeof selection.config.filterData!="undefined") {
    if(country=="") country=selection.config.filterData.country;
    if(region=="") region=selection.config.filterData.region;
    if(city=="") city=selection.config.filterData.city;
  }
  
  let countries = [...new Set(Regions.map(x => x.country))];
  countries.forEach(function(c) {
    countryOs += "<option value='"+c+"'>"+c+"</option>";
  });
  $("#countryList").html(countryOs);

  //determine regions
  if(country != '') {
    $("#countryList").val(country);
    let map = new Map();
    for(let i of Regions){
        if(!map.has(i.region) && i.country==country) {
            map.set(i.region, true);
            regionOs += "<option value='"+i.region+"'>"+i.region+"</option>";
        }
    }
    $("#regionList").html(regionOs);
    $("#regionList").show();
  } else $("#regionList").hide();

  //determine cities
  if(region != '') {
    $("#regionList").val(region);
    let map = new Map();
    for(let i of Regions){
        if(!map.has(i.city) && i.country==country && i.region==region) {
            map.set(i.city, true);
            cityOs += "<option value='"+i.city+"'>"+i.city+"</option>";
        }
    }
    $("#cityList").html(cityOs);
    $("#cityList").show();
  } else $("#cityList").hide();

  if(city != '') {
    $("#cityList").val(city);
  }
  $("#filterClause").val(buildFilterClause()); 
}

function uspFilterChangeHandler() {
  let keyOs = "<option value''></option>";
  let valOs = "<option value''></option>";
  let key = $("#uspKey").val();
  let type = (($("#uspKey option:selected").length>0)?
    $("#uspKey option:selected")[0].dataset['colname']:
    undefined);
  let val = $("#uspVal").val();

  if(typeof key == "undefined" || key=='') { //build out key list if needed
      Object.keys(USPs).forEach(function(t) {
        Object.keys(USPs[t]).forEach(function(k) {
            keyOs += "<option value='"+k+"' data-colname='"+t+"'>"+k+"</option>";
        });
      });
      $("#uspKey").html(keyOs);
      $("#uspVal").hide();
  } 

  if(typeof selection.config.filterData!="undefined") { //load config if available
    if(val=="")val=selection.config.filterData.val;
    if(type=="")type=selection.config.filterData.type;
    if(key=="")key=selection.config.filterData.key;
    if(type != "") $("#uspKey").attr('data-colname',type);
    if(key != "") $("#uspKey").val(key);
  }

  if(key != ""){  //if we have the key draw the values
    if(typeof USPs[type]!="undefined" &&
      typeof USPs[type][key]!="undefined") 
      USPs[type][key].forEach(function(v) {
            valOs += "<option value='"+v+"'>"+v+"</option>";
    });
    $("#uspVal").html(valOs);
    $("#uspVal").show();
    if(val != '') $("#uspVal").val(val);
  } 
   
  $("#filterClause").val(buildFilterClause()); 
}

function buildFilterClause() {
  let country = $("#countryList").val();
  let region = $("#regionList").val();
  let city = $("#cityList").val();
  let key = $("#uspKey").val();
  let type = (($("#uspKey option:selected").length>0)?
    $("#uspKey option:selected")[0].dataset['colname']:
    undefined);
  let val = $("#uspVal").val();
  let filterClause = "";
  let filters = [];

  if(country!='' && country!=null)filters.push('usersession.country="'+country+'"');
  if(region!='' && region!=null)filters.push('usersession.region="'+region+'"');
  if(city!='' && city!=null)filters.push('usersession.city="'+city+'"');
  if(key!='' && type!='' && val!='' &&
     key!=null && type!=null && val!=null)
    filters.push(type+'.'+key+'="'+val+'"');

  filterClause = filters.length>0?
    " AND (" + filters.join(" AND ") + ")":
    "";

  return filterClause;
}

function xappChangeHandler() {
  var p1 = {};
  if($("#xapp").prop('checked')) {
    p1 = getApps();
    $.when(p1).done(function(d1) {
        let apps = d1;
        let apps_html = "";
        apps.sort((a, b) => (a.displayName.toLowerCase() > b.displayName.toLowerCase()) ? 1 : -1);
        apps.forEach(function(app) {
            apps_html += "<option value='"+app.displayName+"' data_id='"+app.entityId+"'>"+app.displayName+"</option>";
        });
        $("#xapp_apps").html(apps_html);
        $(".xapps").show();
        //if("appID" in config)$("#xapp_apps").val(config.appID); //figure out how to set multiple values
    });
  }
  else
    $(".xapps").hide();

  return p1;
}

function appOverviewChangeHandler() {
    var AO = $("#appOverview").val();

    $("#autoTag").hide();
    $("#compareApp").hide();
    $("#compareTime").hide();
    $("#remoteEmployeeInputs").hide();

    switch(AO) {
    case "AppOverview.json": {
        $("#compareApp").show();
        $("#compareTime").show();
        break;
    }
    case "CitrixOverview.json": { //TODO: refactor this as a generic function
        $("#autoTag").show();
        $("#compareApp").show();
        $("#compareMZ").show();
        drawMZs("#compareMZ select")
        .done(function() {
          if("compareMZid" in selection.config)
            $("#compareMZ select").val(selection.config.compareMZid);
        })
        autoTagBox("Citrix");
        
        break;
    }
    case "SAPDigitalCockpit-Main.json": {
        $("#autoTag").show();
        autoTagBox("SAP");
        break;
    }
    case "REApplicationOverview.json": 
    case "REApplicationOverview2.json": {
      $("#remoteEmployeeInputs").show();
      break;
    }
    default:
        console.log("No special handling defined for #appOverview: "+AO);
    }
}

function autoTagBox(tech) {
    let p1 = getAutoTags();
    let p2 = getMZs();
    $.when(p1,p2).done(function(d1,d2) {
        parseAutoTags(d1[0]);
        processMZs(d2[0]);

        if(autoTags.findIndex( ({ name }) => name === tech) < 0) {
            $("#tagStatus").html("<p>❌ "+tech+"AutoTag missing!</p><input type='button' id='deployAutoTag' data-tech='"+tech+"' value='Deploy AutoTag'>");
        } else {
            $("#tagStatus").html("<p>✅ "+tech+"AutoTag in place</p>");
        }

        if(MZs.findIndex( ({ name }) => name === tech+" Overview") > -1 ) {
            let MZ = MZs.find( ({ name }) => name === tech+" Overview");
            $("#MZStatus").html("<p>✅ "+tech+" Overview MZ found, using that</p>" +
                "<input type='hidden' id='mz' value='"+MZ.id+"'>"+
                "<input type='hidden' id='mzname' value='"+MZ.name+"'>"
                );
        } else {
            $("#MZStatus").html("<p>❌ "+tech+" Overview MZ not found!</p>" +
                "Pick an existing MZ: <select id='mzlist'></select><br>" +
                "or <input type='button' id='deployMZ' data-tech='"+tech+"' value='Deploy MZ'>");
            drawMZs()
            .done(function() {
              if("mz" in selection.config)
                $("#mzlist").val(selection.config.mz);
            });
        }    
    });
}

function tenantOverviewChangeHandler() {
  var TO = $("#tenantOverview").val();

  //$("#remoteEmployeeInputs").hide();

  switch(TO) {
  case "RETenantOverview.json": 
  case "RETenantOverview2.json": 
  case "RETenantOverview3.json": 
  {
    //  $("#remoteEmployeeInputs").show();
      break;
  }
  case "00000000-dddd-bbbb-ffff-000000000001":
  case "TenantOverview.json": 
  { 
      break;
  }
  default:
      console.log("No special handling defined for #tenantOverview: "+TO);
  }
}
//UI navigation & painting
//
//
$(document).ready(function(){
  jqueryInit();
  // jQuery methods go here... (main logic)

  staticCleanup();
  // static link handlers
  loadStaticHandlers();

  // global button handler
  $("#viewport, #repo_config").on("click", "input:button", globalButtonHandler);

  //anchor handler
  $("#bcwrapper, #viewport, #repo_config, #dashboard_list").on("click", "a", linkHandler);

  loadInputChangeHandlers();

  hashHandler(window.location.hash);  
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

function downloadExcel(filename,worksheet,selector){
  let wb = XLSX.utils.table_to_book($(selector).get(0), {sheet:worksheet});
  let wbout = XLSX.writeFile(wb, filename, {bookType:'xlsx', bookSST:true, type: 'binary'});
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

function hashHandler(hash){
  switch(hash){
    case "MassEdit":
      $("#viewport").load("html/miscTools/MassEdit.html",massEditInit);
      break;
    case "faq":
      $("#viewport").load("html/faq.html");
      break;
    case "overview":
      $("#viewport").load("html/overview.html");
      break;
    case "begin":
      $("#viewport").load("html/configurator/connect.html",fieldsetPainter);
      break;
    case "prerequisites":
      $("#viewport").load("html/prerequisites-1.html");
      break;
    case "miscTools":
      $("#viewport").load("html/miscTools/toolsList.html");
      break;
    case "HUReport":
      $("#viewport").load("html/miscTools/HUreport.html",HUreportChangeHandler);
      break;
    case "home":
    default:
      $("#viewport").load("html/home.html");
  }
}
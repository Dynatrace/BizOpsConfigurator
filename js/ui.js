$(document).ready(function(){
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
     $("div.viewport").load("html/configurator-1.html", function() {
       if(typeof url !== 'undefined' && url != "")
  	$("#url").val(url);
       if(typeof token !== 'undefined' && token != "")
	$("#token").val(token);
     });
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


  // dynamic link handlers
  $("div.viewport").on("click", "#json", function() {
     $("div#jsonviewer").toggle();
     if($("div#jsonviewer").is(":visible")) $("input#json").val("Hide");
     if($("div#jsonviewer").is(":hidden")) $("input#json").val("JSON");
  });

  $("div.viewport").on("click", "#connect", function() {
    getApps();
  });

  $("div.viewport").on("click", "#configurator-2", function() {
    $("div.viewport").load("html/configurator-3.html");
    getKpis();
  });

  $("div.viewport").on("click", "#configurator-3", function() {
    $("div.viewport").load("html/configurator-4.html");
    getGoals();
  });

  $("div.viewport").on("click", "#configurator-4", function() {
    $("ul#goallist li input[type=checkbox]").each(function() {
	if( $(this).prop('checked') )
	  kpis.push($(this).attr('id'));
    });
    $("div.viewport").load("html/configurator-5.html", function() {
      loadDashboards();
    });
  });

  $("div.viewport").on("click", "input[type=button].json", function() {
      jsonviewer(dashboards[this.id],true,this.id);
  });

  $("div.viewport").on("click", "input[type=button]#transform", function() {
    transformDashboards();
  });

});

// Drawing functions
function drawAppSelector(apps){
  apps.forEach(function(app) {
     $("fieldset#apps").append("<input type=\"radio\" name=\"appname\" value=\""+ 
	app["displayName"] +"\"> " + app["displayName"] + "<br>\n");
  });

  $("fieldset#apps").append("<input type=\"button\" id=\"configurator-2\" value=\"Next\">");
}

function drawKpiSelector(kpis){
  kpis.forEach(function(kpi) {
    $("fieldset#kpis").append("<input type=\"radio\" name\"kpi\" value=\""+ kpi +
      "\"> " + kpi + "<br>\n");
  });
  
  $("fieldset#kpis legend").append(" for "+ appname );
  $("fieldset#kpis").append("<input type=\"button\" id=\"configurator-3\" value=\"Next\">");
}

function drawGoalSelector(goals){
  goals.forEach(function(goal) {
    $("ul#goallist").append(
	"<li class=\"ui-state-default\"><span class=\"ui-icon ui-icon-arrowthick-2-n-s\"></span>"+
	"<input id=\""+ goal +"\" type=\"checkbox\">" + goal + "</li>\n"
     );
  });
 
  $( function() {
    $( "ul#goallist" ).sortable();
    $( "ul#goallist" ).disableSelection();
  } ); 
  $("fieldset#goals legend").append(" for "+ appname );
  $("fieldset#goals").append("<input type=\"button\" id=\"configurator-4\" value=\"Next\">");
}

function drawDashboardList()
{
  $("div#dashboardlist").append("<ul>");
  dashboardlist.forEach(function(dashboardname) {
    $("div#dashboardlist ul").append("<li><input type='button' id='"+ dashboardname +
      "'value='JSON' class='json'>  "+ dashboardname + "</li>");
  });
  $("div#dashboardlist").append("</ul>");
  $("div#dashboardlist").append("<input type='button' id='transform' value='Transform'>");
}

function jsonviewer(result,show=false,name="") {
  //Load the JSON viewer
  $("#jsonviewer").hide();
  $("#jsonviewer").load("html/jsonviewer.html", function(){
    $("#jsontitle").append(name);
    $("div#results").append(JSON.stringify(result));
    $('.jsonFormatter').jsonFormatter();
    if(show){
	$("#jsonviewer").show();
     	if($("div#jsonviewer").is(":visible")) $("input#json").val("Hide");
    }
  });
}


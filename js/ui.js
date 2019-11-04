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
     $("div.viewport").load("html/configurator-connect.html", function() {
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
    url=$("input#url").val();
    token=$("input#token").val();
    testConnect();
  });

  $("div.viewport").on("click", "#deploy", function() {
    $("div.viewport").load("html/configurator-apps.html", function() {
      getApps();
    });
  });

  $("div.viewport").on("click", "#list", function() {
    listBOdashboards();
  });

  $("div.viewport").on("click", "#apps-next", function() {
    appname=$("input[name='appname']:checked").val();
    $("div.viewport").load("html/configurator-kpis.html", function() {
      getKpis();
    });
  });

  $("div.viewport").on("click", "#kpis-next", function() {
    kpi=$("input[name='kpi']:checked").val();
    $("div.viewport").load("html/configurator-goals.html", function() {
      getGoals();
    });
  });

  $("div.viewport").on("click", "#goals-next", function() {
    //populate the record selected goals
    $("ul#goallist li input[type=checkbox]").each(function() {
	if( $(this).prop('checked') )
	  goals.push($(this).attr('id'));
    });
    $("div.viewport").load("html/configurator-dashboards.html", function() {
      loadDashboards();
    });
  });

  $("div.viewport").on("click", "input[type=button].json", function() {
      jsonviewer(dashboards[this.id],true,this.id);
  });

  $("div.viewport").on("click", "input[type=button]#transform", function() {
    transformDashboards();
  });

  $("div.viewport").on("click", "input[type=button]#upload", function() {
    uploadDashboards();
  });

});

// Drawing functions
function drawAppSelector(apps){
    apps.forEach(function(app) {
       $("fieldset#apps").append("<input type=\"radio\" name=\"appname\" value=\""+ 
  	app["displayName"] +"\"> " + app["displayName"] + "<br>\n");
    });
  
    $("fieldset#apps").append("<input type=\"button\" id=\"apps-next\" value=\"Next\">");
}

function drawKpiSelector(kpis){
  kpis.forEach(function(kpi) {
    $("fieldset#kpis").append("<input type=\"radio\" name\"kpi\" value=\""+ kpi +
      "\"> " + kpi + "<br>\n");
  });
  
  $("fieldset#kpis legend").append(" for "+ appname );
  $("fieldset#kpis").append("<input type=\"button\" id=\"kpis-next\" value=\"Next\">");
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
  $("fieldset#goals").append("<input type=\"button\" id=\"goals-next\" value=\"Next\">");
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
  $("div#dashboardlist").append("<input type='button' id='upload' value='Upload'>");
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

function saveCredentials() {
  //can't seem to make this work
  /*if (window.PasswordCredential) {
     var c = new PasswordCredential(e.target);
     return navigator.credentials.store(c);
   }*/
}

function drawManage() {
  $("div.viewport").load("html/configurator-manage.html", function() {
  });
}

function drawBOdashboardList()
{
  $("fieldset#manage").append("<ul>");
  BOdashboards.forEach(function(dashboardname) {
    $("fieldset#manage  ul").append("<li>"+ dashboardname +
	"&nbsp;<input type='button' id='"+ dashboardname + "'value='JSON' class='json' disabled>  " + 
	"&nbsp;<input type='button' id='"+ dashboardname + "'value='Delete' class='json' disabled>  " + 
	"&nbsp;<input type='button' id='"+ dashboardname + "'value='Upgrade' class='json' disabled>  " + 
	"</li>");
  });
  $("fieldset#manage").append("</ul>");
}


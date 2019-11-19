var url="";
var token="";
var owner="";
var apps={};
var appname="";
var kpis=[];
var goals=[];
var keyActions=[];
var funnel=[];
var kpi="";
var BOdashboards=[];
var BOcollections=[];

//API Querie
function testConnect() {
  var query="/api/v1/tokens/lookup";
  var data="{\"token\":\""+ token +"\"}";
  dtAPIquery(query,testCallback,"POST",data);
}

function listBOdashboards() {
  var query="/api/config/v1/dashboards";
  dtAPIquery(query,BOdashboardsCallback);
}

function getApps() {
    apps={};

    var query="/api/v1/entity/applications?includeDetails=false";
    dtAPIquery(query,appsCallback);
}

function getKpis() {
    kpis=[];
    var query="/api/v1/userSessionQueryLanguage/table?query=SELECT%20usersession.longProperties%2C%20usersession.doubleProperties%2C%20usersession.stringProperties%2C%20usersession.dateProperties%20FROM%20useraction%20WHERE%20application%3D%22"+
	encodeURIComponent(appname) +"%22%20&explain=false";
    dtAPIquery(query,kpisCallback);
}

function getGoals() {
     goals=[];
     var query="/api/v1/userSessionQueryLanguage/table?query=SELECT%20DISTINCT%20matchingConversionGoals%20FROM%20useraction%20WHERE%20"+
	"application%3D%22"+ encodeURIComponent(appname) +"%22%20and%20matchingConversionGoals%20IS%20NOT%20NULL&explain=false";
    dtAPIquery(query,goalsCallback);
}

function getKeyActions() {
     keyActions=[];
     var query="/api/v1/userSessionQueryLanguage/table?query=SELECT%20name%20FROM%20useraction%20WHERE%20keyUserAction%20%3D%20true%20and%20" +
	"application%3D%22"+ encodeURIComponent(appname) +"%22&explain=false";
    dtAPIquery(query,keyActionsCallback);
}



//// Functions ////
function dtAPIquery(query, callback, method="GET", data={}) {
    //Get App list from API as JSON
    $.ajax({
	url: url + query, 
	contentType: "application/json; charset=utf-8",
	headers: { 'Authorization': "Api-Token " + token },
	data: data,
	method: method,
	dataType: "json"})
	.done(callback);

}

function appsCallback(result) {
  //store the app list as an object
  apps=result;
          
    //Load Apps
  saveCredentials();
  drawAppSelector(apps);
  jsonviewer(result);
}

function kpisCallback(result) {
  
	//Do ugly parsing here...
	result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
	    val2.forEach(function(val3) {
		if(val3.hasOwnProperty("key")) {
		  //console.log("key: "+ val[0][0]["key"]);
		  if(kpis.indexOf(val3["key"]) == -1) kpis.push(val3["key"]);
		}
	    });
	  })
	});

    drawKpiSelector(kpis);
    jsonviewer(result);
}

function goalsCallback(result) {
  //parse goals
	result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
		  //console.log("key: "+ val[0][0]["key"]);
		  if(goals.indexOf(val2) == -1) goals.push(val2);
	    });
	  });
          
    //Load goals
    drawGoalSelector(goals);
    jsonviewer(result);
    getKeyActions();
}

function keyActionsCallback(result) {
  //parse keyActions
	result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
		  if(keyActions.indexOf(val2) == -1) keyActions.push(val2);
	    });
	  });
    //Load keyActions
    addKeyActionSelector(keyActions);
    jsonviewer(result,false,"","#jsonviewer2");
}

function testCallback(result) {
  owner=result["userId"];

  if(!result["scopes"].includes("DTAQLAccess")) alert("Missing DTAQLAccess token scope");
  if(!result["scopes"].includes("WriteConfig")) alert("Missing WriteConfig token scope");
  if(!result["scopes"].includes("ReadConfig")) alert("Missing ReadConfig token scope");
  if(!result["scopes"].includes("DataExport")) alert("Missing DataExport token scope");

  drawManage();
}

function BOdashboardsCallback(result) {
  result["dashboards"].forEach(function(dashboard) {
    if(dashboard["id"].substring(0,8)=="bbbbbbbb") {
	BOdashboards.push(dashboard["id"]);
	let collection=dashboard["id"].substring(9,13);
	if(!BOcollections.includes(collection)) BOcollections.push(collection);
    }
  });

  BOdashboards.sort();
  BOcollections.sort();
  drawBOdashboardList();
}

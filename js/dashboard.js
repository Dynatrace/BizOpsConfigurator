var dashboardlist=[];
var dashboards={};

function loadDashboards() {
  $("div#dashboardlist").append("Loading dashboard list...<br><pre></pre>");
  $("div#dashboardlist pre").load("json/dashboards.txt", function() {
    $("div#dashboardlist").append("<br>Loaded dashboard list...<br>");
    dashboardlist=$("div#dashboardlist pre").text().split('\n');
    if(dashboardlist[dashboardlist.length-1]=="")dashboardlist.pop(); //fix for empty element  
    $("div#dashboardlist").append("Parsed dashboard list...<br>");
    $("div#dashboardlist").html(""); //loading complete, clear it
    dashboardlist.forEach(function(dashboardname) {
      $.ajax({
  	url: "json/" + dashboardname,
  	data: {},
  	type: "GET",
  	dataType: "json"})
  	.done(function(data) {
	  dashboards[dashboardname]=data;
	});
    });
    drawDashboardList();
  });
}

function uploadDashboards() {
  $("input#upload").val("Uploading...");
  $("input#upload").prop('disabled', true);

  for(dashboardname in dashboards) {
    var id=dashboards[dashboardname]["id"];
    var query="/api/config/v1/dashboards/"+id;
    var data=JSON.stringify(dashboards[dashboardname]);
    
    dtAPIquery(query,function(){},"PUT",data);
  }
  $("input#upload").val("Uploaded");
}

////////////////////////// Shady stuff below here /////////////////////////////

function transformDashboards() {
  $("input#transform").val("Transforming...");
  $("input#transform").prop('disabled', true);


  //use transfrom patterns here
  updateDashboardIds("bbbbbbbb","0001","0001","0001"); //patterns 1 & 3

  publishOnlyStartDashboard("Dynatrace-DashboardsV4/TenantOverview.json"); //pattern 2

  //example using user input to do a global search/replace, be sure to encode variables going into USQL
  dashboardStringReplace( [ 
	{search:"useraction.application=\\\"MyApp\\\"", replace:"useraction.application=\\\""+ encodeURIComponent(appname) +"\\\""},
	{search:"MyApp", replace: appname} 
  ] );

  $("input#transform").val("Transformed.");
} 

////// Dashboard transforms go here  ///////

// Pattern 1 - change a specific value across all dashboards
function updateDashboardIds(first, second, third, fourth) {
  var fifth=1;
  var oldId,newId,search,replace;
  var replacements=[];

  for(dashboardname in dashboards) {
    //safe store old ID and build the new ID
    search=oldId=dashboards[dashboardname]["id"];
    replace=newId=first+"-"+second+"-"+third+"-"+fourth+"-"+fifth.toString().padStart(12, 0);
    //we'll keep a list of replacements to go update all the links
    replacements.push({search,replace});

    //do the actual replacement
    dashboards[dashboardname]["id"]=newId;
    //loop
    fifth++;
  }

  //ok, go back and update all the links
  dashboardStringReplace(replacements);
}

// Pattern 2 - change a specific element on a specific dashboard
function publishOnlyStartDashboard(start) {
  for(dashboardname in dashboards) {
    //set these for all dashboards
    dashboards[dashboardname]["dashboardMetadata"]["shared"]=true;
    dashboards[dashboardname]["dashboardMetadata"]["sharingDetails"]["linkShared"]=true;
    //only set published on the start dashboard
    if(dashboardname==start)
      dashboards[dashboardname]["dashboardMetadata"]["sharingDetails"]["published"]=true;
    else 
      dashboards[dashboardname]["dashboardMetadata"]["sharingDetails"]["published"]=false;
  }
}

// Pattern 3 - global string replace
function dashboardStringReplace(replacements) {
  //convert to string
  var tmpString = JSON.stringify(dashboards);
  
  //take in an array of search/replace objects, ie [{search1,replace1},{search2,replace2}]
  //TODO: this seems to not work sometimes??
  replacements.forEach(function(replacement){
    tmpString=tmpString.replace(replacement["search"],replacement["replace"]);
    //console.log("Replace "+replacement["search"]+" with "+replacement["replace"]);
  });

  //convert back to objects when done
  dashboards = JSON.parse(tmpString);
}

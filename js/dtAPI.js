//API Queries
function testConnect() {
  var query="/api/v1/tokens/lookup";
  var data="{\"token\":\""+ token +"\"}";
  
  return dtAPIquery(query,{
	method: "POST",
	data: data
  });
}

function getDBAdashboards() {
  var query="/api/config/v1/dashboards";
  return dtAPIquery(query,{});
}

function getMZs() {
  var query="/api/config/v1/managementZones";
  return dtAPIquery(query,{});
}

function getApps() {
    apps={};

    var query="/api/v1/entity/applications?includeDetails=false";
    return dtAPIquery(query,{});
}

function getKPIs(appname) {
    kpis=[];
    //replace with API call to /config/v1/applications/web once that endpoint provides USPs
    var query="/api/v1/userSessionQueryLanguage/table?query=SELECT%20usersession.longProperties%2C%20usersession.doubleProperties%2C%20usersession.stringProperties%2C%20usersession.dateProperties%20FROM%20useraction%20WHERE%20application%3D%22"+
	encodeURIComponent(appname) +"%22%20&explain=false";
    return dtAPIquery(query,{});
}

function getGoals(appname) {
     goals=[];
     var query="/api/v1/userSessionQueryLanguage/table?query=SELECT%20DISTINCT%20matchingConversionGoals%20FROM%20useraction%20WHERE%20"+
	"application%3D%22"+ encodeURIComponent(appname) +"%22%20and%20matchingConversionGoals%20IS%20NOT%20NULL&explain=false";
    return dtAPIquery(query,{});
}

function getKeyActions(appname) {
     keyActions=[];
     var query="/api/v1/userSessionQueryLanguage/table?query=SELECT%20name%20FROM%20useraction%20WHERE%20keyUserAction%20%3D%20true%20and%20" +
	"application%3D%22"+ encodeURIComponent(appname) +"%22&explain=false";
    return dtAPIquery(query,{});
}



//// Functions ////
function dtAPIquery(query, options) {
    let success = (options.hasOwnProperty('success') ? options.success : function(data, textStatus, jqXHR)
	{console.log("dtAPIQuery success")} );
    let method = (options.hasOwnProperty('method') ? options.method : "GET" );
    let data = (options.hasOwnProperty('data') ? options.data : {} );
    let error = (options.hasOwnProperty('error') ? options.error : function(jqXHR, textStatus, errorThrown)
	{console.log("dtAPIQuery failed: "+errorThrown)} );

    //Get App list from API as JSON
    return $.ajax({
	url: url + query, 
	contentType: "application/json; charset=utf-8",
	headers: { 'Authorization': "Api-Token " + token },
	data: data,
	method: method,
	dataType: "json",
	success: success,
	error: error
	});

}

function uploadTenantOverview(config) {
  //get dashboard JSON
  var dashboardTO;
  var p = $.get(dashboardDir+dbTO);
  return p.then(function(data) {
    dashboardTO = data;

  //transform
  var id=nextTO();
  config.TOid=id;
  config.oldTOid=dashboardTO["id"];
  dashboardTO["id"]=id;
  dashboardTO["dashboardMetadata"]["owner"]=owner;
  dashboardTO["dashboardMetadata"]["name"]=dashboardTO["dashboardMetadata"]["name"].replace(/Tenant/g,config.TOname+" Tenant");
  dashboardTO["dashboardMetadata"]["dashboardFilter"]["managementZone"]= {
	"id": config.mz,
	"name": config.mzname
  };
  dashboardTO["dashboardMetadata"]["shared"]="true";
  dashboardTO["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
  dashboardTO["dashboardMetadata"]["sharingDetails"]["published"]="true";

  var query="/api/config/v1/dashboards/"+id;
  var data=JSON.stringify(dashboardTO);
  //upload
  saveConfigDashboard(configID(id),config);
  return dtAPIquery(query,{method:"PUT",data:data});
  });
}

function updateTenantOverview(TOid) {
  let p1 = loadDashboard(TOid);
  let p2 = loadDashboard(configID(TOid));
  let p3 = getDBAdashboards();
  //update/create link tile
  let to = TOid.split("-")[1];
  let reS = "bbbbbbbb-"+to+"-[0-9]{4}-0000-000000000000";
  let re = new RegExp(reS);
  $.when(p1,p2,p3).done(function(d1,d2,d3) {
    let dashboardTO = d1[0];
    let config = parseConfigDashboard(d2[0]);
    processDBADashboards(d3[0]);
    if( typeof(config.linkTile) === 'undefined' || typeof(config.linkTile.index) === 'undefined') {
      config.linkTile = {
	bounds:  {
	  top:  dbFindBottom(dashboardTO),
	  left: 0,
	  width: 266,
	  height: 38
	}
     }
     config.linkTile.index = dashboardTO["tiles"].length; //we'll put a linkTile at the end
     dashboardTO["tiles"].push(createLinkTile(config.linkTile.bounds,re,TOid));
    } else {
     let i = config.linkTile.index;
     dashboardTO["tiles"][i] = createLinkTile(config.linkTile.bounds,re,TOid);
    }
  var query="/api/config/v1/dashboards/"+TOid;
  var data2=JSON.stringify(dashboardTO);
  //upload
  saveConfigDashboard(configID(TOid),config);
  return dtAPIquery(query,{method:"PUT",data:data2});
  });
}

function uploadAppOverview(config) {
  //get dashboard JSON
  var dashboardAO;
  var p1 = $.get(dashboardDir+dbAO);
  let p2 = addParentConfig(config,config.TOid);
  return $.when(p1,p2).then(function(data1,data2) {
   dashboardAO = data1[0];

  //transform
  var id=nextAO(config.TOid);
  config.AOid=id;
  config.oldAOid=dashboardAO["id"];
  saveConfigDashboard(configID(id),config);
  dashboardAO["id"]=id;
  dashboardAO["dashboardMetadata"]["owner"]=owner;
  dashboardAO["dashboardMetadata"]["name"]=dashboardAO["dashboardMetadata"]["name"].replace(/MyApp/g,config.AOname+" App");
  dashboardAO["dashboardMetadata"]["shared"]="true";
  dashboardAO["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
  dashboardAO["dashboardMetadata"]["sharingDetails"]["published"]="false";

  var query="/api/config/v1/dashboards/"+id;
  var data2=JSON.stringify(dashboardAO);
  //string based transforms
  data2 = data2.replace(new RegExp(config.oldTOid,"g"), config.TOid);
  data2 = data2.replace(/MyApp/g,config.appName);
  data2 = data2.replace(/InternalAppID/g,config.appID);
  //upload
  return dtAPIquery(query,{method:"PUT",data:data2});
  });
}

function updateAppOverview(AOid) {
  let p1 = loadDashboard(AOid);
  let p2 = loadDashboard(configID(AOid));
  let p3 = getDBAdashboards();
  //update/create link tile
  let to = AOid.split("-")[1];
  let ao = AOid.split("-")[2];
  let reS = "bbbbbbbb-"+to+"-"+ao+"-[0-9]{4}-000000000000";
  let re = new RegExp(reS);
  $.when(p1,p2,p3).done(function(d1,d2,d3) {
    let dashboardAO = d1[0];
    let config = parseConfigDashboard(d2[0]);
    processDBADashboards(d3[0]);
    if( typeof(config.linkTile) === 'undefined' || typeof(config.linkTile.index) === 'undefined') {
      config.linkTile = {
	bounds:  {
	  top:  dbFindBottom(dashboardAO),
	  left: 0,
	  width: 266,
	  height: 38
	}
     }
     config.linkTile.index = dashboardAO["tiles"].length; //we'll put a linkTile at the end
     dashboardAO["tiles"].push(createLinkTile(config.linkTile.bounds,re,AOid));
    } else {
     let i = config.linkTile.index;
     dashboardAO["tiles"][i] = createLinkTile(config.linkTile.bounds,re,AOid);
    }
  var query="/api/config/v1/dashboards/"+AOid;
  var data2=JSON.stringify(dashboardAO);
  //upload
  saveConfigDashboard(configID(AOid),config);
  return dtAPIquery(query,{method:"PUT",data:data2});
  });
}

function uploadFunnel(config) {
  //get dashboard JSON
  var dashboardFO;
  var filename="";

  if(config.compareApp!="")
    filename=dashboardDir+dbFunnelTrue;
  else
    filename=dashboardDir+dbFunnelFalse;
  var p1 = $.get(filename);
  let p2 = addParentConfig(config,config.AOid);
  return $.when(p1,p2).then(function(data1,data2) {
    dashboardFO = data1[0];
  
    //transform
    var id=nextFO(config.AOid);
    config.FOid=id;
    config.oldFOid=dashboardFO["id"];
    saveConfigDashboard(configID(id),config);
    dashboardFO["id"]=id;
    dashboardFO["dashboardMetadata"]["owner"]=owner;
    dashboardFO["dashboardMetadata"]["name"]=dashboardFO["dashboardMetadata"]["name"].replace(/MyFunnel/g,config.funnelName);
    dashboardFO["dashboardMetadata"]["shared"]="true";
    dashboardFO["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
    dashboardFO["dashboardMetadata"]["sharingDetails"]["published"]="false";
  
    var query="/api/config/v1/dashboards/"+id;
    var data2=JSON.stringify(dashboardFO);
    //string based transforms
    let dbs = loadFunnelAnalysis(config);
    $.when.apply($, dbs.promises).then(function() { 
       dbs.swaps.forEach(function(swap) {
         data2 = data2.replace(new RegExp(swap.from,"g"), swap.to);   
       });
      //upload
      uploadFunnelAnalysis(dbs.promises,dbs.dbsForUpload,dbs.swaps);
      return dtAPIquery(query,{method:"PUT",data:data2});
    });
  });
}

function loadFunnelAnalysis(config) {
  var filename="";
  var idx=1;
  var dbsForUpload=[];
  var swaps=generateSwapList(config);
  var promises=[];

  //use an array of promises for synchronization
  promises[0]=$.Deferred();  //use the first one to wait until other promises are loaded
  dbFunnelList.forEach(function(db) {
  //skip unneeded dbs
    if(config.kpi=="" && db.includes("True"))
	return;
    if(config.kpi!="" && db.includes("False"))
	return;
    if(config.compareApp=="" && db.includes("Compare"))
	return; 

    //get dashboard JSON
    filename=dashboardDir+db;
    let p = $.get(filename);
    promises.push(p);
    p.then(function(data) {
      let p2 = $.Deferred();
      promises.push(p2.promise());
      let dbData = data;
  
      //transform
      let id=config.FOid.substring(0,24) + idx.toString().padStart(12, '0'); idx++;
      let oldID=dbData["id"];
      swaps.push({from:oldID, to:id});
      dbData["id"]=id;
      dbData["dashboardMetadata"]["owner"]=owner;
      dbData["dashboardMetadata"]["name"]=dbData["dashboardMetadata"]["name"].replace(/MyFunnel/g,config.funnelName);
      dbData["dashboardMetadata"]["shared"]="true";
      dbData["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
      dbData["dashboardMetadata"]["sharingDetails"]["published"]="false";
  
      var data2=JSON.stringify(dbData);
      //string based transforms
      //queue for upload
      
      dbsForUpload.push({id: id, json: data2});
      p2.resolve();
    });
  });
  promises[0].resolve();

  return {
    promises: promises,
    dbsForUpload: dbsForUpload,
    swaps: swaps
  };
}

function uploadFunnelAnalysis(promises,dbsForUpload,swaps) {
  //Once all dbs have been loaded, process swaps, then upload 'em
  $.when.apply($, promises).then(function() {
    dbsForUpload.forEach(function(db) {
	swaps.forEach(function(swap) {
	  db.json = db.json.replace(new RegExp(swap.from,"g"), swap.to);   
	});
	var query = "/api/config/v1/dashboards/" + db.id;
	dtAPIquery(query,{method:"PUT",data:db.json});
    });
  });
}

function deleteFunnel(id) {
  var query="/api/config/v1/dashboards/"+id;
  let p1 = dtAPIquery(query,{method:"DELETE"});

  let re = new RegExp("^"+id.substring(0,24));
  DBAdashboards.forEach(function(db) {
    if(re.test(db.id) && db.id!=id) {
      query="/api/config/v1/dashboards/"+db.id;
      dtAPIquery(query,{method:"DELETE"});
    } else {
	//console.log(re.toString()+" does NOT match "+db);
    }
  });
  return $.when(p1);
}

function deleteTenant(id) {
  var query="/api/config/v1/dashboards/"+id;
  let p1 = dtAPIquery(query,{method:"DELETE"});

  let re = new RegExp("^"+id.substring(0,14));
  DBAdashboards.forEach(function(db) {
    if(re.test(db.id) && db.id!=id) {
      query="/api/config/v1/dashboards/"+db.id;
      dtAPIquery(query,{method:"DELETE"});
    }
  });
  return $.when(p1);
}

function deleteApp(id) {
  var query="/api/config/v1/dashboards/"+id;
  let p1 = dtAPIquery(query,{method:"DELETE"});
  
  let re = new RegExp("^"+id.substring(0,19));
  DBAdashboards.forEach(function(db) {
    if(re.test(db.id) && db.id!=id) {
      query="/api/config/v1/dashboards/"+db.id;
      dtAPIquery(query,{method:"DELETE"});
    }
  });
  return $.when(p1);
}

function saveConfigDashboard(id,config) {
  var dashboard;
  var p = $.get(configDashboard);
  return p.then(function(data) {
    dashboard = data;

  //transform
  dashboard["id"]=id;
    //break each 999 characters into a markdown tile 
  let markdownTemplate = JSON.stringify(dashboard["tiles"][0]);
  dashboard["tiles"].pop();
  let configS = JSON.stringify(config);
  let tiles = Math.ceil(configS.length / 999);
  for(i=0; i <= tiles; i++) {
    let markdown = JSON.parse(markdownTemplate);
    markdown["markdown"]=configS.substring(i*999,(i+1)*999);
    //put tiles horizontally 3px apart
    markdown["bounds"]["left"] = i * markdown["bounds"]["width"] + i * 3;
    dashboard["tiles"].push(markdown);
  }

  var query="/api/config/v1/dashboards/"+id;
  var data2=JSON.stringify(dashboard);
  
  //do not return a promise, run async
  dtAPIquery(query,{method:"PUT",data:data2});
  });
}

function loadDashboard(id) {
  var query="/api/config/v1/dashboards/"+id;
  return dtAPIquery(query,{});
}


function addParentConfig(config,id) {
  let p = loadDashboard(configID(id));
 
  return $.when(p).then(function(data){
    let parentConfig = parseConfigDashboard(data);
    Object.keys(parentConfig).forEach(function(attr) {
      if(!config.hasOwnProperty(attr))
	config[attr]=parentConfig[attr];
    });
    return config;
  });
}

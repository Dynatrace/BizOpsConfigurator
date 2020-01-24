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

function getVersion() {
  var query="/api/v1/config/clusterversion";
  return dtAPIquery(query,{});
}

function getMZs() {
  var query="/api/config/v1/managementZones";
  return dtAPIquery(query,{});
}

function getApps(mz=null) {
    apps={};

    var query="/api/v1/entity/applications?includeDetails=false";
    if(mz!==null && mz!=="") query += "&managementZone="+mz;
    return dtAPIquery(query,{});
}

function getKPIs(appname) {
    kpis=[];
    //replace with API call to /config/v1/applications/web once that endpoint provides USPs
    let usql = "SELECT usersession.longProperties, usersession.doubleProperties, usersession.stringProperties, usersession.dateProperties FROM useraction WHERE application=\""+appname+"\" LIMIT 5000";
    var query="/api/v1/userSessionQueryLanguage/table?query="+encodeURIComponent(usql)+"&explain=false";
    return dtAPIquery(query,{});
}

function getGoals(appname) {
     goals=[];
     let usql = "SELECT DISTINCT matchingConversionGoals FROM useraction WHERE application=\""+appname+"\" and matchingConversionGoals IS NOT NULL LIMIT 5000";
     var query="/api/v1/userSessionQueryLanguage/table?query="+encodeURIComponent(usql)+"&explain=false";
    return dtAPIquery(query,{});
}

function getKeyActions(appname) {
     keyActions=[];
     let yesterday = Date.now() - 86400000;
     let usql = "SELECT DISTINCT name FROM useraction WHERE keyUserAction = true and application=\""+appname+"\" LIMIT 5000";
     var query="/api/v1/userSessionQueryLanguage/table?query="+encodeURIComponent(usql)+" &explain=false&startTimestamp="+yesterday;
    return dtAPIquery(query,{});
}



//// Functions ////
function dtAPIquery(query, options) {
    let success = (options.hasOwnProperty('success') ? options.success : function(data, textStatus, jqXHR)
    {//console.log("dtAPIQuery success")
    } );
    let method = (options.hasOwnProperty('method') ? options.method : "GET" );
    let data = (options.hasOwnProperty('data') ? options.data : {} );
    let error = (options.hasOwnProperty('error') ? options.error : errorboxJQXHR);

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
  var dashboardTO = JSON.parse(JSON.stringify(dbList.find( ({ name }) => name === dbTO ).file));

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

  //sub-dashboards
  let subs = getStaticSubDBs(dashboardTO,[config.oldTOid]);
  let swaps = [ {from:config.oldTOid, to:id} ];
  swaps = transformSubs(subs,config.TOid,swaps);
  data = doSwaps(data, swaps);
  
  //upload
  saveConfigDashboard(configID(id),config);
  uploadSubs(subs);
  return dtAPIquery(query,{method:"PUT",data:data});
  //});
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
    updateLinkTile(dashboardTO,config,re,"![Application Links1]()");
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
  dashboardAO = JSON.parse(JSON.stringify(dbList.find( ({ name }) => name === dbAO ).file));
  let p2 = addParentConfig(config,config.TOid);
  return $.when(p2).then(function(data2) {

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
  let swaps = generateAppSwapList(config); 
  //sub-dashboards
  let subs = getStaticSubDBs(dashboardAO,[config.oldTOid,config.oldAOid]);
  swaps = transformSubs(subs,config.AOid,swaps);
  data2 = doSwaps(data2, swaps);
  
  //upload
  uploadSubs(subs);
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
    updateLinkTile(dashboardAO,config,re,"![Funnel Links1]()");
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

  if(config.kpi=="n/a")
    dashboardFO = JSON.parse(JSON.stringify(dbList.find( ({ name }) => name === dbFunnelFalse ).file));
  else
    dashboardFO = JSON.parse(JSON.stringify(dbList.find( ({ name }) => name === dbFunnelTrue ).file));
  let p2 = addParentConfig(config,config.AOid);
  return $.when(p2).then(function(data2) {
  
    //transform
    if(typeof(config.FOid)==="undefined")
      config.FOid=nextFO(config.AOid);
    config.oldFOid=dashboardFO["id"];
    saveConfigDashboard(configID(config.FOid),config);
    dashboardFO["id"]=config.FOid;
    dashboardFO["dashboardMetadata"]["owner"]=owner;
    dashboardFO["dashboardMetadata"]["name"]=dashboardFO["dashboardMetadata"]["name"].replace(/MyFunnel/g,config.funnelName);
    config.dashboardName=dashboardFO["dashboardMetadata"]["name"];
    dashboardFO["dashboardMetadata"]["shared"]="true";
    dashboardFO["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
    dashboardFO["dashboardMetadata"]["sharingDetails"]["published"]="false";
  
    whereClauseSwaps(dashboardFO,config);  

    var query="/api/config/v1/dashboards/"+config.FOid;
    var data2=JSON.stringify(dashboardFO);
    //string based transforms
      //sub-dashboards
      let subs = getStaticSubDBs(dashboardFO,[config.oldTOid,config.oldAOid,config.oldFOid]);
      subs = listFunnelDB(config,subs);
      subs.forEach(function(db) {let sub=db.file; whereClauseSwaps(sub,config);});  
      var swaps=generateFunnelSwapList(config);
      swaps = transformSubs(subs,config.FOid,swaps);
      data2 = doSwaps(data2, swaps);
      
      //upload
      uploadSubs(subs);
      return dtAPIquery(query,{method:"PUT",data:data2});
  });
}

function uploadSubs(subs) {
    subs.forEach(function(db) {
        let json = JSON.stringify(db.file);
        var query = "/api/config/v1/dashboards/" + db.file.id;
        dtAPIquery(query,{method:"PUT",data:json});
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
  var p = $.get(configDashboard)
      .fail(errorboxJQXHR);
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

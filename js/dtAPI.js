//API Queries
function testConnect() {
  var query = "/api/v1/tokens/lookup";
  var data = "{\"token\":\"" + token + "\"}";

  return dtAPIquery(query, {
    method: "POST",
    data: data
  });
}

function getAllDashboards() {
  var query = "/api/config/v1/dashboards";
  return dtAPIquery(query, {});
}

function getVersion() {
  var query = "/api/v1/config/clusterversion";
  return dtAPIquery(query, {});
}

function getMZs() {
  var query = "/api/config/v1/managementZones";
  return dtAPIquery(query, {});
}

function getApps(mz = null) {
  apps = {};

  var query = "/api/v1/entity/applications?includeDetails=false";
  if (mz !== null && mz !== "") query += "&managementZone=" + mz;
  return dtAPIquery(query, {});
}

function getAppDetail(app) {
  if (app.split('-')[0] != "APPLICATION") return;
  var query = "/api/config/v1/applications/web/" + app;
  return dtAPIquery(query, {});
}

function getKPIs(appname) {
  kpis = [];
  //replace with API call to /config/v1/applications/web once that endpoint provides USPs
  if (typeof appname == "string")
    var usql = "SELECT usersession.longProperties, usersession.doubleProperties FROM useraction WHERE application=\"" + appname + "\" LIMIT 5000";
  else if (Array.isArray(appname)) {
    let apps = [];
    appname.forEach(function (o, i, a) { apps.push('"' + o + '"'); });
    apps = apps.join(',');
    var usql = "SELECT usersession.longProperties, usersession.doubleProperties FROM useraction WHERE application IN (" + apps + ") LIMIT 5000";
  }

  var query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
  return dtAPIquery(query, {});
}

function getUSPs(appname) {
  usps = [];
  //replace with API call to /config/v1/applications/web once that endpoint provides USPs
  if (typeof appname == "string")
    var usql = "SELECT usersession.stringProperties, usersession.dateProperties FROM useraction WHERE application=\"" + appname + "\" LIMIT 5000";
  else if (Array.isArray(appname)) {
    let apps = [];
    appname.forEach(function (o, i, a) { apps.push('"' + o + '"'); });
    apps = apps.join(',');
    var usql = "SELECT usersession.stringProperties, usersession.dateProperties FROM useraction WHERE application IN (" + apps + ") LIMIT 5000";
  }
  var query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
  return dtAPIquery(query, {});
}

function getRegions(appname) {
  regions = [];
  if (typeof appname == "string")
    var usql = "SELECT DISTINCT country, region, city FROM usersession WHERE useraction.application=\"" + appname + "\" ORDER BY country,region,city LIMIT 5000";
  else if (Array.isArray(appname)) {
    let apps = [];
    appname.forEach(function (o, i, a) { apps.push('"' + o + '"'); });
    apps = apps.join(',');
    var usql = "SELECT DISTINCT country, region, city FROM usersession WHERE useraction.application IN (" + apps + ") ORDER BY country,region,city LIMIT 5000";
  }
  var query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
  return dtAPIquery(query, {});
}

function getGoals(appname) {
  goals = [];
  if (typeof appname == "string")
    var usql = "SELECT DISTINCT application, matchingConversionGoals FROM useraction WHERE application=\"" + appname + "\" and matchingConversionGoals IS NOT NULL LIMIT 5000";
  else if (Array.isArray(appname)) {
    let apps = [];
    appname.forEach(function (o, i, a) { apps.push('"' + o + '"'); });
    apps = apps.join(',');
    var usql = "SELECT DISTINCT application, matchingConversionGoals FROM useraction WHERE application IN (" + apps + ") and matchingConversionGoals IS NOT NULL LIMIT 5000";
  }
  var query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
  return dtAPIquery(query, {});
}

function getKeyActions(appname, all = false) {
  keyActions = [];
  let yesterday = Date.now() - 86400000;
  if (typeof appname == "string")
    var usql = "SELECT DISTINCT application, name FROM useraction WHERE " +
      (!all ? "keyUserAction = true and" : "") +
      " application=\"" + appname + "\" LIMIT 5000";
  else if (Array.isArray(appname)) {
    let apps = [];
    appname.forEach(function (o, i, a) { apps.push('"' + o + '"'); });
    apps = apps.join(',');
    var usql = "SELECT DISTINCT application, name FROM useraction WHERE " +
      (!all ? "keyUserAction = true and" : "") +
      " application IN (" + apps + ") LIMIT 5000";
  }
  var query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + " &explain=false&startTimestamp=" + yesterday;
  return dtAPIquery(query, {});
}

function getHosts() {
  var query = "/api/v1/entity/infrastructure/hosts?includeDetails=true";
  return dtAPIquery(query, {});
}

function getAutoTags() {
  var query = "/api/config/v1/autoTags";
  return dtAPIquery(query, {});
}

function getServices(mzid = undefined) {
  var query = "/api/v1/entity/services?includeDetails=false";
  if (typeof mzid !== "undefined" && mzid != "")
    query += `&managementZone=${mzid}`;

  return dtAPIquery(query, {});
}

function deployAutoTag(file, swaps) {
  var payload = {};
  var p = $.get(file)
    .fail(errorboxJQXHR);
  return p.then(function (data) {
    payload = JSON.stringify(data);

    swaps.forEach(function (swap) {
      payload = payload.replace(swap.to, swap.from);
    });

    var query = "/api/config/v1/autoTags";
    var options = {
      'data': payload,
      'method': 'POST'
    };
    return dtAPIquery(query, options);
  });
}

function deployMZ(file, swaps) {
  var payload = {};
  var p = $.get(file)
    .fail(errorboxJQXHR);
  return p.then(function (data) {
    payload = JSON.stringify(data);

    swaps.forEach(function (swap) {
      payload = payload.replace(swap.to, swap.from);
    });

    var query = "/api/config/v1/managementZones";
    var options = {
      'data': payload,
      'method': 'POST'
    };
    return dtAPIquery(query, options);
  });
}

//// Functions ////
function dtAPIquery(query, options={}, retries = 3) {
  let success = (options.hasOwnProperty('success') ? options.success : function (data, textStatus, jqXHR) {//console.log("dtAPIQuery success")
  });
  let method = (options.hasOwnProperty('method') ? options.method : "GET");
  let data = (options.hasOwnProperty('data') ? options.data : {});
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
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status != 429) return; //for now only retry rate limiting
      if (retries <= 0) {
        errorboxJQXHR(jqXHR, "Retries exhausted.", errorThrown);
        return;
      }
      let seconds = 0;
      let now = 0;
      let then = 0;
      try {
        then = jqXHR.responseText.match(/Reset time:.*\(([0-9]+)\)/)[1];
        now = new Date().getTime();
        seconds = (then - now) / 1000 + 1;
      } catch (e) { seconds = 60; } //if we didn't capture the reset time, just default to a minute
      console.log("Inside Fail: query=" + query + " retries=" + retries + " seconds=" + seconds + " now=" + now + " then=" + then);
      return setTimeout(function () { dtAPIquery(query, options, retries - 1); }, seconds * 1000);
    });
}

function uploadTenantOverview(config) {
  //get dashboard JSON
  var dashboardTO = JSON.parse(JSON.stringify(dbList.find(x => x.name === config.tenantOverview &&
    x.repo.owner === config.repo.owner && x.repo.repo === config.repo.repo && 
    x.repo.path === config.repo.path).file));

  //transform
  var id = nextTO();
  config.TOid = id;
  config.oldTOid = dashboardTO["id"];
  dashboardTO["id"] = id;
  dashboardTO["dashboardMetadata"]["owner"] = owner;
  //dashboardTO["dashboardMetadata"]["name"]=dashboardTO["dashboardMetadata"]["name"].replace(/MyTenant/g,config.TOname+"");
  //dashboardTO["dashboardMetadata"]["name"]=dashboardTO["dashboardMetadata"]["name"].replace(/TEMPLATE:/g,config.TOname+"");
  dashboardTO["dashboardMetadata"]["dashboardFilter"]["managementZone"] = {
    "id": config.mz,
    "name": config.mzname
  };
  dashboardTO["dashboardMetadata"]["shared"] = "true";
  dashboardTO["dashboardMetadata"]["sharingDetails"]["linkShared"] = "true";
  dashboardTO["dashboardMetadata"]["sharingDetails"]["published"] = "true";

  var query = "/api/config/v1/dashboards/" + id;

  //any template specific changes, e.g. add tiles
  switch(config.tenantOverview){
    case "TenantOverview.json":
    case "LiteTenantOverview.json":
      break;
    case "00000000-dddd-bbbb-ffff-000000000001":
      break;
    case "SAP Application Cockpit.json":
      SAPappList(dashboardTO,config.SAPapps);
      break;
    case "RETenantOverview.json":
    case "RETenantOverview2.json":
      break;
    case "InfrastructureOverview.json":
      break;
    default:
  }

  //sub-dashboards & swaps
  let subs = getStaticSubDBs(dashboardTO, [config.oldTOid]);
  let swaps = generateTenantSwapList(config);
  swaps = transformSubs(subs, config.TOid, swaps, config);
  var dbObj = doSwaps(dashboardTO, swaps);
  dbObj = validateDB(dbObj);

  //upload
  let dbS = JSON.stringify(dbObj);
  saveConfigDashboard(configID(id), config);
  uploadSubs(subs);
  return dtAPIquery(query, { method: "PUT", data: dbS });
}

function updateTenantOverview(TOid) {
  let p1 = loadDashboard(TOid);
  let p2 = loadDashboard(configID(TOid));
  let p3 = getAllDashboards();
  //update/create link tile
  let to = TOid.split("-")[1];
  let reS = "bbbbbbbb-" + to + "-[0-9]{4}-0000-000000000000";
  let re = new RegExp(reS);
  $.when(p1, p2, p3).done(function (d1, d2, d3) {
    let dashboardTO = d1[0];
    let config = parseConfigDashboard(d2[0]);
    processDBADashboards(d3[0]);
    updateLinkTile(dashboardTO, config, re, "![Application Links1]()");
    var query = "/api/config/v1/dashboards/" + TOid;
    var data2 = JSON.stringify(dashboardTO);
    data2 = validateDB(data2);
    //upload
    saveConfigDashboard(configID(TOid), config);
    return dtAPIquery(query, { method: "PUT", data: data2 });
  });
}

function uploadAppOverview(config) {
  //get dashboard JSON
  var dashboardAO = JSON.parse(JSON.stringify(dbList.find(x => x.name === config.appOverview &&
    x.repo.owner === config.repo.owner && x.repo.repo === config.repo.repo && 
    x.repo.path === config.repo.path).file));
  let p2 = addParentConfig(config, config.TOid);
  return $.when(p2).then(function () {

    //transform
    var id = ("AOid" in config) ? config.AOid : nextAO(config.TOid);
    config.AOid = id;
    config.oldAOid = dashboardAO["id"];
    dashboardAO["id"] = id;
    dashboardAO["dashboardMetadata"]["owner"] = owner;
    //dashboardAO["dashboardMetadata"]["name"]=dashboardAO["dashboardMetadata"]["name"].replace(/MyApp/g,config.AOname+"");
    dashboardAO["dashboardMetadata"]["shared"] = "true";
    dashboardAO["dashboardMetadata"]["sharingDetails"]["linkShared"] = "true";
    dashboardAO["dashboardMetadata"]["sharingDetails"]["published"] = "false";
    dashboardAO["dashboardMetadata"]["dashboardFilter"]["managementZone"] = {
      "id": config.mz,
      "name": config.mzname
    };
    if ("costControlUserSessionPercentage" in config) addCostControlTile(dashboardAO, config);
    addReplaceButton(dashboardAO, config.TOid, "![BackButton]()", "⇦", findTopRight);
    var query = "/api/config/v1/dashboards/" + id;
    //string based transforms
    let swaps = generateAppSwapList(config);
    //sub-dashboards
    let subs = getStaticSubDBs(dashboardAO, [config.oldTOid, config.oldAOid]);
    swaps = transformSubs(subs, config.AOid, swaps, config);
    var dbObj = doSwaps(dashboardAO, swaps);

    //validate
    dbObj = validateDB(dbObj);

    //upload
    let dbS = JSON.stringify(dbObj);
    saveConfigDashboard(configID(id), config);
    uploadSubs(subs);
    return dtAPIquery(query, { method: "PUT", data: dbS });
  });
}

function updateAppOverview(AOid) {
  let p1 = loadDashboard(AOid);
  let p2 = loadDashboard(configID(AOid));
  let p3 = getAllDashboards();
  //update/create link tile
  let to = AOid.split("-")[1];
  let ao = AOid.split("-")[2];
  let reS = "bbbbbbbb-" + to + "-" + ao + "-[0-9]{4}-000000000000";
  let re = new RegExp(reS);
  $.when(p1, p2, p3).done(function (d1, d2, d3) {
    let dashboardAO = d1[0];
    let config = parseConfigDashboard(d2[0]);
    processDBADashboards(d3[0]);
    updateLinkTile(dashboardAO, config, re, "![Funnel Links1]()");
    var query = "/api/config/v1/dashboards/" + AOid;
    var data2 = JSON.stringify(dashboardAO);
    //validate
    data2 = validateDB(data2);
    //upload
    saveConfigDashboard(configID(AOid), config);
    return dtAPIquery(query, { method: "PUT", data: data2 });
  });
}

function uploadFunnel(config) {
  //get dashboard JSON
  var dashboardFO;
  var filename = "";

dashboardFO = JSON.parse(JSON.stringify(dbList.find(x => x.name === config.journeyOverview &&
    x.repo.owner === config.repo.owner && x.repo.repo === config.repo.repo && 
    x.repo.path === config.repo.path).file));
  let p2 = addParentConfig(config, config.AOid);
  return $.when(p2).then(function (data2) {

    //transform
    if (typeof (config.FOid) === "undefined")
      config.FOid = nextFO(config.AOid);
    config.oldFOid = dashboardFO["id"];
    dashboardFO["id"] = config.FOid;
    dashboardFO["dashboardMetadata"]["owner"] = owner;
    dashboardFO["dashboardMetadata"]["shared"] = "true";
    dashboardFO["dashboardMetadata"]["sharingDetails"]["linkShared"] = "true";
    dashboardFO["dashboardMetadata"]["sharingDetails"]["published"] = "false";
    if ("costControlUserSessionPercentage" in config) addCostControlTile(dashboardFO, config);
    addReplaceButton(dashboardFO, config.AOid, "![BackButton]()", "⇦", findTopRight);

    dashboardFO = whereClauseSwaps(dashboardFO, config);

    var query = "/api/config/v1/dashboards/" + config.FOid;

    //string based transforms
    //sub-dashboards
    let subs = getStaticSubDBs(dashboardFO, [config.oldTOid, config.oldAOid, config.oldFOid]);
    subs = listFunnelDB(config, subs);
    subs.forEach(function (sub, idx, arr) { arr[idx].file = whereClauseSwaps(sub.file, config); });
    var swaps = generateFunnelSwapList(config);
    swaps = transformSubs(subs, config.FOid, swaps, config);
    var dbObj = doSwaps(dashboardFO, swaps);
    config.dashboardName = dbObj["dashboardMetadata"]["name"]; //for fieldsetpainter

    //validate
    dbObj = validateDB(dbObj);

    //upload
    let dbS = JSON.stringify(dbObj);
    saveConfigDashboard(configID(config.FOid), config);
    uploadSubs(subs);
    return dtAPIquery(query, { method: "PUT", data: dbS });
  });
}

function uploadSubs(subs) {
  let deferreds = [];
  subs.forEach(function (db) {
    db.file = validateDB(db.file);
    let json = JSON.stringify(db.file);
    var query = "/api/config/v1/dashboards/" + db.file.id;
    deferreds.push(dtAPIquery(query, { method: "PUT", data: json }));
  });
  return deferreds;
}

function deleteFunnel(id) {
  var query = "/api/config/v1/dashboards/" + id;
  let p1 = dtAPIquery(query, { method: "DELETE" });

  let re = new RegExp("^" + id.substring(0, 24));
  DBAdashboards.forEach(function (db) {
    if (re.test(db.id) && db.id != id) {
      query = "/api/config/v1/dashboards/" + db.id;
      dtAPIquery(query, { method: "DELETE" });
    } else {
      //console.log(re.toString()+" does NOT match "+db);
    }
  });
  return $.when(p1);
}

function deleteTenant(id) {
  var query = "/api/config/v1/dashboards/" + id;
  let p1 = dtAPIquery(query, { method: "DELETE" });

  let re = new RegExp("^" + id.substring(0, 14));
  DBAdashboards.forEach(function (db) {
    if (re.test(db.id) && db.id != id) {
      query = "/api/config/v1/dashboards/" + db.id;
      dtAPIquery(query, { method: "DELETE" });
    }
  });
  return $.when(p1);
}

function deleteApp(id) {
  var query = "/api/config/v1/dashboards/" + id;
  let p1 = dtAPIquery(query, { method: "DELETE" });

  let re = new RegExp("^" + id.substring(0, 19));
  DBAdashboards.forEach(function (db) {
    if (re.test(db.id) && db.id != id) {
      query = "/api/config/v1/dashboards/" + db.id;
      dtAPIquery(query, { method: "DELETE" });
    }
  });
  return $.when(p1);
}

function saveConfigDashboard(id, config) {
  var dashboard;
  var p = $.get(configDashboard)
    .fail(errorboxJQXHR);
  return p.then(function (data) {
    dashboard = data;

    dashboard = buildConfigDashboard(dashboard, id, config);
    var query = "/api/config/v1/dashboards/" + id;
    var data2 = JSON.stringify(dashboard);

    //do not return a promise, run async
    dtAPIquery(query, { method: "PUT", data: data2 });
  });
}

function loadDashboard(id) {
  var query = "/api/config/v1/dashboards/" + id;
  return dtAPIquery(query, {});
}


function addParentConfig(config, id) {
  let p = loadDashboard(configID(id));

  return $.when(p).then(function (data) {
    let parentConfig = parseConfigDashboard(data);
    Object.keys(parentConfig).forEach(function (attr) {
      if (!config.hasOwnProperty(attr))
        config[attr] = parentConfig[attr];
    });
    return config;
  });
}

function publishDashboard(id, publish = false) {
  let p = loadDashboard(id);

  return $.when(p).done(function (data) {
    data.dashboardMetadata.sharingDetails.published = publish;
    if (publish) data.dashboardMetadata.shared = true;

    let p1 = uploadDashboard(id, data);
    return p1;
  })
}

function uploadDashboard(id, json) {
  if (typeof json == "object") json = JSON.stringify(json);
  var query = "/api/config/v1/dashboards/" + id;

  let p1 = dtAPIquery(query, { method: "PUT", data: json });
  return p1;
}

function deleteDashboard(id) {
  query = "/api/config/v1/dashboards/" + id;
  dtAPIquery(query, { method: "DELETE" });
}
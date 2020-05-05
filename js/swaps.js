function generateTenantSwapList(config) {
  let swaps = [
    { from: config.oldTOid, to: config.TOid, wrap: false },
    { from: "TEMPLATE:", to: config.TOname, wrap: true },
    { from: 'MyTenant', to: config.TOname, wrap: true },
    { from: 'ipName', to: config.ipName, wrap: true },
    { from: 'ipClause', to: config.ipClause, wrap: true },
    { from: 'ipCompare1Clause', to: config.compareipClause, wrap: true },
    { from: 'ipCompare1Name', to: config.ipCompareName, wrap: true },
    { from: 'ipCompare2Clause', to: config.compareipClause2, wrap: true },
    { from: 'ipCompare2Name', to: config.ipCompareName2, wrap: true }
  ];

  return swaps;
}

function generateAppSwapList(config) {
  let swaps = [
    { from: config.oldTOid, to: config.TOid, wrap: false },
    { from: config.oldAOid, to: config.AOid, wrap: false },
    { from: 'https://MyTenant', to: url, wrap: true },
    { from: "MyApp", to: config.appName, wrap: true },
    { from: "MyURLApp", to: config.appName, wrap: true },
    { from: "InternalAppID", to: config.appID, wrap: true },
  ];

  switch (config.appOverview) {
    case "AppOverview.json": {
      swaps = swaps.concat([
        { from: "compareMZid", to: config.compareMZid, wrap: true },
        { from: "compareMZname", to: config.compareMZname, wrap: true },
        { from: 'InternalCompareAppID', to: (config.compareAppID == "" ? config.appID : config.compareAppID), wrap: true },
        { from: "MyCompareApp", to: (config.compareAppName == "None" ? config.appName : config.compareAppName), wrap: true },
        { from: '-MyCompareTimeh to -MyTimeh', to: config.compareTime, wrap: true },
        { from: 'Previous MyTime Hours', to: config.compareTime, wrap: true },
        { from: '-MyTimeh', to: config.MyTime, wrap: true },
        { from: 'Last MyTime Hours', to: config.MyTime, wrap: true },
      ]);
      break;
    }
    case "CitrixOverview.json": {
      swaps = swaps.concat([
        { from: 'MZid', to: config.mz, wrap: true },
        { from: 'MZname', to: config.mzname, wrap: true },
        { from: 'CustomApp', to: config.customApp, wrap: true },
        { from: 'CustomAppID', to: config.customAppID, wrap: true },
        { from: 'MyServiceID', to: config.serviceID, wrap: true },
      ]);
      break;
    }
    case "REApplicationOverview.json":
    case "REApplicationOverview2.json": {
      swaps = swaps.concat([
        { from: 'ipName', to: config.ipName, wrap: true },
        { from: 'ipClause', to: config.ipClause, wrap: true },
        { from: 'ipCompare1Clause', to: config.compareipClause, wrap: true },
        { from: 'ipCompare1Name', to: config.ipCompareName, wrap: true },
        { from: 'ipCompare2Clause', to: config.compareipClause2, wrap: true },
        { from: 'ipCompare2Name', to: config.ipCompareName2, wrap: true },
      ]);
      break;
    }
    default:
  }
  return swaps;
}

function generateFunnelSwapList(config) {
  var swaps = [
    //NOTE: do NOT do any whereClause manipulation as strings, it makes escaping quotes challenging, do it instead in whereClauseSwaps
    { from: config.oldTOid, to: config.TOid, wrap: false },
    { from: config.oldAOid, to: config.AOid, wrap: false },
    { from: config.oldFOid, to: config.FOid, wrap: false },
    { from: 'InternalAppID', to: config.appID, wrap: false },
    { from: 'InternalCompareAppID', to: (config.compareAppID == "" ? config.appID : config.compareAppID), wrap: true },
    { from: 'https://MyTenant', to: url, wrap: true },
    { from: 'MyEmail', to: owner, wrap: true },
    { from: 'MyFunnel', to: config.funnelName, wrap: true },
    { from: 'MyCompareFunnel', to: config.compareFunnel, wrap: true },
    { from: '-MyCompareTimeh to -MyTimeh', to: config.compareTime, wrap: true },
    { from: 'Previous MyTime Hours', to: config.compareTime, wrap: true },
    { from: '-MyTimeh', to: config.MyTime, wrap: true },
    { from: 'Last MyTime Hours', to: config.MyTime, wrap: true },
    { from: 'MyApp', to: config.appName, wrap: true },
    //{from:"MyURLApp", to:encodeURIComponent(config.appName)},
    { from: "MyURLApp", to: config.appName, wrap: true },
    { from: 'MyCompareApp', to: (config.compareAppName == "None" ? config.appName : config.compareAppName), wrap: true },
    { from: 'Revenue', to: config.kpiName, wrap: true },
    {
      from: 'comparerevenueproperty', to: (typeof config.compareRevenue == "undefined" ?
        config.kpi : config.compareRevenue), wrap: true
    },
    { from: 'revenueproperty', to: config.kpi, wrap: true },
    //{from:'MyFilter', to:config.filterClause},
  ];

  //add funnel step headers to swaps
  //let funnelSteps = config.whereClause.split("AND");
  let funnelSteps = whereSplit(config.whereClause);
  for (let i = funnelSteps.length - 1; i >= 0; i--) {  //go in reverse because steps are not zero padded
    let j = i + 1;
    swaps.push({ from: 'StepHeader' + j, to: config.funnelData[i].label, wrap: true });
  }

  //handle campaign
  if (config.campaignActive) {
    swaps.push({ from: 'PromHeaderStep', to: config.promHeaderStep, wrap: true });
  } else {
    swaps.push({ from: 'PromHeaderStep', to: "No Active", wrap: true });
  }
  //handle new feature
  if (config.featureAdded) {
    swaps.push({ from: 'FeatureHeaderStep', to: config.FeatureHeaderStep, wrap: true });
  } else {
    swaps.push({ from: 'FeatureHeaderStep', to: "No New Feature", wrap: true });
  }
  return swaps;
}

function whereClauseSwaps(dbData, config) {
  let whereSwaps = [];
  //TODO: refactor to use forLoop
  let whereSteps = whereSplit(config.whereClause);
  if (config.campaignActive) { //special handling for Marketing campaign: insert into all Step1s but replace completely on Marketing pages
    if (dbData["dashboardMetadata"]["name"].includes("Marketing"))
      whereSteps[0] = "(" + config.campaignStep1.colname + "=\"" + config.campaignStep1.name + "\") ";
    else
      whereSteps[0] = whereSteps[0].replace(/\) ?$/, " OR " + config.campaignStep1.colname + "=\"" + config.campaignStep1.name + "\") ");
  }

  //OR'd set of steps
  let FunnelORClause = whereSteps.join(" OR ");
  whereSwaps.push({from: "FunnelORClause", to:FunnelORClause, wrap: true});

  //build FunnelStep
  let FunnelStep = "";
  let funnelSteps = [];
  for (let i = 0; i < whereSteps.length; i++) {
    funnelSteps.push(whereSteps[i] + " AS \"" + config.funnelData[i].label + "\"");
  }
  FunnelStep = funnelSteps.join(", ");

  //generic swaps here:
  if (config.featureAdded)
    whereSwaps.push({
      from: "StepNewFeature1", to:
        config.StepNewFeature1.colname + '=\"' + config.StepNewFeature1.name + '\"', wrap: true
    });
  if ("compareAppName" in config && config.compareAppName != "None") {
    whereSwaps.push({
      from: "CompareStepFunnel1", to:
        config.compareFirstStep.colname + '=\"' + config.compareFirstStep.name + '\"', wrap: true
    });//V5
    whereSwaps.push({ from: "CompareStepAction1", to: config.compareFirstStep.name, wrap: true });//V4
    whereSwaps.push({
      from: "CompareLastFunnelStep", to:
        config.compareLastStep.colname + '=\"' + config.compareLastStep.name + '\"', wrap: true
    });//V5
    whereSwaps.push({ from: "CompareLastStep", to: config.compareLastStep.name, wrap: true });//V4
    whereSwaps.push({
      from: "CompareCombinedStep", to:
        "(" + config.compareFirstStep.colname + "=\"" + config.compareFirstStep.name + "\" AND " +
        config.compareLastStep.colname + "=\"" + config.compareLastStep.name + "\") "
      , wrap: true
    });
  } else if ("xapp_compareAppName1" in config && config.xapp_compareAppName1 != "None") {
    whereSwaps.push({
      from: "CompareStepFunnel1", to:
        "(useraction.application=\"" + config.xapp_compareAppName1 + "\" and " +
        config.compareFirstStep.colname + '=\"' + config.compareFirstStep.name + '\")', wrap: true
    });//V5
    whereSwaps.push({
      from: "CompareLastFunnelStep", to:
        "(useraction.application=\"" + config.xapp_compareAppName2 + "\" and " +
        config.compareLastStep.colname + '=\"' + config.compareLastStep.name + '\")', wrap: true
    });//V5
    whereSwaps.push({
      from: "CompareCombinedStep", to:
        "((useraction.application=\"" + config.xapp_compareAppName1 + "\" and " +
        config.compareFirstStep.colname + '=\"' + config.compareFirstStep.name + '\") AND ' +
        "(useraction.application=\"" + config.xapp_compareAppName2 + "\" and " +
        config.compareLastStep.colname + '=\"' + config.compareLastStep.name + '\"))', wrap: true
    });//V5
  } else { //no compare app, default stuff out per Shady
    whereSwaps.push({ from: "CompareStepFunnel1", to: whereSteps[0], wrap: true });
    whereSwaps.push({ from: "CompareStepAction1", to: whereSteps[0], wrap: true });
    whereSwaps.push({ from: "CompareLastFunnelStep", to: whereSteps[whereSteps.length - 1], wrap: true });
    whereSwaps.push({ from: "CompareLastStep", to: whereSteps[whereSteps.length - 1], wrap: true });
    whereSwaps.push({ from: "CompareCombinedStep", to: config.whereClause, wrap: true });
  }
  whereSwaps.push({ from: "([^t])FunnelStep", to: "$1" + FunnelStep, wrap: true });
  whereSwaps.push({ from: "MyFilter", to: config.filterClause, wrap: true });
  whereSwaps.push({ from: "CombinedStep", to: config.whereClause, wrap: true });
  //Step specific swaps
  for (let i = whereSteps.length - 1; i >= 0; i--) {  //go in reverse because steps are not zero padded
    let j = i + 1;
    whereSwaps.push({ from: 'StepFunnel' + j, to: whereSteps[i], wrap: true }); //for DashboardsV5
    whereSwaps.push({ from: 'useraction.name ?= ?"StepAction' + j + '"', to: whereSteps[i], wrap: true });//V4
    whereSwaps.push({ from: 'useraction.name ?!= ?"StepAction' + j + '"', to: " NOT " + whereSteps[i], wrap: true });
    whereSwaps.push({ from: 'name ?= ?"?StepAction' + j + '"', to: whereSteps[i], wrap: true });
    whereSwaps.push({ from: 'name ?!= ?"StepAction' + j + '"', to: " NOT " + whereSteps[i], wrap: true });
    whereSwaps.push({ from: 'Step' + j + '"', to: whereSteps[i], wrap: true }); //temp until John fixes V5
    if (i == whereSteps.length - 1) {
      whereSwaps.push({ from: 'StepFunnelLast', to: whereSteps[i], wrap: true }); //for DashboardsV5
      whereSwaps.push({ from: 'LastFunnelStep', to: whereSteps[i], wrap: true }); //for DashboardsV5
      whereSwaps.push({ from: 'useraction.name ?= ?"LastStep"', to: whereSteps[i], wrap: true });
      whereSwaps.push({ from: 'useraction.name ?[iInN]{2} ?\\("LastStep"\\)', to: whereSteps[i], wrap: true });
      whereSwaps.push({ from: 'useraction.name ?!= ?"?LastStep"', to: " NOT " + whereSteps[i], wrap: true });
      whereSwaps.push({ from: 'name ?= ?"?LastStep"', to: whereSteps[i], wrap: true });
      whereSwaps.push({ from: 'name ?!= ?"?LastStep"', to: " NOT " + whereSteps[i], wrap: true });
      whereSwaps.push({ from: 'LastStep', to: whereSteps[i], wrap: true }); //temp until John fixes V5
    }
  }
  /*} else if(t.tileType=="MARKDOWN" && t.markdown.includes("sessionquery")) { //handle URL Encoded queries
    //TODO: refactor ugly mess with doEncodedMarkdownTileSwaps
let query = t.markdown.match(/sessionquery=([^&]*)&?/)[1];
query = decodeURIComponent(query);
//let whereSteps = config.whereClause.split("AND");
let whereSteps = whereSplit(config.whereClause);
query = query.replace(new RegExp('comparerevenueproperty',to: (typeof config.compareRevenue == "undefined"?
    config.kpi:config.compareRevenue));   
query = query.replace(new RegExp('revenueproperty',to: config.kpi);
query = query.replace(new RegExp('Revenue',to: config.kpiName);
query = query.replace(new RegExp("([^t])FunnelStep",to:"$1"+FunnelStep);
query = query.replace(new RegExp("MyFilter",to:config.filterClause);
query = query.replace(new RegExp("CombinedStep",to:config.whereClause);
for(let i=whereSteps.length-1; i>=0; i--) {  //go in reverse because steps are not zero padded
  let j=i+1;
    query = query.replace(new RegExp('StepFunnel'+j,to: whereSteps[i]); //for DashboardsV5
    query = query.replace(new RegExp('useraction.name ?= ?"?StepAction'+j+'"',to: whereSteps[i]);
    query = query.replace(new RegExp('useraction.name ?!= ?"StepAction'+j+'"',to: " NOT " +whereSteps[i]);
    query = query.replace(new RegExp('name ?= ?"?StepAction'+j+'"',to: whereSteps[i]);
    query = query.replace(new RegExp('name ?!= ?"StepAction'+j+'"',to: " NOT " +whereSteps[i]);
    query = query.replace(new RegExp('Step'+j+'"',to: whereSteps[i]); //temp until John fixes V5
  if(i==whereSteps.length-1) {
      query = query.replace(new RegExp('StepFunnelLast',to: whereSteps[i]); //for DashboardsV5
      query = query.replace(new RegExp('LastFunnelStep',to: whereSteps[i]); //for DashboardsV5
      query = query.replace(new RegExp('LastURLStep',to: whereSteps[i]); //for DashboardsV5
      query = query.replace(new RegExp('useraction.name ?= ?"LastStep"',to: whereSteps[i]);
      query = query.replace(new RegExp('useraction.name ?[iInN]{2} ?\\("LastStep"\\)',to: whereSteps[i]);
      query = query.replace(new RegExp('useraction.name ?!= ?"LastStep"',to: " NOT "+whereSteps[i]);
      query = query.replace(new RegExp('name ?= ?"LastStep"',to: whereSteps[i]);
      query = query.replace(new RegExp('name ?!= ?"LastStep"',to: " NOT "+whereSteps[i]);
      query = query.replace(new RegExp('LastStep',to: whereSteps[i]); //temp until John fixes V5
  }
}
query = encodeURIComponent(query);
t.markdown = t.markdown.replace(/sessionquery=[^&]*&/, "sessionquery="+query+"&");
  }
});
//}*/
  
  dbData = doSwaps(dbData, whereSwaps);
  return dbData;
}

function doSwaps(db, swaps) {
  var dbS = "";
  let matches = scanForTokens(db);
  if (matches.length > 0) {
    swaps = JSON.parse(JSON.stringify(swaps)); //copy
    swaps.forEach(function (s) {
      if (s.wrap) s.from = "\\${" + s.from + "}";
    });
  } else if (typeof db == "object") {
    console.log("Unconvert tokens in " + db.dashboardMetadata.name);
  }

  if (typeof db == "string") { //already a string, great do the swaps
    dbS = db;
  } else if (typeof db == "object") { //handles url encoded tiles, then stringify, replace again
    db.tiles.forEach(function (t) {
      if (t.tileType == "MARKDOWN") {
        doEncodedMarkdownTileSwaps(t, swaps);
      } else if (t.tileType == "DTAQL") {
        swaps.forEach(function (swap) {
          t.query = t.query.replace(new RegExp(swap.from, 'g'), swap.to);
        });
      }
    });
    dbS = JSON.stringify(db);
  }
  swaps.forEach(function (swap) {
    dbS = dbS.replace(new RegExp(swap.from, 'g'), swap.to);
  });

  let dbObj = {};
  try{
    dbObj = JSON.parse(dbS);
  } catch(err){
    console.log(err);
    console.log(dbS);
    console.log(swaps);
  }
  return dbObj; //always return db as a new object
}

function doEncodedMarkdownTileSwaps(t, swaps) {
  if (t.tileType == "MARKDOWN") {
    let match = t.markdown.match(/sessionquery=([^&]*)&?/);
    if (match) {
      let query = match[1];
      query = decodeURIComponent(query);

      swaps.forEach(function (swap) {
        query = query.replace(new RegExp(swap.from, 'g'), swap.to);
      });

      query = encodeURIComponent(query);
      t.markdown = t.markdown.replace(/sessionquery=[^&]*&?/, "sessionquery=" + query + "&");
    }
    else if(t.markdown.includes("sessionquery")){
      console.log("MARKDOWN tile did not match regex");
      console.log(t);
    }
  }
  return; //t passed by ref
}

function transformSubs(subs, dbid, swaps, config) {
  let id = dbid;
  config.subids = [];
  subs.forEach(function (db) {
    sub = db.file
    id = nextDB(id);
    swaps.push({ from: sub.id, to: id, wrap: false });
    config.subids.push({ from: sub.id, to: id });
    sub.id = id;
    sub["dashboardMetadata"]["owner"] = owner;
    sub["dashboardMetadata"]["shared"] = "true";
    sub["dashboardMetadata"]["sharingDetails"]["linkShared"] = "true";
    sub["dashboardMetadata"]["sharingDetails"]["published"] = "false";
    sub["dashboardMetadata"]["dashboardFilter"]["managementZone"] = {
      "id": config.mz,
      "name": config.mzname
    };
    if ("costControlUserSessionPercentage" in config) addCostControlTile(sub, config);
    addReplaceButton(sub, dbid, "![BackButton]()", "⇦", findTopRight);
  });

  for (let i = 0; i < subs.length; i++) {
    subs[i].file = doSwaps(subs[i].file, swaps);
  }

  return swaps; //give back the swap list to transform the main db
}

function whereSplit(where) {
  // rely on Steps seperated by "AND", inside step use "and"    
  return where.split(' AND ');
}

function scanForTokens(db) {
  var dbs = "";
  if (typeof db == "string") { //already a string, great do the swaps
    dbs = db;
  } else if (typeof db == "object") {
    dbs = JSON.stringify(db);
  }

  let matches = Array.from(dbs.matchAll(/\${[^}]*}/g), m => m[0]);
  if (matches.length > 0)
    return matches;
  else
    return [];
}
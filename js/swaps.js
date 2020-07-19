/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
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
    { from: 'ipCompare2Name', to: config.ipCompareName2, wrap: true },
    { from: 'overviewName', to: config.TOname, wrap: true }
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
  whereSwaps.push({ from: "FunnelORClause", to: FunnelORClause, wrap: true });

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

  dbData = doSwaps(dbData, whereSwaps);
  return dbData;
}

function doSwaps(db, swaps) {
  var dbS = "";
  let matches = scanForTokens(db);
  if (matches.length > 0) {
    swaps = JSON.parse(JSON.stringify(swaps)); //copy
    swaps.forEach(function (s, idx, arr) {
      if (s.wrap) s.from = "\\${" + s.from + "}";
      else if (s.from.charAt(0) == '$') s.from = '\\' + s.from;
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
    let to = swap.to.replace(/\\([\s\S])|(")/g, "\\$1$2"); //escape any unescaped quotes
    dbS = dbS.replace(new RegExp(swap.from, 'g'), to);
  });

  let dbObj = {};
  try {
    dbObj = JSON.parse(dbS);
  } catch (err) {
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
    else if (t.markdown.includes("sessionquery")) {
      console.log("MARKDOWN tile did not match regex");
      console.log(t);
    }
  }
  return; //t passed by ref
}

function transformSubs(subs, dbid, swaps, config, nextID = nextDB) {
  let id = dbid;
  config.subids = [];
  subs.forEach(function (db) {
    sub = db.file
    id = nextID(id);
    swaps.push({ from: sub.id, to: id, wrap: false });
    config.subids.push({ from: sub.id, to: id });
    sub.id = id;
    sub["dashboardMetadata"]["owner"] = owner;
    sub["dashboardMetadata"]["shared"] = "true";
    sub["dashboardMetadata"]["sharingDetails"]["linkShared"] = "true";
    sub["dashboardMetadata"]["sharingDetails"]["published"] = "false";
    if (typeof config.mz == "string")
      sub["dashboardMetadata"]["dashboardFilter"]["managementZone"] = {
        "id": config.mz,
        "name": config.mzname
      };
    else sub["dashboardMetadata"]["dashboardFilter"]["managementZone"] = null;
    if ("costControlUserSessionPercentage" in config) addCostControlTile(sub, config);
    if (config.addBackButtons !== false)
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
  } else if (typeof db == "undefined") return [];

  let matches = Array.from(dbs.matchAll(/\${[^}]*}/g), m => m[0]);
  if (matches.length > 0)
    return matches;
  else
    return [];
}

function generateWorkflowSwapList(el) {
  let $el = $(el);
  //let swaps = [];
  if (typeof selection.swaps == "undefined") selection.swaps = [];
  let swaps = selection.swaps;

  $el.find(".workflowInput").each(function (i, el) {
    let $workflowInput = $(this);
    let $slicer = $workflowInput.find(".apiResultSlicer, .usqlResultSlicer");
    let slicer = $slicer.val();
    let whereClause = ($slicer.attr("data-addWhereClause") === 'true') ?
      true : false;
    let transform = $workflowInput.find(".transform span").text();
    let journeyPicker = $workflowInput.find(".journeyPicker");
    let conditionalSwap = $workflowInput.find(".conditionalSwap");
    let configOverride = $workflowInput.find(".configOverride");
    let tileReplication = $workflowInput.find(".tileReplication");

    if (journeyPicker.length) {
      journeyGetSwaps($workflowInput, transform, swaps);
    } else if (conditionalSwap.length) {
      conditionalGetSwaps($workflowInput, transform, swaps);
    } else if (configOverride.length) {
      configOverrideGetSwaps($workflowInput, swaps);
    } else if (tileReplication.length) {
      addTileReplication($workflowInput, swaps);
    } else if (whereClause) {
      let from = "${" + transform + "}";
      let filterClause = $workflowInput.find("input.filterClause, input.whereClause").val();
      //filterClause = filterClause.replace(/"/g, '\\"'); //not sure why I needed this before but now do not...

      addToSwaps(swaps, { from: from, to: filterClause });
    } else switch (slicer) {
      case "ApplicationMethods":
      case "{entityId:name}":
      case "{entityId:displayName}":
      case "values:{id:name}": {
        let $select = $workflowInput.find("select");
        apiSelectGetSwaps($select, transform, swaps);
        break;
      }
      //TODO: support multi for USQL, non whereClause
      case 'Keys': {
        let $option = $workflowInput.find("select option:selected");
        let value = $option.val();
        let key = $option.text();
        let fromkey = "${" + transform + ".name}";
        let fromval = "${" + transform + ".id}";
        addToSwaps(swaps, { from: fromkey, to: key });
        addToSwaps(swaps, { from: fromval, to: value });
        break;
      }
      case 'Keys/Values': {
        let $selects = $workflowInput.find("select");
        let $key = $($selects[0]).find("option:selected");
        let $val = $($selects[1]).find("option:selected");
        let key = $key.attr("data-colname") + "." + $key.val();
        let value = $val.val();

        let fromkey = "${" + transform + ".key}";
        let fromval = "${" + transform + ".value}";
        addToSwaps(swaps, { from: fromkey, to: key });
        addToSwaps(swaps, { from: fromval, to: value });
        break;
      }
      case 'ValX3': {
        let $selects = $workflowInput.find("select");
        let val1 = $($selects[0]).val();
        let val2 = $($selects[1]).val();
        let val3 = $($selects[2]).val();

        let from1 = "${" + $("#transform").val() + ".1}";
        let from2 = "${" + $("#transform").val() + ".2}";
        let from3 = "${" + $("#transform").val() + ".3}";
        addToSwaps(swaps, { from: from1, to: val1 });
        addToSwaps(swaps, { from: from2, to: val2 });
        addToSwaps(swaps, { from: from3, to: val3 });
        break;
      }
      case 'actions': {
        let $option = $workflowInput.find("select option:selected");
        let value = $option.val();
        let from = "${" + transform + "}";
        addToSwaps(swaps, { from: from, to: value });
        break;
      }
      case undefined:
      default: {
        let from = "${" + transform + "}";
        let to = $workflowInput.find("input:not([type=hidden]):not(.chosen-search-input)").val();
        if (typeof to !== "undefined") addToSwaps(swaps, { from: from, to: to });

        let fromkey = "${" + transform + ".key}";
        let fromval = "${" + transform + ".value}";
        let $select = $workflowInput.find("select");
        if ($select.length) {
          let multi = $select.attr("multiple");
          if (multi) {
            let $opts = $select.find("option:selected");
            for (let i = 0; i < $opts.length; i++) {
              let $opt = $($opts[i]);
              fromkey = "${" + transform + "-" + i + ".key}";
              fromval = "${" + transform + "-" + i + ".value}";
              addToSwaps(swaps, { from: fromkey, to: $opt.text() });
              addToSwaps(swaps, { from: fromval, to: $opt.val() });
            }
            let fromcount = "${" + transform + ".count}";
            addToSwaps(swaps, { from: fromcount, to: $opts.length.toString() });
          } else {
            let $opt = $select.find("option:selected");
            addToSwaps(swaps, { from: fromkey, to: $opt.text() });
            addToSwaps(swaps, { from: fromval, to: $opt.val() });
          }
        }
      }
    }
  });

  return swaps;
}

function queryDoSwaps(query, swaps) {
  swaps.forEach(function (swap) {
    let regex = new RegExp('\\' + swap.from, 'g');
    if (query.match(regex) && swap.to.substring(0, 1) == '"' && swap.to.substr(-1) == '"') {//handle quoted string, which is about to be inserted into a quoted string
      //we know that regex matches and to is a quoted string, confirm that it would be double-wrapped
      let regex2 = new RegExp('"\\' + swap.from + '"', 'g');
      if (query.match(regex2)) //unwrap double-wrapped quotes
        query = query.replace(regex, swap.to.substring(1, swap.to.length - 2));
    } else {
      query = query.replace(regex, swap.to);
    }
  });
  return query;
}

function addToSwaps(swaps, swap) {
  if (typeof swap.to != "string") {
    console.log("Adding non-string swap.to value, fail.");
    return false;
  }
  //swap.to = swap.to.replace(/\\([\s\S])|(")/g,"\\$1$2"); //escape any quotes //this breaks things :(
  if (!swaps.find(x => x.from === swap.from && x.to === swap.to)) {

    swaps.push(swap);
  }

}

function apiSelectGetSwaps(select, transform, swaps) {
  let $select = $(select);
  if ($select.attr("multiple")) {
    let values = [];
    $select.find("option:selected").each((i, e) => {
      let $e = $(e);
      let obj = { value: $e.val(), key: $e.text() };
      if (typeof $e.attr("data-type") !== "undefined") obj['type'] = $e.attr("data-type");
      values.push(obj);
    });
    let i = 1;
    values.forEach((obj) => {
      let fromkey = "${" + transform + "-" + i + ".name}";
      let fromval = "${" + transform + "-" + i + ".id}";
      addToSwaps(swaps, { from: fromkey, to: obj.key });
      addToSwaps(swaps, { from: fromval, to: obj.value });
      if (typeof obj.type != "undefined") {
        let fromtype = "${" + transform + "-" + i + ".type}";
        addToSwaps(swaps, { from: fromtype, to: obj.type });
      }
      i++;
    });
    let fromcount = "${" + transform + ".count}";
    addToSwaps(swaps, { from: fromcount, to: values.length.toString() });
    let from = "${" + transform + ".name}";
    let to = values.map(x => '"' + x.key.replace(/"/g, '\\"') + '"')
      .join(' , ');
    addToSwaps(swaps, { from: from, to: to });
    from = "${" + transform + ".id}";
    to = values.map(x => '"' + x.value.replace(/"/g, '\\"') + '"')
      .join(' , ');
    addToSwaps(swaps, { from: from, to: to });
  } else {
    let val = $select.val();
    let key = $select.children("option:selected").text();

    let fromkey = "${" + transform + ".name}";
    let fromval = "${" + transform + ".id}";
    addToSwaps(swaps, { from: fromkey, to: key });
    addToSwaps(swaps, { from: fromval, to: val });
    if ($select.children("option:selected[data-type]").length) {
      let type = $select.children("option:selected[data-type]").attr("data-type");
      let fromtype = "${" + transform + ".type}";
      addToSwaps(swaps, { from: fromtype, to: type });
    }
  }
}

function journeyGetSwaps(workflowInput, transform, swaps) {
  let $workflowInput = $(workflowInput);
  let from = "${" + transform + ".where}";
  let where = $workflowInput.find("input.whereClause").val();
  addToSwaps(swaps, { from: from, to: where });
  let whereSteps = whereSplit(where);
  whereSteps.forEach(function (x, i) {
    from = "${" + transform + ".where-" + (i + 1) + "}";
    addToSwaps(swaps, { from: from, to: x });
    if (i == whereSteps.length - 1) {
      from = "${" + transform + ".where-last}";
      addToSwaps(swaps, { from: from, to: x });
    }
  });

  from = "${" + transform + ".funnel}";
  let $funnelClause = $workflowInput.find("input.funnelClause");
  where = $funnelClause.val();
  addToSwaps(swaps, { from: from, to: where });
  let journeyData = JSON.parse($funnelClause.attr("data-journeyData"));
  journeyData.forEach(function (d, i) {
    from = "${" + transform + ".header-" + (i + 1) + "}";
    addToSwaps(swaps, { from: from, to: d.label });
    if ("appname" in d) {
      from = "${" + transform + ".app-" + (i + 1) + "}";
      addToSwaps(swaps, { from: from, to: d.appname });
    }
    if (i == journeyData.length - 1) {
      from = "${" + transform + ".header-last}";
      addToSwaps(swaps, { from: from, to: d.label });
      if ("appname" in d) {
        from = "${" + transform + ".app-last}";
        addToSwaps(swaps, { from: from, to: d.appname });
      }
    }
  });

  from = "${" + transform + ".steps}";
  addToSwaps(swaps, { from: from, to: journeyData.length.toString() });
}

function conditionalGetSwaps(workflowInput, transform, swaps) {
  let $workflowInput = $(workflowInput);
  let from = "${" + transform + "}";
  let conditionalValues = JSON.parse($workflowInput.find(".conditionalValues").val());
  let conditionalPrior = $workflowInput.find(".conditionalPrior").val();
  let priorSwap = swaps.find(x => x.from === conditionalPrior);
  if (typeof priorSwap != "undefined") {
    let val = conditionalValues.find(x => x.prior === priorSwap.to);
    addToSwaps(swaps, { from: from, to: val.swap });
  }
}

function configOverrideGetSwaps(workflowInput, swaps) {
  let $workflowInput = $(workflowInput);
  let overrideValues = JSON.parse($workflowInput.find(".overrideValues").val());
  let overridePrior = $workflowInput.find(".overridePrior").val();
  let overrideAction = $workflowInput.find(".overrideAction").val();
  let priorSwap = swaps.find(x => x.from === overridePrior);
  if (typeof priorSwap != "undefined") {
    let val = overrideValues.find(x => x.prior === priorSwap.to);
    switch (overrideAction) {
      case "OverviewDB":
        if (typeof selection == "undefined") {
          logError("Selection undefined");
          selection = {};
        }
        if (typeof selection.config == "undefined") {
          logError("Selection.config undefined");
          selection.config = {};
        }
        if (typeof val !== "undefined")
          selection.config.overviewDB = val.overrideValue;
        else
          console.log("No override match found");
    }
  }
}

function addTileReplication(workflowInput, swaps) {
  let $workflowInput = $(workflowInput);
  let replicationColumns = $workflowInput.find(".replicationColumns").val();
  let replicationTileName = $workflowInput.find(".replicationTileName").val();
  let replicationPriorTransform = $workflowInput.find(".replicationPriorTransform").val();
  if (replicationPriorTransform.substr(0, 2) == '${' &&
    replicationPriorTransform.substr(-1) == '}')
    replicationPriorTransform = replicationPriorTransform.substr(2, replicationPriorTransform.length - 3);

  let swapCount = swaps.find(x => x.from === '${' + replicationPriorTransform + '.count}');
  let count = 0;
  if (typeof swapCount != "undefined") {
    let variants = swaps.filter(x => x.from.startsWith('${' + replicationPriorTransform + '-1.'))
      .map(x => x.from.match(/-1\.([^}]+)/)[1]);
    let vals = [];
    swaps.filter(x => x.from.startsWith('${' + replicationPriorTransform + '-') &&
      x.from.endsWith('.name}'))
      .forEach((x) => {
        let i = x.from.match(/-([^.]+)\./)[1];
        vals[i] = x.to;
      })
    count = parseInt(swapCount.to);
    let replicator = {
      columns: replicationColumns,
      tilename: replicationTileName,
      count: count,
      transform: replicationPriorTransform,
      variants: variants,
      vals: vals
    }
    if (typeof selection.TileReplicators === "undefined") selection.TileReplicators = [];
    selection.TileReplicators.push(replicator);
  } else return;
}
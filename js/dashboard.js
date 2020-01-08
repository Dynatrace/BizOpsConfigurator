
function dbFindBottom(db) {
  let bottom = 0;

  db.tiles.forEach(function(tile) {
    bottom = Math.max(bottom, tile.bounds.top + tile.bounds.height);
  });

  return(bottom);
}

function createLinkTile(bounds,re,myID,title="") {
  //generate a Markdown tile with links to all dashboards that match a re at certain spot
  let json =    " { \"name\": \"Markdown\", \"tileType\": \"MARKDOWN\", \"configured\": true, \"bounds\": { \"top\": 760, \"left\": 0, \"width\": 266, \"height\": 38 }, \"tileFilter\": { \"timeframe\": null, \"managementZone\": null }, \"markdown\": \"\" }";
  let tile = JSON.parse(json);
  let minHeight = 0;

  tile.bounds = bounds;

  if(title.length>0) {
    tile.markdown = "## "+title+"\n";
    minHeight = 38;
  }

  DBAdashboards.forEach(function(db) {
    if(re.test(db.id) && db.id != myID) {
      if(tile.markdown.length > 0) tile.markdown += "\n";
      tile.markdown += "["+db.name+"](#dashboard;id="+db.id+")";
      minHeight += 38;
    }
  });

  tile.bounds.height = Math.max(tile.bounds.height,minHeight);
 return tile;
}

function generateSwapList(config)
{
  var swaps = [];

  swaps.push({from:config.oldTOid, to:config.TOid});
  swaps.push({from:config.oldAOid, to:config.AOid});
  swaps.push({from:config.oldFOid, to:config.FOid});
  swaps.push({from:'InternalAppID', to:config.appID});
  swaps.push({from:'InternalCompareAppID', to:config.compareAppID});
  swaps.push({from:'https://MyTenant', to:url});
  swaps.push({from:'MyEmail', to:owner});
  swaps.push({from:'MyFunnel', to:config.funnelName});
  swaps.push({from:'MyCompareFunnel', to:config.compareFunnel});   //Don't really understand this one
  swaps.push({from:'MyTime', to:"2"});                          //What's this for?
  swaps.push({from:'MyCompareTime', to:config.compareTime});
  swaps.push({from:'MyApp', to:config.appName});
  swaps.push({from:'MyCompareApp', to:config.compareAppName});
  swaps.push({from:'CompareStep1', to:config.compareFirstStep});
  swaps.push({from:'CompareLastStep', to:config.compareLastStep});
  swaps.push({from:'PromHeaderStep', to:"No Active"});          //What do we do with this?
  swaps.push({from:'comparerevenueproperty', to:config.compareRevenue});   //Guess we need to pick the KPI from compare app...
  swaps.push({from:'revenueproperty', to:config.kpi});
  swaps.push({from:'Revenue', to:config.kpiName});

  //add funnel steps to swaps
  let funnelSteps = config.whereClause.split("AND");
  for(let i=funnelSteps.length-1; i>=0; i--) {  //go in reverse because steps are not zero padded
    let j=i+1;
//    swaps.push({from:new RegExp('useraction.name ?= ?\\\\?"Step'+j+'\\\\?"'), to:funnelSteps[i]});
//    swaps.push({from:'Step'+j, to:funnelSteps[i]});
//    swaps.push({from:'22Step'+j, to:encodeURI(funnelSteps[i])});
    swaps.push({from:'StepHeader'+j, to:config.funnelData[i].label});
    if(i==funnelSteps.length-1) {
//      swaps.push({from:new RegExp('useraction.name ?= ?\\\\?"LastStep\\\\?"'), to:funnelSteps[i]});
//      swaps.push({from:'useraction.name = "LastStep"', to:funnelSteps[i]});
//      swaps.push({from:'LastStep', to:funnelSteps[i]});
//      swaps.push({from:'22LastStep', to:encodeURI(funnelSteps[i])});
      swaps.push({from:'CompareLastStep', to:funnelSteps[i].label});
    }
  }

  return swaps;
}

function listFunnelDB(config) {
  let list = [];
  let re1= /[fF]unnel([0-9]{1,2})/;
  let re2= /[fF]unnelAnalysisStep([0-9]{1,2})/;
  let steps = config.funnelData.length;

  dbFunnelList.forEach(function(db) {
  //skip unneeded dbs
    if(config.kpi=="n/a" && db.includes("True"))
	return;
    if(config.kpi!="n/a" && db.includes("False"))
	return;
    if(config.compareApp=="" && db.includes("Compare"))
	return; 

  //figure out if the funnel db is needed
    let res1 = re1.exec(db);
    let res2 = re2.exec(db);
    if(res1 !==null && res1[1] != steps)
	return;
    if(res2 !==null && res2[1] > steps)
	return;

  //if we're still going, it should be good, add it to the list
    list.push(db);
  });
  return list;
}

function whereClauseSwaps(dbData,config) {
  //config.whereClause = config.whereClause.replace(/[^"]"[^"]/,"\"\""); //escape doublequotes in whereClause
  let funnelSteps = config.whereClause.split("AND");

  //if(dbData["dashboardMetadata"]["name"].includes("Funnel")) {
    dbData["tiles"].forEach(function(t) {
      if(t.tileType=="DTAQL") {
  	if(typeof(t.query) === 'undefined'){console.log("DTAQL w/o query");return;}
	let funnelSteps = config.whereClause.split("AND");
	for(let i=funnelSteps.length-1; i>=0; i--) {  //go in reverse because steps are not zero padded
	    let j=i+1;
  	    t.query = t.query.replace(new RegExp('useraction.name ?= ?"Step'+j+'"',"g"), funnelSteps[i]);
  	    t.query = t.query.replace(new RegExp('name ?= ?"?Step'+j+'"',"g"), funnelSteps[i]);
  	    t.query = t.query.replace(new RegExp('useraction.name ?!= ?"Step'+j+'"',"g"), " NOT " +funnelSteps[i]);
  	    t.query = t.query.replace(new RegExp('name ?!= ?"Step'+j+'"',"g"), " NOT " +funnelSteps[i]);
	    if(i==funnelSteps.length-1) {
  	      t.query = t.query.replace(new RegExp('useraction.name ?= ?"LastStep"',"g"), funnelSteps[i]);
  	      t.query = t.query.replace(new RegExp('useraction.name ?[iInN]{2} ?\\("LastStep"\\)',"g"), funnelSteps[i]);
  	      t.query = t.query.replace(new RegExp('name ?= ?"?LastStep"',"g"), funnelSteps[i]);
  	      t.query = t.query.replace(new RegExp('useraction.name ?!= ?"?LastStep"',"g"), " NOT "+funnelSteps[i]);
  	      t.query = t.query.replace(new RegExp('name ?!= ?"?LastStep"',"g"), " NOT "+funnelSteps[i]);
	    }
	}
      } else if(t.tileType=="MARKDOWN" && t.markdown.includes("sessionquery")) {
	let query = t.markdown.match(/sessionquery=([^&]*)&?/)[1];
	query = decodeURIComponent(query);
	let funnelSteps = config.whereClause.split("AND");
	for(let i=funnelSteps.length-1; i>=0; i--) {  //go in reverse because steps are not zero padded
	    let j=i+1;
  	    query = query.replace(new RegExp('useraction.name ?= ?"?Step'+j+'"',"g"), funnelSteps[i]);
  	    query = query.replace(new RegExp('name ?= ?"?Step'+j+'"',"g"), funnelSteps[i]);
  	    query = query.replace(new RegExp('useraction.name ?!= ?"Step'+j+'"',"g"), " NOT " +funnelSteps[i]);
  	    query = query.replace(new RegExp('name ?!= ?"Step'+j+'"',"g"), " NOT " +funnelSteps[i]);
	    if(i==funnelSteps.length-1) {
  	      query = query.replace(new RegExp('useraction.name ?= ?"LastStep"',"g"), funnelSteps[i]);
  	      query = query.replace(new RegExp('useraction.name ?[iInN]{2} ?\\("LastStep"\\)',"g"), funnelSteps[i]);
  	      query = query.replace(new RegExp('name ?= ?"LastStep"',"g"), funnelSteps[i]);
  	      query = query.replace(new RegExp('useraction.name ?!= ?"LastStep"',"g"), " NOT "+funnelSteps[i]);
  	      query = query.replace(new RegExp('name ?!= ?"LastStep"',"g"), " NOT "+funnelSteps[i]);
	    }
	}
	query = encodeURIComponent(query);
	t.markdown = t.markdown.replace(/sessionquery=[^&]*&/, "sessionquery="+query+"&");
      }
    });
  //}
}

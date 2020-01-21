
function dbFindBottom(db) {
  let bottom = 0;

  db.tiles.forEach(function(tile) {
    bottom = Math.max(bottom, tile.bounds.top + tile.bounds.height);
  });

  return(bottom);
}

function findLinkTile(db, marker) {
  let t = {};
  for(let i=0; i<db.tiles.length; i++) {
    t = db.tiles[i];
    if(t.tileType=="MARKDOWN" && t.markdown.startsWith(marker)) {
        return(i);
    }
  }
  return(db.tiles.length);  //We need to push a new tile
}

function createLinkTile(bounds,re,myID,marker) {
  //generate a Markdown tile with links to all dashboards that match a re at certain spot
  let json =    " { \"name\": \"Markdown\", \"tileType\": \"MARKDOWN\", \"configured\": true, \"bounds\": { \"top\": 760, \"left\": 0, \"width\": 266, \"height\": 38 }, \"tileFilter\": { \"timeframe\": null, \"managementZone\": null }, \"markdown\": \"\" }";
  let tile = JSON.parse(json);
  let minHeight = 0;

  tile.bounds = bounds;

  if(marker.length>0) {
    tile.markdown = marker;
    minHeight = 38;
  }

  DBAdashboards.forEach(function(db) {
    let name = db.name.replace(/^[^ ]* /, ''); //strip emojis in small links
    if(re.test(db.id) && db.id != myID) {
      if(tile.markdown.length > 0) tile.markdown += "\n";
      tile.markdown += "## ["+name+"](#dashboard;id="+db.id+")\n";
      minHeight += 38;
    }
  });

  tile.bounds.height = Math.max(tile.bounds.height,minHeight);
 return tile;
}

function generateSwapList(config)
{
  var swaps = [];
  //NOTE: do NOT do any whereClause manipulation as strings, it makes escaping quotes challenging, do it instead in whereClauseSwaps
  swaps.push({from:config.oldTOid, to:config.TOid});
  swaps.push({from:config.oldAOid, to:config.AOid});
  swaps.push({from:config.oldFOid, to:config.FOid});
  swaps.push({from:'InternalAppID', to:config.appID});
  swaps.push({from:'InternalCompareAppID', to:config.compareAppID});
  swaps.push({from:'https://MyTenant', to:url});
  swaps.push({from:'MyEmail', to:owner});
  swaps.push({from:'MyFunnel', to:config.funnelName});
  swaps.push({from:'MyCompareFunnel', to:config.compareFunnel});   
  swaps.push({from:'MyTime', to:"2"});                          //What's this for?
  swaps.push({from:'MyCompareTime', to:(typeof(config.compareTime)=="undefined"?"2h":config.compareTime)});
  swaps.push({from:'MyApp', to:config.appName});
  swaps.push({from:'MyCompareApp', to:(typeof(config.compareAppName)=="undefined"?config.appName:config.compareAppName)});
  swaps.push({from:'comparerevenueproperty', to:config.compareRevenue});   
  swaps.push({from:'revenueproperty', to:config.kpi});
  swaps.push({from:'Revenue', to:config.kpiName});

  //add funnel step headers to swaps
  let funnelSteps = config.whereClause.split("AND");
  for(let i=funnelSteps.length-1; i>=0; i--) {  //go in reverse because steps are not zero padded
    let j=i+1;
    swaps.push({from:'StepHeader'+j, to:config.funnelData[i].label});
  }

  //handle campaign
  if(config.campaignActive) {
    swaps.push({from:'PromHeaderStep', to:config.promHeaderStep});
  } else {
    swaps.push({from:'PromHeaderStep', to:"No Active"});
  }
  //handle new feature
  if(config.featureAdded) {
    swaps.push({from:'FeatureHeaderStep', to:config.FeatureHeaderStep});
  } else {
    swaps.push({from:'FeatureHeaderStep', to:"No New Feature"});
  }
  return swaps;
}

function listFunnelDB(config,subs) {
  let list = [];
  let re1= /[fF]unnel([0-9]{1,2})/;
  let re2= /[fF]unnelAnalysisStepAction([0-9]{1,2})/;
  let steps = config.funnelData.length;

  subs.forEach(function(file) {
    let db = file.path;
  //skip unneeded dbs
    if(config.kpi=="n/a" && db.includes("True"))
	    return;
    if(config.kpi!="n/a" && db.includes("False"))
	    return;
    if(db in [dbTO,dbAO,dbFunnelTrue,dbFunnelFalse])
        return;

  //figure out if the funnel db is needed
    let res1 = re1.exec(db);
    let res2 = re2.exec(db);
    if(res1 !==null && res1[1] != steps)
	return;
    if(res2 !==null && res2[1] > steps)
	return;

  //if we're still going, it should be good, add it to the list
    list.push(file);
  });
  return list;
}

function whereClauseSwaps(dbData,config) {
  let whereSteps = config.whereClause.split("AND");
  if(config.campaignActive) { //special handling for Marketing campaign: insert into all Step1s but replace completely on Marketing pages
    if(dbData["dashboardMetadata"]["name"].includes("Marketing"))
        whereSteps[0]="("+config.campaignStep1.colname+"=\""+config.campaignStep1.name+"\") ";
    else
        whereSteps[0]=whereSteps[0].replace(/\) ?$/, " OR "+config.campaignStep1.colname+"=\""+config.campaignStep1.name+"\") ");
  }

  //build FunnelStep
  let FunnelStep="";
  let funnelSteps=[];
  for(let i=0; i<whereSteps.length; i++) {
    funnelSteps.push(whereSteps[i] + " AS \"" + config.funnelData[i].label + "\"");
  }
  FunnelStep=funnelSteps.join(", ");

    dbData["tiles"].forEach(function(t) {
      if(t.tileType=="DTAQL") {
  	if(typeof(t.query) === 'undefined'){console.log("DTAQL w/o query");return;}
    //generic swaps here:
    t.query = t.query.replace(new RegExp("([^t])FunnelStep",'g'),"$1"+FunnelStep);
    t.query = t.query.replace(new RegExp("CombinedStep",'g'),config.whereClause);
    if(config.featureAdded) 
        t.query = t.query.replace(new RegExp("StepNewFeature1",'g'),
            config.StepNewFeature1.colname+'=\"'+config.StepNewFeature1.name+'\"');
    if("compareAppName" in config && config.compareAppName!="None") {
        t.query = t.query.replace(new RegExp("CompareStepFunnel1",'g'),
            config.compareFirstStep.colname+'=\"'+config.compareFirstStep.name+'\"');//V5
        t.query = t.query.replace(new RegExp("CompareStepAction1",'g'),config.compareFirstStep.name);//V4
        t.query = t.query.replace(new RegExp("CompareLastFunnelStep",'g'),
            config.compareLastStep.colname+'=\"'+config.compareLastStep.name+'\"');//V5
        t.query = t.query.replace(new RegExp("CompareLastStep",'g'),config.compareLastStep.name);//V4
    }
    //Step specific swaps
	for(let i=whereSteps.length-1; i>=0; i--) {  //go in reverse because steps are not zero padded
	    let j=i+1;
  	    t.query = t.query.replace(new RegExp('StepFunnel'+j,"g"), whereSteps[i]); //for DashboardsV5
  	    t.query = t.query.replace(new RegExp('useraction.name ?= ?"StepAction'+j+'"',"g"), whereSteps[i]);//V4
  	    t.query = t.query.replace(new RegExp('useraction.name ?!= ?"StepAction'+j+'"',"g"), " NOT " +whereSteps[i]);
  	    t.query = t.query.replace(new RegExp('name ?= ?"?StepAction'+j+'"',"g"), whereSteps[i]);
  	    t.query = t.query.replace(new RegExp('name ?!= ?"StepAction'+j+'"',"g"), " NOT " +whereSteps[i]);
  	    t.query = t.query.replace(new RegExp('Step'+j+'"',"g"), whereSteps[i]); //temp until John fixes V5
	    if(i==whereSteps.length-1) {
  	      t.query = t.query.replace(new RegExp('StepFunnelLast',"g"), whereSteps[i]); //for DashboardsV5
  	      t.query = t.query.replace(new RegExp('LastFunnelStep',"g"), whereSteps[i]); //for DashboardsV5
  	      t.query = t.query.replace(new RegExp('useraction.name ?= ?"LastStep"',"g"), whereSteps[i]);
  	      t.query = t.query.replace(new RegExp('useraction.name ?[iInN]{2} ?\\("LastStep"\\)',"g"), whereSteps[i]);
  	      t.query = t.query.replace(new RegExp('useraction.name ?!= ?"?LastStep"',"g"), " NOT "+whereSteps[i]);
  	      t.query = t.query.replace(new RegExp('name ?= ?"?LastStep"',"g"), whereSteps[i]);
  	      t.query = t.query.replace(new RegExp('name ?!= ?"?LastStep"',"g"), " NOT "+whereSteps[i]);
  	      t.query = t.query.replace(new RegExp('LastStep',"g"), whereSteps[i]); //temp until John fixes V5
	    }
	}
      } else if(t.tileType=="MARKDOWN" && t.markdown.includes("sessionquery")) { //handle URL Encoded queries
	let query = t.markdown.match(/sessionquery=([^&]*)&?/)[1];
	query = decodeURIComponent(query);
	let whereSteps = config.whereClause.split("AND");
	for(let i=whereSteps.length-1; i>=0; i--) {  //go in reverse because steps are not zero padded
	    let j=i+1;
  	    query = query.replace(new RegExp('StepFunnel'+j,"g"), whereSteps[i]); //for DashboardsV5
  	    query = query.replace(new RegExp('useraction.name ?= ?"?StepAction'+j+'"',"g"), whereSteps[i]);
  	    query = query.replace(new RegExp('useraction.name ?!= ?"StepAction'+j+'"',"g"), " NOT " +whereSteps[i]);
  	    query = query.replace(new RegExp('name ?= ?"?StepAction'+j+'"',"g"), whereSteps[i]);
  	    query = query.replace(new RegExp('name ?!= ?"StepAction'+j+'"',"g"), " NOT " +whereSteps[i]);
  	    query = query.replace(new RegExp('Step'+j+'"',"g"), whereSteps[i]); //temp until John fixes V5
	    if(i==whereSteps.length-1) {
  	      query = query.replace(new RegExp('StepFunnelLast',"g"), whereSteps[i]); //for DashboardsV5
  	      query = query.replace(new RegExp('useraction.name ?= ?"LastStep"',"g"), whereSteps[i]);
  	      query = query.replace(new RegExp('useraction.name ?[iInN]{2} ?\\("LastStep"\\)',"g"), whereSteps[i]);
  	      query = query.replace(new RegExp('useraction.name ?!= ?"LastStep"',"g"), " NOT "+whereSteps[i]);
  	      query = query.replace(new RegExp('name ?= ?"LastStep"',"g"), whereSteps[i]);
  	      query = query.replace(new RegExp('name ?!= ?"LastStep"',"g"), " NOT "+whereSteps[i]);
  	      query = query.replace(new RegExp('LastStep',"g"), whereSteps[i]); //temp until John fixes V5
	    }
	}
	query = encodeURIComponent(query);
	t.markdown = t.markdown.replace(/sessionquery=[^&]*&/, "sessionquery="+query+"&");
      }
    });
  //}
}

function updateLinkTile(db,config,re,marker) {
    if( typeof(config.linkTile) === 'undefined' || typeof(config.linkTile.index) === 'undefined') { //linkTile not in config
      let i = findLinkTile(db,marker);
      if(i < db.tiles.length) { //tile already exists
        config.linkTile = { //template found, retain it's bounding box
            bounds: db.tiles[i].bounds
        };
        db["tiles"][i] = createLinkTile(config.linkTile.bounds,re,db.id,marker);
      } else {  //no template tile
        config.linkTile = { //put it at the bottom-left
            bounds:  {
                top:  dbFindBottom(db),
                left: 0,
                width: 332,
                height: 38
            }
        };
      db["tiles"].push(createLinkTile(config.linkTile.bounds,re,db.id,marker));
      }
    } else { //linkTile already known
     let i = config.linkTile.index;
     db["tiles"][i] = createLinkTile(config.linkTile.bounds,re,db.id,marker);
    }
}

function getStaticSubDBs(db,parentids=[""],subs=[]) {
    console.log("getStaticSubDBs from: "+db.id+" (oldid:"+parentids+")");
    db.tiles.forEach(function(t) {
        if(t.tileType=="MARKDOWN") {
            let matches = t.markdown.matchAll(/\(#dashboard;id=([^) ]+)/g);
            for( let m of matches) { 
                let id = m[1];
                if(id != db.id && !parentids.includes(id)) for( let d of dbList) {
                    if(d.file.id === id &&
                       typeof(subs.find( x => x.name === d.name)) == "undefined" ) { //ensure it's not already in the array, note: ids are not unique
                        console.log("getStaticSubDBs: "+id+" => "+d.file.dashboardMetadata.name);
                        subs.push( JSON.parse(JSON.stringify(d))); 
                        //parentids.push(id);
                        getStaticSubDBs(d.file,parentids,subs);
                    }
                }
            }
        }
    });
    return subs;
}

function doSwaps(dbS,swaps) {
    swaps.forEach(function(swap) {
        dbS = dbS.replace(new RegExp(swap.from,"g"), swap.to);
    });
    return dbS;
}

function transformSubs(subs,dbid,swaps) {
  let id = dbid;
  subs.forEach(function(db) {
    sub = db.file
    id = nextDB(id);
    swaps.push({from:sub.id, to:id});
    sub.id=id;
    sub["dashboardMetadata"]["owner"]=owner;
    sub["dashboardMetadata"]["shared"]="true";
    sub["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
    sub["dashboardMetadata"]["sharingDetails"]["published"]="false";
  });

  for(let i=0; i<subs.length; i++) {
    let s = JSON.stringify(subs[i].file);
    subs[i].file = JSON.parse(doSwaps(s,swaps));
  }

  return swaps; //give back the swap list to transform the main db
}

function generateTenantSwapList(config) {
  let swaps = [ 
    {from:config.oldTOid, to:id},
    {from:"TEMPLATE:", to:config.TOname},
    {from:'MyTenant', to:config.TOname},
    {from:'ipClause', to:config.ipClause}
  ];

  return swaps;
}

function generateAppSwapList(config) {
  /*let ipClause = "";
  if("ipUpperBound" in config && "ipLowerBound" in config)
    if(config.ipUpperBound.length>0 && config.ipLowerBound.length>0)
      ipClause = 'AND ip BETWEEN \\"'+config.ipLowerBound+'\\" AND \\"'+config.ipUpperBound+'\\"';*/
    
  let swaps = [
    {from:config.oldTOid, to:config.TOid},
    {from:config.oldAOid, to:config.AOid},
    {from:'https://MyTenant', to:url},
    {from:"MyApp", to:config.appName},
    {from:"MyURLApp", to:encodeURIComponent(config.appName)},
    {from:"InternalAppID", to:config.appID},
    {from:"compareMZid", to:config.compareMZid},
    {from:"compareMZname", to:config.compareMZname},
    {from:'InternalCompareAppID', to:(config.compareAppID==""?config.appID:config.compareAppID)},
    {from:"MyCompareApp", to:(config.compareAppName=="None"?config.appName:config.compareAppName)},
    {from:'-MyCompareTimeh to -MyTimeh', to:config.compareTime},
    {from:'Previous MyTime Hours', to:config.compareTime},
    {from:'-MyTimeh', to:config.MyTime},
    {from:'Last MyTime Hours', to:config.MyTime},
    {from:'ipClause', to:config.ipClause},
    {from:'MZid', to:config.mz},
    {from:'MZname', to:config.mzname}
    ];
  return swaps;
}

function generateFunnelSwapList(config)
{
  var swaps = [
  //NOTE: do NOT do any whereClause manipulation as strings, it makes escaping quotes challenging, do it instead in whereClauseSwaps
    {from:config.oldTOid, to:config.TOid},
    {from:config.oldAOid, to:config.AOid},
    {from:config.oldFOid, to:config.FOid},
    {from:'InternalAppID', to:config.appID},
    {from:'InternalCompareAppID', to:(config.compareAppID==""?config.appID:config.compareAppID)},
    {from:'https://MyTenant', to:url},
    {from:'MyEmail', to:owner},
    {from:'MyFunnel', to:config.funnelName},
    {from:'MyCompareFunnel', to:config.compareFunnel},
    {from:'-MyCompareTimeh to -MyTimeh', to:config.compareTime},
    {from:'Previous MyTime Hours', to:config.compareTime},
    {from:'-MyTimeh', to:config.MyTime},
    {from:'Last MyTime Hours', to:config.MyTime},
    {from:'MyApp', to:config.appName},
    {from:"MyURLApp", to:encodeURIComponent(config.appName)},
    {from:'MyCompareApp', to:(config.compareAppName=="None"?config.appName:config.compareAppName)},
    {from:'Revenue', to:config.kpiName},
    {from:'comparerevenueproperty', to:(typeof config.compareRevenue == "undefined"?
        config.kpi:config.compareRevenue)},
    {from:'revenueproperty', to:config.kpi},
    //{from:'MyFilter', to:config.filterClause},
  ];

  //add funnel step headers to swaps
  //let funnelSteps = config.whereClause.split("AND");
  let funnelSteps = whereSplit(config.whereClause);
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

function whereClauseSwaps(dbData,config) {
  //let whereSteps = config.whereClause.split("AND");
  let whereSteps = whereSplit(config.whereClause);
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
        t.query = t.query.replace(new RegExp("CompareCombinedStep",'g'),
            "("+config.compareFirstStep.colname+"=\""+config.compareFirstStep.name+"\" AND " +
            config.compareLastStep.colname+"=\""+config.compareLastStep.name+"\") "
            ); 
    } else if("xapp_compareAppName1" in config && config.xapp_compareAppName1!="None") {
        t.query = t.query.replace(new RegExp("CompareStepFunnel1",'g'),
            "(useraction.application=\""+config.xapp_compareAppName1+"\" and "+
            config.compareFirstStep.colname+'=\"'+config.compareFirstStep.name+'\")');//V5
        t.query = t.query.replace(new RegExp("CompareLastFunnelStep",'g'),
            "(useraction.application=\""+config.xapp_compareAppName2+"\" and "+
            config.compareLastStep.colname+'=\"'+config.compareLastStep.name+'\")');//V5
        t.query = t.query.replace(new RegExp("CompareCombinedStep",'g'),
            "((useraction.application=\""+config.xapp_compareAppName1+"\" and "+
            config.compareFirstStep.colname+'=\"'+config.compareFirstStep.name+'\") AND '+
            "(useraction.application=\""+config.xapp_compareAppName2+"\" and "+
            config.compareLastStep.colname+'=\"'+config.compareLastStep.name+'\"))');//V5
    } else { //no compare app, default stuff out per Shady
        t.query = t.query.replace(new RegExp("CompareStepFunnel1",'g'), whereSteps[0]);
        t.query = t.query.replace(new RegExp("CompareStepAction1",'g'), whereSteps[0]);
        t.query = t.query.replace(new RegExp("CompareLastFunnelStep",'g'), whereSteps[whereSteps.length-1]);
        t.query = t.query.replace(new RegExp("CompareLastStep",'g'), whereSteps[whereSteps.length-1]);
        t.query = t.query.replace(new RegExp("CompareCombinedStep",'g'),config.whereClause);
    }
    t.query = t.query.replace(new RegExp("([^t])FunnelStep",'g'),"$1"+FunnelStep);
    t.query = t.query.replace(new RegExp("MyFilter",'g'),config.filterClause);
    t.query = t.query.replace(new RegExp("CombinedStep",'g'),config.whereClause);
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
	//let whereSteps = config.whereClause.split("AND");
	let whereSteps = whereSplit(config.whereClause);
    query = query.replace(new RegExp('comparerevenueproperty','g'), (typeof config.compareRevenue == "undefined"?
        config.kpi:config.compareRevenue));   
    query = query.replace(new RegExp('revenueproperty','g'), config.kpi);
    query = query.replace(new RegExp('Revenue','g'), config.kpiName);
    query = query.replace(new RegExp("([^t])FunnelStep",'g'),"$1"+FunnelStep);
    query = query.replace(new RegExp("MyFilter",'g'),config.filterClause);
    query = query.replace(new RegExp("CombinedStep",'g'),config.whereClause);
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
  	      query = query.replace(new RegExp('LastFunnelStep',"g"), whereSteps[i]); //for DashboardsV5
  	      query = query.replace(new RegExp('LastURLStep',"g"), whereSteps[i]); //for DashboardsV5
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

function doSwaps(dbS,swaps) {
    swaps.forEach(function(swap) {
        dbS = dbS.replace(new RegExp(swap.from,"g"), swap.to);
    });
    return dbS;
}

function transformSubs(subs,dbid,swaps,config) {
  let id = dbid;
  config.subids=[];
  subs.forEach(function(db) {
    sub = db.file
    id = nextDB(id);
    swaps.push({from:sub.id, to:id});
    config.subids.push({from:sub.id, to:id});
    sub.id=id;
    sub["dashboardMetadata"]["owner"]=owner;
    sub["dashboardMetadata"]["shared"]="true";
    sub["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
    sub["dashboardMetadata"]["sharingDetails"]["published"]="false";
    sub["dashboardMetadata"]["dashboardFilter"]["managementZone"]= {
      "id": config.mz,
      "name": config.mzname
    };
    if("costControlUserSessionPercentage" in config) addCostControlTile(sub,config);
    addReplaceButton(sub,dbid,"![BackButton]()","⇦",findTopRight);
  });

  for(let i=0; i<subs.length; i++) {
    let s = JSON.stringify(subs[i].file);
    subs[i].file = JSON.parse(doSwaps(s,swaps));
  }

  return swaps; //give back the swap list to transform the main db
}

function whereSplit(where) {
// rely on Steps seperated by "AND", inside step use "and"
/*    let steps = [];
    let matches = {};
    
    matches = where.matchAll(/\([^)]*\)/g);
    for(let i of matches) {
        steps.push(i);
    }
*/
    
    return where.split(' AND ');
}


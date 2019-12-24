//////// Constants //////////////
const configDashboard = "json/configDashboard.json";
const dashboardDir = "json/Dynatrace-DashboardsV4/";
const dbTO = "TenantOverview.json";
const dbAO = "AppOverview.json";
const dbFunnelTrue = "OverviewTrue.json";  
const dbFunnelFalse = "OverviewFalse.json"; 
const dbFunnelList = [
		"AbandonsAnalysisFalse.json",
		"AbandonsAnalysisTrue.json",
		"AppOverviewCompare.json",
		"ConversionAnalysisFFalse.json",
		"ConversionAnalysisFTrue.json",
		"ConversionAnalysisOFalse.json",
		"ConversionAnalysisOTrue.json",
		"DuratioinAnalysisFalse.json",
		"DuratioinAnalysisTrue.json",
		"ErrorAnalysisFalse.json",
		"ErrorAnalysisTrue.json",
		"ExecutiveOverview1False.json",
		"ExecutiveOverview1True.json",
		"ExecutiveOverview2False.json",
		"ExecutiveOverview2True.json",
		"ExecutiveOverview3True.json",
		"Funnel10.json",
		"Funnel11.json",
		"Funnel12.json",
		"Funnel3.json",
		"Funnel4.json",
		"Funnel5.json",
		"Funnel6.json",
		"Funnel7.json",
		"funnel8.json",
		"Funnel9.json",
		"FunnelAnalysisStep10.json",
		"FunnelAnalysisStep11.json",
		"FunnelAnalysisStep1.json",
		"FunnelAnalysisStep2.json",
		"FunnelAnalysisStep3.json",
		"FunnelAnalysisStep4.json",
		"FunnelAnalysisStep5.json",
		"FunnelAnalysisStep6.json",
		"FunnelAnalysisStep7.json",
		"FunnelAnalysisStep8.json",
		"FunnelAnalysisStep9.json",
		"FunnelOverviewFalseCompare.json",
		"FunnelOverviewTrueCompare.json",
		"KeyStore.json",
		"LostRevenueAnalysis.json",
		"MarketingOverview1False.json",
		"MarketingOverview1True.json",
		"MarketingOverview2False.json",
		"MarketingOverview2True.json",
		"MarketingOverview3True.json",
		"Member Analysis.json",
		"NonEngagedAnalysisFalse.json",
		"NonEngagedAnalysisTrue.json",
		"RageAnalysisFalse.json",
		"RageAnalysisTrue.json",
		"RevenueAnalysis.json",
		"RevenueCompare.json",
		"RiskRevenueAnalysis.json"
	];

//////// Global Vars ////////////
var url="";
var token="";
var owner="";
//var apps={};
//var appname="";
//var kpis=[];
//var goals=[];
//var keyActions=[];
//var funnel=[];
//var kpi="";
var DBAdashboards=[];
//var numDBADashboards=0;
var tenantID="";
var selection={};
var funnelData=[];

///////// Functions for manipulating global vars //////////

function processDBADashboards(result) {
  let dbs=[];
  result["dashboards"].forEach(function(dashboard) {
    if(dashboard["id"].substring(0,8)=="bbbbbbbb") {
	dbs.push(dashboard);
    }
  });

  dbs.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
  DBAdashboards=dbs;
  return DBAdashboards;
}

function calcTenantID(url) {
  var managed = /\/e\/([^\/]+)/;
  var res = managed.exec(url)
  if(res)
    return(res[1]);
  var saas = /\/\/([^.]+)/;
  res = saas.exec(url);
  if(res)
    return(res[1]);
  else
    return("MyTenant");
}

function processTestConnect(result) {
  owner=result["userId"];
  tenantID=calcTenantID(url);

  if(!result["scopes"].includes("DTAQLAccess")) alert("Missing DTAQLAccess token scope");
  if(!result["scopes"].includes("WriteConfig")) alert("Missing WriteConfig token scope");
  if(!result["scopes"].includes("ReadConfig")) alert("Missing ReadConfig token scope");
  if(!result["scopes"].includes("DataExport")) alert("Missing DataExport token scope");

}

function processMZs(result) {
  MZs=[];
  result["values"].forEach(function(mz) {
	MZs.push(mz);
  });

  MZs.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase())?1:-1);
}

function nextTO() {
  let nextTO = 1;
  let re = /bbbbbbbb-([0-9]{4})-0000-0000-000000000000/;

  DBAdashboards.forEach(function(dashboard) {
    var resA = re.exec(dashboard.id);
    if(resA) {
	nextTO = Math.max(nextTO,parseInt(resA[1])+1);
    }
  });
  let TO = "bbbbbbbb-"+
	nextTO.toString().padStart(4, '0')+
	"-0000-0000-000000000000";
  return TO; 
}
    
function nextAO(TOid) {
  let nextAO = 1;
  let TO = TOid.split("-")[1];
  let reS = "bbbbbbbb-"+
	TO +
	"-([0-9]{4})-0000-000000000000";
  let re = new RegExp(reS);

  DBAdashboards.forEach(function(dashboard) {
    var resA = re.exec(dashboard.id);
    if(resA) {
	nextAO = Math.max(nextAO,parseInt(resA[1])+1);
    }
  });
  let AO = "bbbbbbbb-"+ TO + "-" +
	nextAO.toString().padStart(4, '0')+
	"-0000-000000000000";
  return AO; 
}

function nextFO(AOid) {
  let nextFO = 1;
  let AO = AOid.substring(0,19)
  let reS = AO +
	"([0-9]{4})-000000000000";
  let re = new RegExp(reS);

  DBAdashboards.forEach(function(dashboard) {
    var resA = re.exec(dashboard.id);
    if(resA) {
	nextFO = Math.max(nextFO,parseInt(resA[1])+1);
    }
  });
  let FO = AO +
	nextFO.toString().padStart(4, '0')+
	"-000000000000";
  return FO; 
}

function nextFunnel(id) {
  let dbNum = parseInt(id.split("-")[4])+1;
  let newID = id.substring(0,24) + dbNum.toString().padStart(12, '0');
  return newID;
}

function configID(id) {
  return (id.substr(0,id.length-12) + "ffffffffffff");
}

function parseConfigDashboard(db) {
  let markdown = "";
  db["tiles"].forEach(function(tile) {
    markdown += tile["markdown"];
  });
  return JSON.parse(markdown);
}

function parseKPIs(result) {
  var kpis=[];
  var kpiNames=[];

	//Do ugly parsing here...
  result["values"].forEach(function(row) {
    for(let col=0; col<result["columnNames"].length; col++) {
      row[col].forEach(function(val) {
        if(val.hasOwnProperty("key")) {
          let key = val["key"];
          if(kpiNames.indexOf(key) == -1) {
            kpiNames.push(key);
            kpis.push({type: result["columnNames"][col], key: key});
          }
        }
      });
    }
  });
	/*result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
	    val2.forEach(function(val3) {
		if(val3.hasOwnProperty("key")) {
		  //console.log("key: "+ val[0][0]["key"]);
		  if(kpis.indexOf(val3["key"]) == -1) kpis.push(val3["key"]);
		}
	    });
	  })
	});*/
  return kpis;
}

function parseGoals(result) {
  var goals = [];
  //parse goals
	result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
		  //console.log("key: "+ val[0][0]["key"]);
		  if(goals.indexOf(val2) == -1) goals.push(val2);
	    });
	  });
  return {goals:goals,type:"useraction.matchingConversionGoals"};          
}

function parseKeyActions(result) {
  var keyActions = [];
  //parse keyActions
	result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
		  if(keyActions.indexOf(val2) == -1) keyActions.push(val2);
	    });
	  });
    //jsonviewer(result,false,"","#jsonviewer2");
  return {goals:keyActions,type:"useraction.name"};
}

function generateSwapList(config)
{
  var swaps = [];

  swaps.push({from:config.oldTOid, to:config.TOid});
  swaps.push({from:config.oldAOid, to:config.AOid});
  swaps.push({from:config.oldFOid, to:config.FOid});
  swaps.push({from:'InternalAppID', to:config.appID});
  swaps.push({from:'InternalCompareAppID', to:config.compareAppID});
  swaps.push({from:'MyTenant', to:tenantID});
  swaps.push({from:'MyEmail', to:owner});
  swaps.push({from:'MyFunnel', to:config.funnelName});
  swaps.push({from:'MyCompareFunnel', to:config.compareFunnel});   //Don't really understand this one
  swaps.push({from:'MyTime', to:"2"});                          //What's this for?
  swaps.push({from:'MyCompareTime', to:config.compareTime});
  swaps.push({from:'MyApp', to:config.appName});
  swaps.push({from:'MyCompareApp', to:config.compareAppName});
  swaps.push({from:'PromHeaderStep', to:"No Active"});          //What do we do with this?
  swaps.push({from:'comparerevenueproperty', to:config.kpi});   //Guess we need to pick the KPI from compare app...
  swaps.push({from:'revenueproperty', to:config.kpi});
  swaps.push({from:'Revenue', to:config.kpiName});

  //add funnel steps to swaps
  for(let i=config.funnelData.length-1; i>=0; i--) {  //go in reverse because steps are not zero padded
    swaps.push({from:'Step'+i, to:config.funnelData[i].value});
    swaps.push({from:'22Step'+i, to:encodeURI(config.funnelData[i].value)});
    swaps.push({from:'StepHeader'+i, to:config.funnelData[i].label});
    if(i==config.funnelData.length-1) {
      swaps.push({from:'LastStep', to:config.funnelData[i].value});
      swaps.push({from:'22LastStep', to:encodeURI(config.funnelData[i].value)});
      swaps.push({from:'CompareLastStep', to:config.funnelData[i].label});
    }
  }

  return swaps;
}

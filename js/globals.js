//////// Constants //////////////
const configDashboard = "json/configDashboard.json";
//var dashboardDir = "json/Dynatrace-DashboardsV4/";
const dbTO = "TenantOverview.json";
const dbAO = "AppOverview.json";
const dbFunnelTrue = "OverviewTrue.json";  
const dbFunnelFalse = "OverviewFalse.json"; 
const timeTable = [
    {MyTime: "Last 30 minutes", MyCompareTimes: ["Last 30 minutes", "-60m to -30m", "-2h30m to -2h", "-24h-30m to -24h", "-7d-30m to -7d"]},
    {MyTime: "Last 2 hours", MyCompareTimes: ["Last 2 hours","-4h to -2h", "-24h-2h to -24h", "-7d-2h to -7d"]},
    {MyTime: "Today", MyCompareTimes: ["Today","Yesterday","now/d-7d to now-7d"]},
    {MyTime: "Yesterday", MyCompareTimes: ["Yesterday","now/d-8d to now/d-7d"]},
    {MyTime: "Last 24 hours", MyCompareTimes: ["Last 24 hours", "-48h to -24h", "-8d to -7d"]},
    {MyTime: "Last 72 hours", MyCompareTimes: ["Last 72 hours", "-144h to -72h", "-7d-72h to -7d"]},
    {Mytime: "Last 7 days", MyCompareTimes: ["Last 7 days", "-14d to -7d"]}
    ];
//////// Global Vars ////////////
var url="";
var token="";
var owner="";
var version = "";
var dbList = [];
var DBAdashboards=[];
var tenantID="";
var selection={};
    selection.config={};
var funnelData=[];
var v5test=true; //opposite of this
var popup_p={};
var Regions=[];

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
  let res = true;
  let e = "Missing DT API token scopes: ";
  let missingScopes = [];

  if(!result["scopes"].includes("DTAQLAccess")){
    res=false;
    missingScopes.push("User Sessions");
  }
  if(!result["scopes"].includes("WriteConfig")){
    res=false;
    missingScopes.push("Write Configuration");
  }
  if(!result["scopes"].includes("ReadConfig")){
    res=false;
    missingScopes.push("Write Configuration");
  }
  if(!result["scopes"].includes("DataExport")){
    res=false;
    missingScopes.push("Access problem, event, metric, topo...");
  }

  if(!res)
    errorbox(e + missingScopes.join(', '));
  return res;
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
  return kpis;
}

function parseUSPFilter(result) {
  USPs={}; //eg {typeA: {key1: ['val1','val2'], key2: ['val1','val2']}}

  for(let col=0; col<result["columnNames"].length; col++) { //build types first
    let colname = result["columnNames"][col];
    USPs[colname] = {};
  }
  result["values"].forEach(function(i) {
    for(let col=0; col<result["columnNames"].length; col++) {
        if(typeof(i[col][0])=="undefined")continue; //skip blanks
        let colname = result["columnNames"][col];
        let key = i[col][0].key;
        let value = i[col][0].value;
        if(! (key in USPs[colname])) USPs[colname][key]=[value]; //new key
        else if(USPs[colname][key].indexOf(value)<0) USPs[colname][key].push(value); //add only new values
    }
  });
  return USPs;
}

function parseAppDetail(result) {
  let appdetail = result;
  return appdetail;
}

function parseRegions(result) {
  Regions = [];

  result["values"].forEach(function(val) {
    let region={};
    let colname = "";
    for(let col=0; col<result["columnNames"].length; col++) {
        colname = result["columnNames"][col];
        region[colname] = val[col];
    }
    Regions.push(region);
  });
  return Regions;
}

function parseGoals(result) {
  var goals = [];
  //parse goals
	result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
		  val2 = val2.replace( /([^"])"([^"])?/g, "$1\"\"$2"); //escape janky doublequotes
		  //console.log("key: "+ val[0][0]["key"]);
		  if(goals.indexOf(val2) == -1) goals.push(val2);
	    });
	  });
  goals.sort();
  return {goals:goals,type:"useraction.matchingConversionGoals"};          
}

function parseKeyActions(result) {
  var keyActions = [];
  //parse keyActions
	result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
		  val2 = val2.replace( /([^"])"([^"])?/g, "$1\"\"$2"); //escape janky doublequotes
		  if(keyActions.indexOf(val2) == -1) keyActions.push(val2);
	    });
	  });
  keyActions.sort();
    //jsonviewer(result,false,"","#jsonviewer2");
  return {goals:keyActions,type:"useraction.name"};
}

function parseSteps(result) {
  var keys = [];
  var steps = [];
  var type = 'useraction.' + result.columnNames[1];
  //parse keyActions
	result["values"].forEach(function(val) {
	  //val.forEach(function(val2) {
		  var val2 = val[1].replace( /([^"])"([^"])?/g, "$1\"\"$2"); //escape janky doublequotes
		  if(keys.indexOf(val2) == -1) {
            keys.push(val2);
            steps.push({'appName':val[0],'step':val2});
          }
	  //  });
	  });
  steps.sort((a,b) => (a.step.toLowerCase() > b.step.toLowerCase())?1:-1);
    //jsonviewer(result,false,"","#jsonviewer2");
  return {'steps':steps,'type':type};
}

function loadDBList(p) {
    let i = p;//(v5test?1:0);
    return $.when(p).then(function() {
        let p1 = getRepoContents(repoList[i]);
        return $.when(p1).then(function(data) {
            dbList=parseRepoContents(data);
        });
    });
}

function processVersion(p) {
   return $.when(p).then(function(data) {
        version = parseInt(data.version.split(".")[1]);
        if(version >= 183)
            v5test=true;
        else
            v5test=false;
        
        //loadDBList( (v5test?1:0) );
        return(v5test?1:0);
    }); 
}

function downloadDBsFromList() { 
    let promises = [];

    dbList.forEach(function(file,index,arr) {
        let p = $.get(file.download_url)
            .fail(errorboxJQXHR)
            .done(function(d) {
                try {
                  file.file = JSON.parse(d);
                } catch(e) {
                  let emsg = "JSON Error on file "+file.path+". "+e.name+": "+e.message;
                  errorbox(emsg);
                  arr.splice(index,1);
                }
            });
        promises.push(p);
    });
    return promises;
}

function nextDB(id){
    let s = id.substring(0,24);
    let re = new RegExp(s+"([0-9]{8})$");
    let i = parseInt(id.substring(24))+1;

    DBAdashboards.forEach(function(d) {
        var res = re.exec(d);
        if(res) i = Math.max(i,parseInt(res[1])+1);
    });

    return s + i.toString().padStart(12, '0');
}


//////// Constants //////////////
const configDashboard = "json/configDashboard.json";
//var dashboardDir = "json/Dynatrace-DashboardsV4/";
const dbTO = "TenantOverview.json";
const dbAO = "AppOverview.json";
const dbFunnelTrue = "OverviewTrue.json";  
const dbFunnelFalse = "OverviewFalse.json"; 

//////// Global Vars ////////////
var url="";
var token="";
var owner="";
var version = "";
var dbFunnelList = [];
var DBAdashboards=[];
var tenantID="";
var selection={};
var funnelData=[];
var v5test=true; //opposite of this

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
  return kpis;
}

function parseGoals(result) {
  var goals = [];
  //parse goals
	result["values"].forEach(function(val) {
	  val.forEach(function(val2) {
		  val2 = val2.replace( /([^"])"([^"])/g, "$1\"\"$2"); //escape janky doublequotes
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
		  val2 = val2.replace( /([^"])"([^"])/g, "$1\"\"$2"); //escape janky doublequotes
		  if(keyActions.indexOf(val2) == -1) keyActions.push(val2);
	    });
	  });
  keyActions.sort();
    //jsonviewer(result,false,"","#jsonviewer2");
  return {goals:keyActions,type:"useraction.name"};
}

function loadDBList(i=0) {
    let p1 = getRepoContents(repoList[i]);
    $.when(p1).done(function(data) {
        dbFunnelList=parseRepoContents(data);
    })
}

function processVersion(p) {
   $.when(p).done(function(data) {
        version = parseInt(data.version.split(".")[1]);
        if(version >= 183)
            v5test=true;
        else
            v5test=false;
        
        loadDBList( (v5test?1:0) );
    }); 
}

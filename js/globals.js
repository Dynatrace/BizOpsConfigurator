/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
//////// Constants //////////////
var configDashboard = "json/configDashboard.json";
const REpersonaWorkflow = /^bbbbbbbb-a[0-9]{3}-a[0-9]{3}-[0]{4}-[0-9]{12}$/;
const unique = (value, index, self) => self.indexOf(value) === index;
const statusFilter = (x) => x.file.config.workflowStatus === undefined
  || x.file.config.workflowStatus === "GA"
  || x.file.config.workflowStatus === "Early Adopter"
  || (x.file.config.workflowStatus === "Preview" && PreviewWorkflows)
  || (x.file.config.workflowStatus === "Testing" && PreviewWorkflows && InternalTenant);

//var dashboardDir = "json/Dynatrace-DashboardsV4/";
var dbTO = "TenantOverview.json";
var dbAO = "AppOverview.json";
var dbFunnelTrue = "OverviewTrue.json";
var dbFunnelFalse = "OverviewFalse.json";
var oldVersion = 183;
var dbTagsVersion = 190;
var USQLlimit = 5000;
var personaFlow = true;
const timeTable = [
  { MyTime: "Last 30 minutes", MyCompareTimes: ["Last 30 minutes", "-60m to -30m", "-2h30m to -2h", "-24h-30m to -24h", "-7d-30m to -7d"] },
  { MyTime: "Last 2 hours", MyCompareTimes: ["Last 2 hours", "-4h to -2h", "-24h-2h to -24h", "-7d-2h to -7d"] },
  { MyTime: "Today", MyCompareTimes: ["Today", "Yesterday", "now/d-7d to now-7d"] },
  { MyTime: "Yesterday", MyCompareTimes: ["Yesterday", "now/d-8d to now/d-7d"] },
  { MyTime: "Last 24 hours", MyCompareTimes: ["Last 24 hours", "-48h to -24h", "-8d to -7d"] },
  { MyTime: "Last 72 hours", MyCompareTimes: ["Last 72 hours", "-144h to -72h", "-7d-72h to -7d"] },
  { Mytime: "Last 7 days", MyCompareTimes: ["Last 7 days", "-14d to -7d"] }
];
var githubuser = "";
var githubpat = "";
var repoList = [
  { 'owner': 'TechShady', 'repo': 'Dynatrace-DashboardV5', 'path': '' },
  { 'owner': 'TechShady', 'repo': 'Dynatrace-Dashboards', 'path': '' },
  { 'owner': 'TechShady', 'repo': 'Dynatrace-Remote-Employee', 'path': '' },
  { 'owner': 'TechShady', 'repo': 'Dynatrace-Infrastructure', 'path': '' },
  { 'owner': 'TechShady', 'repo': 'BizOpsLite', 'path': '' },
  { 'owner': 'TechShady', 'repo': 'Dynatrace-Marketing-Dashboards', 'path': '' },
  { 'owner': 'LucasHocker', 'repo': 'DashboardTemplates', 'path': 'v1.192.96' },
  { 'owner': 'LucasHocker', 'repo': 'DashboardTemplates', 'path': '' },
  { 'owner': 'Dynatrace-JasonOstroski', 'repo': 'CitrixDynatraceDashboards', 'path': '' },
  { 'owner': 'jjbologna', 'repo': 'SAP-extension-dashboards', 'path': '' },
  { 'owner': 'popecruzdt', 'repo': 'dt-kubernetes-config', 'path': '' },
  { 'owner': 'mcaminiti', 'repo': 'dynatrace-dashboards-dem-usage', 'path': '' },
  { 'owner': 'sergiohinojosa', 'repo': 'dashboards-dt-kubernetes', 'path': '' }
];
var tenantOverviews = [
  { name: 'BizOps', filename: 'TenantOverview.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-DashboardV5', 'path': '' } },
  { name: 'BizOpsLite', filename: 'LiteTenantOverview.json', repo: { 'owner': 'TechShady', 'repo': 'BizOpsLite', 'path': '' } },
  { name: 'Dashboard Basics', filename: '00000000-dddd-bbbb-ffff-000000000001', repo: { 'owner': 'LucasHocker', 'repo': 'DashboardTemplates', 'path': 'v1.192.96' } },
  { name: 'SAP Extension', filename: 'SAP Application Cockpit.json', repo: { 'owner': 'jjbologna', 'repo': 'SAP-extension-dashboards', 'path': '' } },
  { name: 'Remote Employee Web', filename: 'RETenantOverview.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-Remote-Employee', 'path': '' } },
  { name: 'Remote Employee Mobile', filename: 'RETenantOverview2.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-Remote-Employee', 'path': '' } },
  { name: 'Infrastructure', filename: 'InfrastructureOverview.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-Infrastructure', 'path': '' } },
  { name: 'K8s', filename: '1-overview.json', repo: { 'owner': 'sergiohinojosa', 'repo': 'dashboards-dt-kubernetes', 'path': '' } }
];
var appOverviews = [
  { name: 'WebApp', filename: 'AppOverview.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-DashboardV5', 'path': '' } },
  { name: 'BizOpsLite', filename: 'LiteAppOverview.json', repo: { 'owner': 'TechShady', 'repo': 'BizOpsLite', 'path': '' } },
  { name: 'Citrix (New)', filename: 'CitrixOverview.json', repo: { 'owner': 'Dynatrace-JasonOstroski', 'repo': 'CitrixDashboardsV1', 'path': '' } },
  { name: 'Remote Employee Web (preview)', filename: 'REApplicationOverview.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-Remote-Employee', 'path': '' } },
  { name: 'Remote Employee Mobile (preview)', filename: 'REApplicationOverview2.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-Remote-Employee', 'path': '' } }
];
var journeyOverviews = [
  { name: 'UserJourney (w/ KPI)', filename: 'OverviewTrue.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-DashboardV5', 'path': '' } },
  { name: 'UserJourney (w/o KPI)', filename: 'OverviewFalse.json', repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-DashboardV5', 'path': '' } },
  { name: 'LiteUserJourney (w/ KPI)', filename: 'LiteOverviewTrue.json', repo: { 'owner': 'TechShady', 'repo': 'BizOpsLite', 'path': '' } },
  { name: 'LiteUserJourney (w/o KPI)', filename: 'LiteOverviewFalse.json', repo: { 'owner': 'TechShady', 'repo': 'BizOpsLite', 'path': '' } }
];
var personas = [
  { name: "Ops", prefix: "a001" },
  { name: "Dev", prefix: "a002" },
  { name: "App Owner", prefix: "a003" },
  { name: "Digital Marketer", prefix: "a006" },
  { name: "IT Exec", prefix: "a004" },
  { name: "Dynatrace Admin", prefix: "a005" },
  { name: "Line of Business", prefix: "a007" }
];
var usecases = [
  { name: "User Journey", bizAnalytics: true, prefix: "a001" },
  { name: "Release Validation", bizAnalytics: true, prefix: "a002" },
  { name: "Marketing Analysis", bizAnalytics: true, prefix: "a003" },
  { name: "Search Overview", bizAnalytics: true, prefix: "a004" },
  { name: "A/B Testing", bizAnalytics: true, prefix: "a005" },
  { name: "Incident Response", bizAnalytics: false, prefix: "a006" },
  { name: "Dynatrace Extension", bizAnalytics: false, prefix: "a007" },
  { name: "Platform Overview", bizAnalytics: false, prefix: "a008" },
  { name: "Remote Employee Overview", bizAnalytics: false, prefix: "a009" },
  { name: "Capacity Management", bizAnalytics: false, prefix: "a010" },
  { name: "Billing Analysis", bizAnalytics: false, prefix: "a011" },
  { name: "Marketing Campaign", bizAnalytics: true, prefix: "a012" },
  { name: "AIOps", bizAnalytics: false, prefix: "a013" },
  { name: "Site Reliability Engineering (SRE)", bizAnalytics: false, prefix: "a014" },
  { name: "Software Suite (COTS)", bizAnalytics: false, prefix: "a015" },
  { name: "Industry Vertical", bizAnalytics: true, prefix: "a016" },
  { name: "Application Overview", bizAnalytics: true, prefix: "a017" }
];
//////// Global Vars ////////////
var url = "";
var token = "";
var owner = "";
var version = "";
var dbList = [];
var readmeList = [];
var workflowList = [
  //{ name: "Test Workflow", repo: { 'owner': 'TechShady', 'repo': 'Dynatrace-DashboardV5', 'path': '' } }
];
var DBAdashboards = [];
var personaDBs = [];
var tenantID = "";
var selection = {};
selection.config = {};
var funnelData = [];
var v5test = true; //mark for deletion
var popup_p = {};
var USPs = {};
var Regions = [];
var autoTags = [];
var MZs = [];
var HUreport = { url: "", data: {} };
var popupZindex = 0;
var bcBuffer = "";
var GithubRemaining = 1;
var GithubReset = 9999999999;
var ConfigPushers = [];
var Idxdb = {
  name: "BizOpsConfigurator",
  version: 1,
  db: null
}
var PreviewWorkflows = false;
var InternalTenant = false;
var OfflineMode = false;
var JourneyPickers = [];


///////// Functions for manipulating global vars //////////

function processDBADashboards(result) {
  let dbs = [];
  let pDBs = [];
  result["dashboards"].forEach(function (dashboard) {
    if (dashboard["id"].substring(0, 8) == "bbbbbbbb") { //old style DBs
      dbs.push(dashboard);
    }
    if (dashboard['id'].match(REpersonaWorkflow)) { //new persona style DBs
      pDBs.push(dashboard);
    }
  });

  dbs.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
  DBAdashboards = dbs;

  pDBs.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
  personaDBs = pDBs;

  return DBAdashboards;
}

function calcTenantID(url) {
  var managed = /\/e\/([^\/]+)/;
  var res = managed.exec(url)
  if (res)
    return (res[1]);
  var saas = /\/\/([^.]+)/;
  res = saas.exec(url);
  if (res)
    return (res[1]);
  else
    return ("MyTenant");
}

function processTestConnect(result) {
  owner = result["userId"];
  tenantID = calcTenantID(url);
  let res = true;
  let e = "Missing DT API token scopes (<a href='#helpPopup/scopes' class='helpPopup hashHandled'>Help</a>): ";
  let missingScopes = [];

  if (!result["scopes"].includes("DTAQLAccess")) {
    res = false;
    missingScopes.push("User Sessions");
  }
  if (!result["scopes"].includes("WriteConfig")) {
    res = false;
    missingScopes.push("Write Configuration");
  }
  if (!result["scopes"].includes("ReadConfig")) {
    res = false;
    missingScopes.push("Write Configuration");
  }
  if (!result["scopes"].includes("DataExport")) {
    res = false;
    missingScopes.push("Access problem, event, metric, topo...");
  }

  if (!res)
    errorbox(e + missingScopes.join(', '));
  return res;
}

function processMZs(result) {
  MZs = [];
  result["values"].forEach(function (mz) {
    MZs.push(mz);
  });

  MZs.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
}

function nextTO() {
  let nextTO = 1;
  let re = /bbbbbbbb-([0-9]{4})-0000-0000-000000000000/;

  DBAdashboards.forEach(function (dashboard) {
    var resA = re.exec(dashboard.id);
    if (resA) {
      nextTO = Math.max(nextTO, parseInt(resA[1]) + 1);
    }
  });
  let TO = "bbbbbbbb-" +
    nextTO.toString().padStart(4, '0') +
    "-0000-0000-000000000000";
  return TO;
}

function nextAO(TOid) {
  let nextAO = 1;
  let TO = TOid.split("-")[1];
  let reS = "bbbbbbbb-" +
    TO +
    "-([0-9]{4})-0000-000000000000";
  let re = new RegExp(reS);

  DBAdashboards.forEach(function (dashboard) {
    var resA = re.exec(dashboard.id);
    if (resA) {
      nextAO = Math.max(nextAO, parseInt(resA[1]) + 1);
    }
  });
  let AO = "bbbbbbbb-" + TO + "-" +
    nextAO.toString().padStart(4, '0') +
    "-0000-000000000000";
  return AO;
}

function nextFO(AOid) {
  let nextFO = 1;
  let AO = AOid.substring(0, 19)
  let reS = AO +
    "([0-9]{4})-000000000000";
  let re = new RegExp(reS);

  DBAdashboards.forEach(function (dashboard) {
    var resA = re.exec(dashboard.id);
    if (resA) {
      nextFO = Math.max(nextFO, parseInt(resA[1]) + 1);
    }
  });
  let FO = AO +
    nextFO.toString().padStart(4, '0') +
    "-000000000000";
  return FO;
}

function nextFunnel(id) {
  let dbNum = parseInt(id.split("-")[4]) + 1;
  let newID = id.substring(0, 24) + dbNum.toString().padStart(12, '0');
  return newID;
}

function configID(id) {
  return (id.substr(0, id.length - 12) + "ffffffffffff");
}

function parseConfigDashboard(db) {
  let markdown = "";
  db["tiles"].forEach(function (tile) {
    markdown += tile["markdown"];
  });
  return JSON.parse(markdown);
}

function parseKPIs(result) {
  var kpis = [];
  var kpiNames = [];

  //Do ugly parsing here...
  result["values"].forEach(function (row) {
    for (let col = 0; col < result["columnNames"].length; col++) {
      row[col].forEach(function (val) {
        if (val.hasOwnProperty("key")) {
          let key = val["key"];
          if (kpiNames.indexOf(key) == -1) {
            kpiNames.push(key);
            kpis.push({ type: result["columnNames"][col], key: key });
          }
        }
      });
    }
  });

  return kpis.sort((a, b) => a.key.toLowerCase() > b.key.toLowerCase() ? 1 : -1);
}

function parseUSPFilter(result) {
  USPs = {}; //eg {typeA: {key1: ['val1','val2'], key2: ['val1','val2']}}

  for (let col = 0; col < result["columnNames"].length; col++) { //build types first
    let colname = result["columnNames"][col];
    USPs[colname] = {};
  }
  result["values"].forEach(function (row) {
    for (let col = 0; col < result["columnNames"].length; col++) {
      if (typeof (row[col][0]) == "undefined") continue; //skip blanks
      let colname = result["columnNames"][col];
      for (let keyIdx = 0; keyIdx < row[col].length; keyIdx++) {
        let key = row[col][keyIdx].key;
        let value = row[col][keyIdx].value;
        if (!(key in USPs[colname])) USPs[colname][key] = [value]; //new key
        else if (USPs[colname][key].indexOf(value) < 0) USPs[colname][key].push(value); //add only new values
      }
    }
  });
  return USPs; //also Global
}

function parseAppDetail(result) {
  let appdetail = result;
  return appdetail;
}

function parseRegions(result) {
  Regions = [];

  result["values"].forEach(function (val) {
    let region = {};
    let colname = "";
    for (let col = 0; col < result["columnNames"].length; col++) {
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
  result["values"].forEach(function (val) {
    val.forEach(function (val2) {
      val2 = val2.replace(/([^"])"([^"])?/g, "$1\"\"$2"); //escape janky doublequotes
      //console.log("key: "+ val[0][0]["key"]);
      if (goals.indexOf(val2) == -1) goals.push(val2);
    });
  });
  goals.sort();
  return { goals: goals, type: "useraction.matchingConversionGoals" };
}

function parseKeyActions(result) {
  var keyActions = [];
  //parse keyActions
  result["values"].forEach(function (val) {
    //val.forEach(function(val2) {
    let val2 = val[1].replace(/([^"])"([^"])?/g, "$1\"\"$2"); //escape janky doublequotes
    if (keyActions.indexOf(val2) == -1) keyActions.push(val2);
  });
  //});
  keyActions.sort();
  //jsonviewer(result,false,"","#jsonviewer2");
  return { goals: keyActions, type: "useraction.name" };
}

function parseSteps(result) {
  var keys = [];
  var steps = [];
  var type = 'useraction.' + result.columnNames[1];
  //parse keyActions
  result["values"].forEach(function (val) {
    //val.forEach(function(val2) {
    var val2 = val[1].replace(/([^"])"([^"])?/g, "$1\"\"$2"); //escape janky doublequotes
    if (keys.indexOf(val2) == -1) {
      keys.push(val2);
      steps.push({ 'appName': val[0], 'step': val2 });
    }
    //  });
  });
  steps.sort((a, b) => (a.step.toLowerCase() > b.step.toLowerCase()) ? 1 : -1);
  //jsonviewer(result,false,"","#jsonviewer2");
  return { 'steps': steps, 'type': type };
}

function loadGithubRepos(p = 1) {
  let i = p;//(v5test?1:0);
  let deferreds = [];
  let main = $.Deferred();
  if (p.promise) deferreds.push(p);
  $.when(p).then(function () {  // we should have been passed a deferred
    let old = { dbList: dbList, readmeList: readmeList, workflowList: workflowList };
    dbList = [];
    readmeList = [];
    workflowList = [];

    for (i = 0; i < repoList.length; i++) {
      let repo = repoList[i];
      let p_i = getRepoContents(repo);
      deferreds.push(p_i);
      $.when(p_i).done(function (data_i) {
        let result = parseRepoContents(data_i, repo, old)
        dbList = dbList.concat(result.dbList);
        readmeList = readmeList.concat(result.readmeList);
        workflowList = workflowList.concat(result.workflowList);
      });
    }

    $.when.apply($, deferreds).done(function () {
      main.resolve();
      updateDashboardButton();
    });
  });
  return main
}

function processVersion(p) {
  return $.when(p).then(function (data) {
    version = parseInt(data.version.split(".")[1]);
    if (version >= oldVersion)
      v5test = true;
    else
      v5test = false;

    //loadGithubRepos( (v5test?1:0) );
    return (v5test ? 1 : 0);
  });
}

function downloadDBsFromList() {
  let promises = [];

  dbList.forEach(function (file, index, arr) {
    if (typeof file.file == "undefined" || file.file == null) {
      let p = $.get(file.download_url)
        .fail(errorboxJQXHR)
        .done(function (d) {
          try {
            file.file = JSON.parse(d);
          } catch (e) {
            let emsg = "JSON Error on file " + file.path + ". " + e.name + ": " + e.message;
            errorbox(emsg);
            arr.splice(index, 1);
          }
        });
      promises.push(p);
    }
  });
  $.when.apply($, promises).done(function () {

  });
  return promises;
}

function downloadReadmesFromList() {
  let promises = [];

  readmeList.forEach(function (file, index, arr) {
    if (typeof file.file == "undefined" || file.file == null) {
      let p = $.get(file.download_url)
        .fail(errorboxJQXHR)
        .done(function (d) {
          try {
            var converter = new showdown.Converter();
            let html = converter.makeHtml(d);
            file.html = html.replace(/<img ([^>]*)src="(?!http)([^"]+)"([^>]*)>/g,
              `<img $1src="https://github.com/${file.repo.owner}/${file.repo.repo}/raw/master/$2"$3>`);
          } catch (e) {
            let emsg = "Showdown Error on file " + file.path + ". " + e.name + ": " + e.message;
            errorbox(emsg);
            arr.splice(index, 1);
          }
        });
      promises.push(p);
    }
  });
  $.when.apply($, promises).done(function () {

  });
}

function downloadWorkflowsFromList() {
  let promises = [];

  workflowList.forEach(function (file, index, arr) {
    if (typeof file.file == "undefined" || file.file == null) {
      let p = $.get(file.download_url)
        .fail(errorboxJQXHR)
        .done(function (d) {
          try {
            file.file = JSON.parse(d);
          } catch (e) {
            let emsg = "JSON Error on file " + file.path + ". " + e.name + ": " + e.message;
            errorbox(emsg);
            arr.splice(index, 1);
          }
        });
      promises.push(p);
    }
  });
  $.when.apply($, promises).done(function () {

  });
}

function nextDB(id) {
  let s = id.substring(0, 24);
  let re = new RegExp(s + "([0-9]{8})$");
  let i = parseInt(id.substring(24)) + 1;

  DBAdashboards.forEach(function (d) {
    var res = re.exec(d);
    if (res) i = Math.max(i, parseInt(res[1]) + 1);
  });

  return s + i.toString().padStart(12, '0');
}

function parseAutoTags(data) {
  autoTags = data.values;
}

function findOverviewREADME(overview) {
  let overviewRepo = dbList.find(({ name }) => name === overview).repo; //get the repo directly from the select in next iteration
  let readme = readmeList.find(({ repo }) => repo.owner === overviewRepo.owner &&
    repo.repo === overviewRepo.repo);

  return readme;
}

function findWorkflowReadme(workflow) {
  if (typeof workflow != "undefined" &&
    typeof workflow.file != "undefined" &&
    typeof workflow.file.config != "undefined") {
    let config = workflow.file.config;
    let readme = workflow.repo.path.length > 0 ? `${workflow.repo.path}/${config.readme}` : config.readme;
    let readmeFile = readmeList.find((el) => el.repo.owner === workflow.repo.owner &&
      el.repo.repo === workflow.repo.repo && el.path === readme);

    return readmeFile;
  }
  else return;
}

var sanitizer = {};
(function ($) {
  function trimAttributes(node) {
    $.each(node.attributes, function () {
      var attrName = this.name;
      var attrValue = this.value;

      if (attrName == "" ||
        attrName.indexOf('on') == 0 || attrValue.indexOf('javascript:') == 0) {
        $(node).removeAttr(attrName);
      }
    });
  }

  function sanitize(html) {
    var output = $($.parseHTML('<div>' + html + '</div>', null, false));
    output.find('*').each(function () {
      trimAttributes(this);
    });
    return output.html();
  }
  sanitizer.sanitize = sanitize;
})(jQuery);

function nextWorkflowOverview(persona, usecase) {
  //"bbbbbbbb-a463-0001-0000-ffffffffffff"
  //bbbbbbbb - Configurator dashboard
  //aXXX - persona prefix
  //0001 - usecase prefix
  //0000 - dashboard number 0000 for overview, ffff for config
  //0000000000000 - deployment number

  const reducer = (acc, val) => Math.max(acc, val);
  let maxDeployment = DBAdashboards
    .map(el => el.id)
    .filter((id) => id.match(REpersonaWorkflow))
    .map(id => id.slice(-12))
    .reduce(reducer, 0);

  let newDeployment = (maxDeployment + 1).toString().padStart(12, "0");
  let newID = `bbbbbbbb-${persona}-${usecase}-0000-${newDeployment}`;
  return newID;
}

function nextWorkflowDBID(id) {
  let parts = id.split("-");
  let newID = parseInt(parts[3]) + 1;
  parts[3] = newID.toString().padStart(4, "0");
  return parts.join("-");
}

function workflowConfigID(id) {
  let parts = id.split("-");
  parts[3] = "ffff";
  return parts.join("-");
}

function stringifyWithValues(selector) {
  let $obj = $(selector);
  let $clone = $obj.clone(true);

  //copy values
  $clone.find("input").each(function () {
    $(this).attr('value', $(this).val());
  });
  $clone.find("select").each(function () {
    $(this).find('option:selected').attr('selected', 'selected');
  });
  let html = $clone.wrap("<div></div>").parent().html();
  html = html.replace(/^ +/gm, "");
  html = html.replace(/\n/g, "");

  return html;
}

function loadBackupCSSIfNotLoaded(search, backup) {
  var ss = document.styleSheets;
  for (var i = 0, max = ss.length; i < max; i++) {
    if (ss[i].href.includes(search))
      return;
  }
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = backup;

  document.getElementsByTagName("head")[0].appendChild(link);
}

var uniqId = (function () {
  //usage: let myId = uniqId();
  var i = 0;
  return function () {
    return i++;
  }
})();

function isInternalTenant(u=url) {
  //not like "%sprint%dynalabs.io%" and stringProperties.url_js not like "%.dynatracelabs.com" 
  let internal = false;
  if(u.match(/sprint.*dynalabs.io/) 
    || u.match(/\.dynatracelabs.com/)
    || u.match(/managed-sprint.dynalabs.io/)
    || u.match(/sprint.dynatracelabs.com/)
    || u.match(/dev.dynatracelabs.com/)
    || u.match(/managed-dev.dynalabs.io/)
    )
    internal = true;

  InternalTenant = internal;
  return internal;
}

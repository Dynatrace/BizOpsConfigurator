/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
function loadInputChangeHandlers() {
  $("#viewport").on("change", "#compareAppList", compareAppChangeHandler);
  $("#viewport").on("change", "#compareAppList1, #compareAppList2", xappCompareAppChangeHandler);
  $("#viewport").on("change", "#usplist", uspListChangeHandler);
  $("#viewport").on("change", "#campaignActive", campaignChangeHandler);
  $("#viewport").on("change", "#featureAdded", featureChangeHandler);
  $("#viewport").on("change", "#authgithub", authgithubChangeHandler);
  $("#viewport").on("change", "#MyTime", MyTimeChangeHandler);
  $("#viewport").on("change", ".uspFilter", uspFilterChangeHandler);
  $("#viewport").on("change", ".regionFilter", regionsChangeHandler);
  $("#viewport").on("change", "#xapp", xappChangeHandler);
  $("#viewport").on("change", "#appOverview", appOverviewChangeHandler);
  $("#viewport").on("change", "#tenantOverview", tenantOverviewChangeHandler);
  $("#viewport").on("change", ".rfc1918", rfc1918ChangeHandler);
  $("#viewport").on("change", ".dashboardCleanupAll", dashboardCleanupAllChangeHandler);
  $("#viewport").on("change", "#HU-report", HUreportChangeHandler);
  $("#viewport").on("change", ".workflowPicker", workflowPickerChangeHandler);
  $("#viewport").on("change", ".workflowPickerOwner", workflowPickerOwnerChangeHandler);
  $("#viewport").on("change", ".workflowPickerAll", workflowPickerAllChangeHandler);
  $("#viewport").on("change", "#src", srcChangeHandler);

  $("#viewport").on("click", "section h4", helpdocToggler);
  $("#viewport").on("click", ".ellipsis", ellipsisToggler);
}


//////////////////////////////////////////////

function compareAppChangeHandler(e) {
  $("#compareFirstStep").html("");
  $("#compareLastStep").html("");
  $("#compareRevenue").html("");
  let compareApp = $("#compareAppList option:selected").text();

  if (compareApp != "None") {
    let p1 = getKeyActions(compareApp);
    let p2 = getKPIs(compareApp);

    return $.when(p1, p2).done(function (d1, d2) {
      let KAs = parseSteps(d1[0]);
      let kpis = parseKPIs(d2[0]);
      let KAlist = "";
      let KPIlist = "";

      if (KAs.steps.length > 0) KAs.steps.forEach(function (ka) {
        KAlist += "<option value='" + ka.step + "' data-colname='" + KAs.type + "'>" + ka.step + "</option>";
      });
      if (kpis.length > 0) kpis.forEach(function (kpi) {
        KPIlist += "<option value='" + kpi.type + "." + kpi.key + "'>" + kpi.key + "</option>";
      });
      $("#compareFirstStep").append(KAlist);
      $("#compareLastStep").append(KAlist);
      $("#compareRevenue").append(KPIlist);
      $(".compareApp").show();
    });
  } else {
    $(".compareApp").hide();
  }
}

function xappCompareAppChangeHandler(e) {
  $("#xapp_compareFirstStep").html("");
  $("#xapp_compareLastStep").html("");
  $("#xapp_compareRevenue").html("");
  let compareApp1 = $("#compareAppList1 option:selected").text();
  let compareApp2 = $("#compareAppList2 option:selected").text();

  if (compareApp1 != "None" && compareApp2 != "None") {
    let p1 = getKeyActions(compareApp1);
    let p2 = getKPIs([compareApp1, compareApp2]);
    let p3 = getKeyActions(compareApp2);

    return $.when(p1, p2, p3).done(function (d1, d2, d3) {
      let KAs1 = parseSteps(d1[0]);
      let KAs2 = parseSteps(d3[0]);
      let kpis = parseKPIs(d2[0]);
      let KAlist1 = "";
      let KAlist2 = "";
      let KPIlist = "";

      if (KAs1.steps.length > 0) KAs1.steps.forEach(function (ka) {
        KAlist1 += "<option value='" + ka.step + "' data-colname='" + KAs1.type + "'>" + ka.step + "</option>";
      });
      if (KAs2.steps.length > 0) KAs2.steps.forEach(function (ka) {
        KAlist2 += "<option value='" + ka.step + "' data-colname='" + KAs2.type + "'>" + ka.step + "</option>";
      });
      if (kpis.length > 0) kpis.forEach(function (kpi) {
        KPIlist += "<option value='" + kpi.type + "." + kpi.key + "'>" + kpi.key + "</option>";
      });
      $("#xapp_compareFirstStep").append(KAlist1);
      $("#xapp_compareLastStep").append(KAlist2);
      $("#xapp_compareRevenue").append(KPIlist);
      $(".xapp_compare").show();
    });
  } else {
    $(".xapp_compare").hide();
  }
}

function uspListChangeHandler(e) {
  if ($("#usplist").val() == "n/a")
    $("#kpiName").hide();
  else
    $("#kpiName").show();
}

function campaignChangeHandler(e) {
  if ($("#campaignActive").prop('checked') == true) {
    let p1 = getKeyActions(selection.config.appName);
    return $.when(p1).done(function (d1) {
      let KAs = parseKeyActions(d1);
      let KAlist = "";
      if (KAs.goals.length > 0) KAs.goals.forEach(function (ka) {
        KAlist += "<option value='" + ka + "' data-colname='" + KAs.type + "'>" + ka + "</option>";
      });
      $("#campaignStep1").html(KAlist);
      $(".campaignActive").show();
    });
  } else {
    $(".campaignActive").hide();
  }
}

function featureChangeHandler(e) {
  if ($("#featureAdded").prop('checked') == true) {
    let p1 = getKeyActions(selection.config.appName);
    return $.when(p1).done(function (d1) {
      let KAs = parseKeyActions(d1);
      let KAlist = "";
      if (KAs.goals.length > 0) KAs.goals.forEach(function (ka) {
        KAlist += "<option value='" + ka + "' data-colname='" + KAs.type + "'>" + ka + "</option>";
      });
      $("#StepNewFeature1").html(KAlist);
      $(".featureAdded").show();
    });
  } else {
    $(".featureAdded").hide();
  }
}

function authgithubChangeHandler() {
  if ($("#authgithub").prop('checked') == true) {
    $("tr.github").show();
  } else {
    $("tr.github").hide();
  }
}

function MyTimeChangeHandler() {
  selection.config.MyTime = $("#MyTime").val();
  let compareTimeList = "";

  timeTable.forEach(function (t) {
    if (t.MyTime == selection.config.MyTime) {
      t.MyCompareTimes.forEach(function (ct) {
        compareTimeList += "<option value='" + ct + "'>" + ct + "</option>";
      });
    }
  });
  $("#compareTimeList").html(compareTimeList);
  if ("compareTime" in selection.config && selection.config.compareTime > "")
    $("#compareTimeList").val(selection.config.compareTime);
  else
    $("#compareTimeList option:first").attr('selected', 'selected');
}

function regionsChangeHandler(event) {
  //jQ objects
  let continentSelector, countrySelector, regionSelector, citySelector, filterClauseSelector, keySelector, keyOptionSelector, valSelector;
  if (typeof event !== "undefined" && typeof event.data !== "undefined" && typeof event.data.selectors !== "undefined") {
    continentSelector = event.data.selectors[0];
    countrySelector = event.data.selectors[1];
    regionSelector = event.data.selectors[2];
    citySelector = event.data.selectors[3];
    filterClauseSelector = event.data.targetSelector;
  } else {
    continentSelector = ".continentList";
    countrySelector = ".countryList";
    regionSelector = ".regionList";
    citySelector = ".cityList";
    keySelector = "#uspKey";
    keyOptionSelector = "#uspKey option:selected";
    valSelector = "#uspVal";
    filterClauseSelector = ".filterClause";
  }
  let selectors = [continentSelector, countrySelector, regionSelector, citySelector, keySelector, keyOptionSelector, valSelector];
  let $continentList = $(continentSelector);
  let $countryList = $(countrySelector);
  let $regionList = $(regionSelector);
  let $cityList = $(citySelector);
  let $filterClause = $(filterClauseSelector);

  //values
  //let countryOs = "<option value''></option>";
  //let regionOs = "<option value''></option>";
  //let cityOs = "<option value''></option>";
  let continent = $continentList.val();
  let country = $countryList.val();
  let region = $regionList.val();
  let city = $cityList.val();

  //data
  if (typeof event !== "undefined" && typeof event.data !== "undefined" && typeof event.data.data !== "undefined") {
    regionData = event.data.data;
  } else {
    regionData = Regions;
  }
  if (typeof selection.config.filterData != "undefined") {
    if (continent == "") country = selection.config.filterData.continent;
    if (country == "") country = selection.config.filterData.country;
    if (region == "") region = selection.config.filterData.region;
    if (city == "") city = selection.config.filterData.city;
  }

  let continents = [...new Set(regionData.map(x => x.continent))];
  $continentList.html('');
  $('<option>').val('').text('').appendTo($continentList);
  continents.forEach(function (c) {
    //countryOs += "<option value='" + c + "'>" + c + "</option>";
    $('<option>').val(c).text(c).appendTo($continentList);
  });
  //$countryList.html(countryOs);

  /*let countries = [...new Set(regionData.map(x => x.country))];
  $countryList.html('');
  countries.forEach(function (c) {
    //countryOs += "<option value='" + c + "'>" + c + "</option>";
    $('<option>').val(c).text(c).appendTo($countryList);
  });
  //$countryList.html(countryOs);*/

  //determine countries
  if (continent != '') {
    $continentList.val(continent);
    let map = new Map();
    $countryList.html('');
    $('<option>').val('').text('n/a').appendTo($countryList);
    for (let i of regionData) {
      if (!map.has(i.country) && i.continent == continent) {
        map.set(i.country, true);
        //regionOs += "<option value='" + i.region + "'>" + i.region + "</option>";
        $('<option>').val(i.country).text(i.country).appendTo($countryList);
      }
    }
    //$countryList.html(countryOs);
    $countryList.show();
  } else $countryList.hide();

  //determine regions
  if (country != '') {
    $countryList.val(country);
    let map = new Map();
    $regionList.html('');
    $('<option>').val('').text('n/a').appendTo($regionList);
    for (let i of regionData) {
      if (!map.has(i.region) && i.country == country) {
        map.set(i.region, true);
        //regionOs += "<option value='" + i.region + "'>" + i.region + "</option>";
        $('<option>').val(i.region).text(i.region).appendTo($regionList);
      }
    }
    //$regionList.html(regionOs);
    $regionList.show();
  } else $regionList.hide();

  //determine cities
  if (region != '') {
    $regionList.val(region);
    let map = new Map();
    $cityList.html('');
    $('<option>').val('').text('n/a').appendTo($cityList);
    for (let i of regionData) {
      if (!map.has(i.city) && i.country == country && i.region == region) {
        map.set(i.city, true);
        //cityOs += "<option value='" + i.city + "'>" + i.city + "</option>";
        $('<option>').val(i.city).text(i.city).appendTo($cityList);
      }
    }
    //$cityList.html(cityOs);
    $cityList.show();
  } else $cityList.hide();

  if (city != '') {
    $cityList.val(city);
  }
  $filterClause.val(buildFilterClause(selectors));
}

function uspFilterChangeHandler(event) {
  //jQ objects
  let continentSelector, countrySelector, regionSelector, citySelector, filterClauseSelector, keySelector, keyOptionSelector, valSelector;
  if (typeof event !== "undefined" && typeof event.data !== "undefined" && typeof event.data.selectors !== "undefined") {
    keySelector = event.data.selectors[0];
    keyOptionSelector = keySelector + " option:selected";
    valSelector = event.data.selectors[1];
    filterClauseSelector = event.data.targetSelector;
  } else {
    continentSelector = ".continentList";
    countrySelector = ".countryList";
    regionSelector = ".regionList";
    citySelector = ".cityList";
    keySelector = "#uspKey";
    keyOptionSelector = "#uspKey option:selected";
    valSelector = "#uspVal";
    filterClauseSelector = ".filterClause";
  }
  let selectors = [continentSelector, countrySelector, regionSelector, citySelector, keySelector, keyOptionSelector, valSelector];
  let $keyList = $(keySelector);
  let $selectedOption = $(keyOptionSelector);
  let $valList = $(valSelector);
  let $filterClause = $(filterClauseSelector);

  //let keyOs = "<option value''></option>";
  //let valOs = "<option value''></option>";
  let key = $keyList.val();
  let type = (($selectedOption.length > 0) ?
    $selectedOption[0].dataset['colname'] :
    undefined);
  let val = $valList.val();

  //which data
  let uspData;
  if (typeof event !== "undefined" && typeof event.data !== "undefined" && typeof event.data.data !== "undefined") {
    uspData = event.data.data;
  } else {
    uspData = USPs;
  }

  if (typeof key == "undefined" || key == null || key == '') { //build out key list if needed
    $keyList.html('');
    $('<option>').val('').text('n/a').appendTo($keyList);
    Object.keys(uspData).sort().forEach(function (t) {
      Object.keys(uspData[t]).sort().forEach(function (k) {
        //keyOs += "<option value='" + k + "' data-colname='" + t + "'>" + k + "</option>";
        $('<option>').val(k).text(k).attr('data-colname', t).appendTo($keyList);
      });
    });
    //$keyList.html(keyOs);
    $valList.hide();
  }

  if (typeof selection != "undefined" &&
    typeof selection.config != "undefined" &&
    typeof selection.config.filterData != "undefined") { //load config if available
    if (val == "") val = selection.config.filterData.val;
    if (type == "") type = selection.config.filterData.type;
    if (key == "") key = selection.config.filterData.key;
    if (type != "") $keyList.attr('data-colname', type);
    if (key != "") $keyList.val(key);
  }

  if (key != "") {  //if we have the key draw the values
    $valList.html('');
    $('<option>').val('').text('n/a').appendTo($valList);
    if (typeof uspData[type] != "undefined" &&
      typeof uspData[type][key] != "undefined")
      uspData[type][key].sort().forEach(function (v) {
        //valOs += "<option value='" + v + "'>" + v + "</option>";
        $('<option>').val(v).text(v).appendTo($valList);
      });
    //$valList.html(valOs);
    $valList.show();
    if (val != '') $valList.val(val);
  }

  $filterClause.val(buildFilterClause(selectors));
}

function xappChangeHandler() {
  var p1 = {};
  if ($("#xapp").prop('checked')) {
    p1 = getApps();
    $.when(p1).done(function (d1) {
      let apps = d1;
      let apps_html = "";
      apps.sort((a, b) => (a.displayName.toLowerCase() > b.displayName.toLowerCase()) ? 1 : -1);
      apps.forEach(function (app) {
        apps_html += "<option value='" + app.displayName + "' data_id='" + app.entityId + "'>" + app.displayName + "</option>";
      });
      $("#xapp_apps").html(apps_html);
      $(".xapps").show();
    });
  }
  else
    $(".xapps").hide();

  return p1;
}

function appOverviewChangeHandler() {
  var AO = $("#appOverview").val();

  $("#autoTag").hide();
  $("#compareApp").hide();
  $("#compareTime").hide();
  $("#remoteEmployeeInputs").hide();
  $(".remoteEmployeeCompare").hide();
  $("#citrixAppTemplate").hide();
  $("#appPickerLabel").text("App");

  let readme = findOverviewREADME(AO);
  if (typeof readme != "undefined") $("#readmeIcon").show();
  else $("#readmeIcon").hide();

  switch (AO) {
    case "AppOverview.json": {
      $("#compareApp").show();
      $("#compareTime").show();
      break;
    }
    case "CitrixOverview.json": {
      $("#appPickerLabel").text("StoreFront App");
      $("#citrixAppTemplate").show();
      drawMZs("#citrixMZ");
      $("#citrixMZ").on("change", "", function () {
        let mzid = $(this).val();
        getServices(mzid).then(function (services) {
          drawServiceSelect(services, "#storefrontService");
        });
        getApps(mzid).then(function (apps) {
          drawApps(apps, selection.config, selector = "#citrixRUMApp");
        });
      });
      break;
    }
    case "REApplicationOverview.json":
    case "REApplicationOverview2.json": {
      $("#remoteEmployeeInputs").show();
      $(".remoteEmployeeCompare").show();
      break;
    }
    default:
      console.log("No special handling defined for #appOverview: " + AO);
  }
}

function tenantOverviewChangeHandler() {
  var TO = $("#tenantOverview").val();

  $("#remoteEmployeeInputs").hide();
  $(".remoteEmployeeCompare").hide();
  $("#SAPtenant").hide();

  let readme = findOverviewREADME(TO);
  if (typeof readme != "undefined") $("#readmeIcon").show();
  else $("#readmeIcon").hide();

  switch (TO) {
    case "RETenantOverview.json":
    case "RETenantOverview2.json":
    case "RETenantOverview3.json": {
      $("#remoteEmployeeInputs").show();
      $(".remoteEmployeeCompare").show();
      break;
    }
    case "00000000-dddd-bbbb-ffff-000000000001":
    case "TenantOverview.json": {
      break;
    }
    case "SAP Application Cockpit.json": {
      $("#SAPtenant").show();
      getApps().then(function (apps) {
        let customapps = apps.filter(app => app.entityId.includes("CUSTOM_APPLICATION"));
        let html = "";
        customapps.forEach(function (app) {
          html += `<option data-json='${JSON.stringify(app)}' value='${app.entityId}'>${app.displayName}</option>`;
        });
        $("#SAPapps").html(html);
      });
      break;
    }
    default:
      console.log("No special handling defined for #tenantOverview: " + TO);
  }
}

function rfc1918ChangeHandler() {
  let ipClauseObj = $(this).parent("div").find(".ipClause");
  let ipClause = ipClauseObj.val();
  let ipClauses = [];
  try {
    ipClause = ipClause.match(/\((.*)\)/)[1];
    ipClauses = ipClause.split(" OR ");
  } catch (e) {
    ipClause = "";
    ipClauses = [];
  }

  if ($(this).prop("checked")) {
    if (!ipClause.includes("10.0.0.0"))
      ipClauses.push(`usersession.ip BETWEEN "10.0.0.0" AND "10.255.255.255"`);
    if (!ipClause.includes("172.16.0.0"))
      ipClauses.push(`usersession.ip BETWEEN "172.16.0.0" AND "172.31.255.255"`);
    if (!ipClause.includes("192.168.0.0"))
      ipClauses.push(`usersession.ip BETWEEN "192.168.0.0" AND "192.168.255.255"`);
    if (ipClauses.length > 0) ipClause = ` AND (${ipClauses.join(" OR ")})`;
    else ipClause = "";
    ipClauseObj.val(ipClause);
  } else {
    let i = 0;
    i = ipClauses.indexOf(`usersession.ip BETWEEN "10.0.0.0" AND "10.255.255.255"`);
    if (i > -1) ipClauses.splice(i, 1);
    i = ipClauses.indexOf(`usersession.ip BETWEEN "172.16.0.0" AND "172.31.255.255"`);
    if (i > -1) ipClauses.splice(i, 1);
    i = ipClauses.indexOf(`usersession.ip BETWEEN "192.168.0.0" AND "192.168.255.255"`);
    if (i > -1) ipClauses.splice(i, 1);
    if (ipClauses.length > 0) ipClause = ` AND (${ipClauses.join(" OR ")})`;
    else ipClause = "";
    ipClauseObj.val(ipClause);
  }
}

function dashboardCleanupAllChangeHandler() {
  let checked = $(this).prop("checked");
  let parent = $(this).parent();

  if (checked) {
    parent.find("ul li input[type=checkbox]").each(function (i) {
      $(this).prop("checked", true);
    });
  } else {
    parent.find("ul li input[type=checkbox]").each(function (i) {
      $(this).prop("checked", false);
    });
  }
}

function HUreportChangeHandler() {
  let report = $("#HU-report").val();
  let urlObj = $("#url");
  let tokenObj = $("#token");

  if (urlObj.val() == "" && url !== "") { urlObj.val(url); }
  if (tokenObj.val() == "" && token !== "") { tokenObj.val(token); }

  if (urlObj.val() == "" || tokenObj.val() == "") {
    $("#HU-infobox").text("Please enter a URL and Token first");
  } else {
    url = urlObj.val();
    if (url.length > 1 && url.charAt(url.length - 1) == "/")
      url = url.substring(0, url.length - 1);
    token = tokenObj.val();
    let p = $.Deferred();
    if (HUreport.url == url) p.resolve(HUreport.data);
    else p = getHosts();

    $("#HU-total").html("");
    $("#HU-HostGroup").html("");
    $("#HU-MZ").html("");
    $("#HUreport h3").text("");
    $("#HU-infobox").text("");

    $.when(p).done(function (data) {
      HUreport.url = url;
      HUreport.data = data; //save for later

      let today = data
        .filter(h => h.lastSeenTimestamp > Date.now() - (1000 * 60 * 60)); //seen last hour
      let newThisWeek = data
        .filter(h => h.firstSeenTimestamp > Date.now() - (1000 * 60 * 60 * 24 * 7));
      let removedLast72 = data
        .filter(h => h.lastSeenTimestamp < Date.now() - (1000 * 60 * 60)) //not seen last hour

      switch (report) {
        case "Total": {
          let todayHU = today
            .reduce((a, cv) => a + cv.consumedHostUnits, 0);
          let newThisWeekHU = newThisWeek
            .reduce((a, cv) => a + cv.consumedHostUnits, 0);
          let removedLast72HU = removedLast72
            .reduce((a, cv) => a + cv.consumedHostUnits, 0);

          $("#HUreport h3").text("HostUnit Totals");
          let html = "<table class='dataTable'>";
          html += `<tr><td>Total HU:</td><td>${todayHU.toFixed(2)}</td></tr>`;
          html += `<tr><td>New HU this week:</td><td>${newThisWeekHU.toFixed(2)}</td></tr>`;
          html += `<tr><td>HU removed last 72h:</td><td>${removedLast72HU.toFixed(2)}</td></tr>`;
          html += "</table><a href='#downloadExcel' id='downloadExcel' data-tableid='#HU-total table' data-filename='HUreport-HU-total'><img src='images/folder.svg'></a>";
          $("#HU-total").html(html);
          break;
        }
        case "HostGroup": {
          $("#HUreport h3").text("HostUnits per HostGroup");
          let hostgroups = new Map();
          data.forEach(function (h) {
            let hg = " ";
            if ("hostGroup" in h) hg = h.hostGroup.name;
            console.log(`first:${h.firstSeenTimestamp},last:${h.lastSeenTimestamp},lasthour:${h.lastSeenTimestamp - (Date.now() - (1000 * 60 * 60))},new:${h.firstSeenTimestamp - (Date.now() - (1000 * 60 * 60 * 24 * 7))},removed:${(Date.now() - (1000 * 60 * 60)) - h.lastSeenTimestamp}`);
            if (hostgroups.has(hg)) {
              let hu = hostgroups.get(hg);
              if (h.lastSeenTimestamp > (Date.now() - (1000 * 60 * 60)))//last hour
                hu.todayHU = hu.todayHU + h.consumedHostUnits;
              if (h.firstSeenTimestamp > (Date.now() - (1000 * 60 * 60 * 24 * 7)))
                hu.newThisWeekHU = hu.newThisWeekHU + h.consumedHostUnits;
              if (h.lastSeenTimestamp < (Date.now() - (1000 * 60 * 60)))//not seen last hour
                hu.removedLast72HU = hu.removedLast72HU + h.consumedHostUnits;
              hostgroups.set(hg, hu);
            } else {
              let hu = { todayHU: 0, newThisWeekHU: 0, removedLast72HU: 0 };
              if (h.lastSeenTimestamp > (Date.now() - (1000 * 60 * 60)))//last hour
                hu.todayHU = h.consumedHostUnits;
              if (h.firstSeenTimestamp > (Date.now() - (1000 * 60 * 60 * 24 * 7)))
                hu.newThisWeekHU = h.consumedHostUnits;
              if (h.lastSeenTimestamp < (Date.now() - (1000 * 60 * 60)))//not seen last hour
                hu.removedLast72HU = h.consumedHostUnits;
              hostgroups.set(hg, hu);
            }
          });

          //sort descending
          hostgroups[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => b[1].todayHU - a[1].todayHU);
          }

          let todayHUTotal = 0;
          let newThisWeekHUTotal = 0;
          let removedLast72HUTotal = 0;

          let html = "<table class='dataTable'>";
          html += `<thead><tr><td>HostGroup</td><td>HU Today</td><td>New This Week</td><td>Removed Last 72hr</td></tr></thead><tbody>`;
          for (let [k, v] of hostgroups) {
            html += `<tr><td>${k}</td><td>${v.todayHU.toFixed(2)}</td><td>${v.newThisWeekHU.toFixed(2)}</td><td>${v.removedLast72HU.toFixed(2)}</td></tr>`;
            todayHUTotal += v.todayHU;
            newThisWeekHUTotal += v.newThisWeekHU;
            removedLast72HUTotal += v.removedLast72HU;
          }

          html += `</tbody><tfoot><tr><td>Total:</td><td>${todayHUTotal.toFixed(2)}</td><td>${newThisWeekHUTotal.toFixed(2)}</td><td>${removedLast72HUTotal.toFixed(2)}</td></tr></tfoot>`;
          html += "</table><a href='#downloadExcel' id='downloadExcel' data-tableid='#HU-HostGroup table' data-filename='HUreport-HU-HostGroup'><img src='images/folder.svg'></a>";

          $("#HU-HostGroup").html(html);
          break;
        }
        case "ManagementZone": {
          $("#HUreport h3").text("HostUnit per MZ");
          $("#HU-infobox").text("Note: hosts can and usually are in more than one MZ");

          let mzs = new Map();
          data.forEach(function (h) {
            if ("managementZones" in h) h.managementZones.forEach(function (mz) {
              if (mzs.has(mz.name)) {
                let hu = mzs.get(mz.name);
                if (h.lastSeenTimestamp > (Date.now() - (1000 * 60 * 60)))//last hour
                  hu.todayHU = hu.todayHU + h.consumedHostUnits;
                if (h.firstSeenTimestamp > (Date.now() - (1000 * 60 * 60 * 24 * 7)))
                  hu.newThisWeekHU = hu.newThisWeekHU + h.consumedHostUnits;
                if (h.lastSeenTimestamp < (Date.now() - (1000 * 60 * 60)))//not seen last hour
                  hu.removedLast72HU = hu.removedLast72HU + h.consumedHostUnits;
                mzs.set(mz.name, hu);
              } else {
                let hu = { todayHU: 0, newThisWeekHU: 0, removedLast72HU: 0 };
                if (h.lastSeenTimestamp > (Date.now() - (1000 * 60 * 60)))//last hour
                  hu.todayHU = h.consumedHostUnits;
                if (h.firstSeenTimestamp > (Date.now() - (1000 * 60 * 60 * 24 * 7)))
                  hu.newThisWeekHU = h.consumedHostUnits;
                if (h.lastSeenTimestamp < (Date.now() - (1000 * 60 * 60)))//not seen last hour
                  hu.removedLast72HU = h.consumedHostUnits;
                mzs.set(mz.name, hu);
              }
            });
          });

          //sort descending
          mzs[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => b[1].todayHU - a[1].todayHU);
          }

          let todayHUTotal = 0;
          let newThisWeekHUTotal = 0;
          let removedLast72HUTotal = 0;

          let html = "<table class='dataTable'>";
          html += `<thead><tr><td>ManagementZones</td><td>HU Today</td><td>New This Week</td><td>Removed Last 72hr</td></tr></thead><tbody>`;
          for (let [k, v] of mzs) {
            html += `<tr><td>${k}</td><td>${v.todayHU.toFixed(2)}</td><td>${v.newThisWeekHU.toFixed(2)}</td><td>${v.removedLast72HU.toFixed(2)}</td></tr>`;
            todayHUTotal += v.todayHU;
            newThisWeekHUTotal += v.newThisWeekHU;
            removedLast72HUTotal += v.removedLast72HU;
          }

          html += `</tbody><tfoot><tr><td>Total:</td><td>${todayHUTotal.toFixed(2)}</td><td>${newThisWeekHUTotal.toFixed(2)}</td><td>${removedLast72HUTotal.toFixed(2)}</td></tr></tfoot>`;
          html += "</table><a href='#downloadExcel' id='downloadExcel' data-tableid='#HU-MZ table' data-filename='HUreport-MZ'><img src='images/folder.svg'></a>";
          $("#HU-MZ").html(html);
          break;
        }
      }
    });
  }
}

function workflowPickerChangeHandler(e) {
  if (LOADING_REPOS) return false;
  let el = $(this);
  let id = el.attr('id');
  let $persona = $("#persona");
  let $usecase = $("#usecase");
  let $workflow = $("#workflow");
  let $readmeViewer = $("#readmeViewer");
  let $blogLink = $("#blogLink");
  let $issues = $(`#issues`);
  $("#persona_usecase_next").siblings(".dttag").remove();

  switch (id) {
    case undefined: {

      let deployedPersonas = workflowList
        .filter(statusFilter)
        .map((x) => x.file.config.persona).flat().filter(unique);
      let personaOptions = "";
      personas.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1).forEach(function (persona) {
        if (deployedPersonas.includes(persona.prefix)) {
          personaOptions += `<option data-prefix="${persona.prefix}">${persona.name}</option>`;
        }
      });
      $persona.html(personaOptions);
      if (window.location.hash.includes("#deploy/persona")) {
        let args = hashArgs();
        if (args[2] != "" && args[2] != null)
          $persona.val(args[2]);
      }
      if ($persona.val() == null) {
        $persona.val($persona.find("option:first").val());
        window.location.hash = `#deploy/persona/${$persona.val()}`;
      }
      //do not break
    }
    case "persona": {
      let usecaseOptions = "";
      let personaPrefix = $("#persona option:selected").attr("data-prefix");

      let filteredWFs = workflowList
        .filter(statusFilter)
        .filter(wf => wf.file.config.persona.includes(personaPrefix));
      let deployedUsecases = filteredWFs.map((wf) => wf.file.config.usecase).filter(unique);
      usecases.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1).forEach(function (usecase) {
        if (deployedUsecases.includes(usecase.prefix)) {
          usecaseOptions += `<option data-prefix="${usecase.prefix}">${usecase.name}</option>`;
        }
      });
      $usecase.html(usecaseOptions);
      if (window.location.hash.includes("#deploy/persona")) {
        let args = hashArgs();
        if (args[3] != "" && args[3] != null)
          $usecase.val(args[3]);
      }
      if ($usecase.val() == null) {
        $usecase.val($usecase.find("option:first").val());
        window.location.hash = `#deploy/persona/${$persona.val()}/${$usecase.val()}`;
      }
      //do not break
    }
    case "usecase": {
      let workflowOptions = "";
      let personaPrefix = $("#persona option:selected").attr("data-prefix");
      let usecasePrefix = $("#usecase option:selected").attr("data-prefix");
      let filtered1 = workflowList
        .filter(statusFilter)
        .filter(wf => wf.file.config.persona.includes(personaPrefix));
      let filtered2 = filtered1.filter(wf => wf.file.config.usecase === usecasePrefix);
      filtered2
        .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
        .forEach(function (wf) {
          let name = wf.file.config.workflowName;
          let i = workflowList.findIndex((x) => x == wf);
          workflowOptions += `<option data-workflowIndex="${i}">${name}</option>`;
        });
      $workflow.html(workflowOptions);
      if (window.location.hash.includes("#deploy/persona")) {
        let args = hashArgs();
        if (args[4] != "" && args[4] != null)
          $workflow.val(args[4]);
      }
      if ($workflow.val() == null) {
        $workflow.val($workflow.find("option:first").val());
        window.location.hash = `#deploy/persona/${$persona.val()}/${$usecase.val()}/${$workflow.val()}`;
      }
      //do not break
    }
    case "workflow":
    default:
      let i = $workflow.find("option:selected").attr('data-workflowIndex');
      let workflow = workflowList[i];
      if(!workflow){
        console.warn(`Workflow not found. i:${i}, workflowList.length:${workflowList.length}`);
        return false;
      }
      let readme = findWorkflowReadme(workflow);
      if (typeof readme != "undefined" && typeof readme.html != "undefined")
        $readmeViewer.html(readme.html);
      else
        $readmeViewer.html("");
      //let blogURL = workflow.file.config.blogURL;
      // let blogURL = findWorkflowBlogURL(workflow);
      // if (blogURL != "") {
      //   $blogLink
      //     .html(`<a href="${blogURL}" class="newTab" target="_blank">Blog post <img src='images/link.svg'></a>`)
      //     .show();
      // } else {
      //   $blogLink
      //     .hide()
      //     .html("");
      // }
      insertBlogLink($blogLink, workflow);
      $issues.html(`<a href="https://github.com/${workflow.file.config.githubUser}/${workflow.file.config.githubRepo}/issues" target="_blank" class="newTab">Issues <img src="images/link.svg"></a>`);
      $issues.show();
      if ("workflowStatus" in workflow.file.config && workflow.file.config.workflowStatus
        && workflow.file.config.workflowStatus != "GA")
        $("#persona_usecase_next").after(`<div class='dttag'>${workflow.file.config.workflowStatus}</div>`);
      if ("powerups" in workflow.file.config && workflow.file.config.powerups)
        $("#persona_usecase_next").after(`<div class='dttag'>Powerups</div>`);

      window.location.hash = `#deploy/persona/${$persona.val()}/${$usecase.val()}/${$workflow.val()}`;
  }

}

function ellipsisToggler() {
  $(".ellipsisMenu").toggle();
}

function workflowPickerTagsChangeHandler(e) {
  if (LOADING_REPOS) return false;
  let el = $(this);
  let id = el.attr('id');
  let $tag = $("#tag");
  let $workflow = $("#workflow");
  let $readmeViewer = $("#readmeViewer");
  let $blogLink = $("#blogLink");
  let $issues = $(`#issues`);
  $("#persona_usecase_next").siblings(".dttag").remove();

  switch (id) {
    case undefined: {
      let tags = workflowList
        .filter(statusFilter)
        .map((x) => x.tags).flat().filter(unique);
      let tagOptions = "";
      tags.sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1).forEach(function (tag) {
        tagOptions += `<option>${tag}</option>`;
      });
      $tag.html(tagOptions);
      if (window.location.hash.includes("#deploy/tags")) {
        let args = hashArgs();
        if (args[2] != "" && args[2] != null)
          $tag.val(args[2]);
      }
      if ($tag.val() == null) {
        $tag.val($tag.find("option:first").val());
        window.location.hash = `#deploy/tags/${$tag.val()}`;
      }
      //do not break
    }
    case "tag": {
      let workflowOptions = "";
      let tag = $tag.val();
      let filteredWFs = workflowList
        .filter(statusFilter)
        .filter(wf => Array.isArray(wf.tags) && wf.tags.includes(tag));
      filteredWFs
        .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
        .forEach(function (wf) {
          let name = wf.file.config.workflowName;
          let i = workflowList.findIndex((x) => x == wf);
          workflowOptions += `<option data-workflowIndex="${i}">${name}</option>`;
        });
      $workflow.html(workflowOptions);
      if (window.location.hash.includes("#deploy/tags")) {
        let args = hashArgs();
        if (args[4] != "" && args[4] != null)
          $workflow.val(args[4]);
      }
      if ($workflow.val() == null) {
        $workflow.val($workflow.find("option:first").val());
        window.location.hash = `#deploy/tags/${$tag.val()}/${$workflow.val()}`;
      }
      //do not break
    }
    case "workflow":
    default:
      let i = $workflow.find("option:selected").attr('data-workflowIndex');
      let workflow = workflowList[i];
      let readme = findWorkflowReadme(workflow);
      if (typeof readme != "undefined" && typeof readme.html != "undefined")
        $readmeViewer.html(readme.html);
      else
        $readmeViewer.html("");
      insertBlogLink($blogLink, workflow);
      $issues.html(`<a href="https://github.com/${workflow.file.config.githubUser}/${workflow.file.config.githubRepo}/issues" target="_blank" class="newTab">Issues <img src="images/link.svg"></a>`);
      $issues.show();
      if ("workflowStatus" in workflow.file.config && workflow.file.config.workflowStatus
        && workflow.file.config.workflowStatus != "GA")
        $("#persona_usecase_next").after(`<div class='dttag'>${workflow.file.config.workflowStatus}</div>`);

      window.location.hash = `#deploy/tags/${$tag.val()}/${$workflow.val()}`;
  }
}

function workflowPickerOwnerChangeHandler(e) {
  if (LOADING_REPOS) return false;
  let el = $(this);
  let id = el.attr('id');
  let $owner = $("#owner");
  let $repo = $("#repo");
  let $workflow = $("#workflow");
  let $readmeViewer = $("#readmeViewer");
  let $blogLink = $("#blogLink");
  let $issues = $(`#issues`);
  $("#persona_usecase_next").siblings(".dttag").remove();

  switch (id) {
    case undefined: {
      let owners = workflowList
        .filter(statusFilter)
        .map((x) => x.repo.owner).flat().filter(unique);
      let ownerOptions = "";
      owners.sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1).forEach(function (owner) {
        ownerOptions += `<option>${owner}</option>`;
      });
      $owner.html(ownerOptions);
      if (window.location.hash.includes("#deploy/owner")) {
        let args = hashArgs();
        if (args[2] != "" && args[2] != null)
          $owner.val(args[2]);
      }
      if ($owner.val() == null) {
        $owner.val($owner.find("option:first").val());
        window.location.hash = `#deploy/owner/${$owner.val()}`;
      }
      //do not break
    }
    case "owner": {
      let repoOptions = "";
      let owner = $owner.val();

      let filteredWFs = workflowList
        .filter(statusFilter)
        .filter(wf => wf.repo.owner == owner);
      let repos = filteredWFs.map((wf) => wf.repo.repo).filter(unique);
      repos.sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1).forEach(function (repo) {
        repoOptions += `<option>${repo}</option>`;
      });
      $repo.html(repoOptions);
      if (window.location.hash.includes("#deploy/owner")) {
        let args = hashArgs();
        if (args[3] != "" && args[3] != null)
          $repo.val(args[3]);
      }
      if ($repo.val() == null) {
        $repo.val($repo.find("option:first").val());
        window.location.hash = `#deploy/owner/${$owner.val()}/${$repo.val()}`;
      }
      //do not break
    }
    case "repo": {
      let workflowOptions = "";
      let owner = $owner.val();
      let repo = $repo.val();
      let filteredWFs = workflowList
        .filter(statusFilter)
        .filter(wf => wf.repo.owner == owner && wf.repo.repo == repo);
      filteredWFs
        .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
        .forEach(function (wf) {
          let name = wf.file.config.workflowName;
          let i = workflowList.findIndex((x) => x == wf);
          workflowOptions += `<option data-workflowIndex="${i}">${name}</option>`;
        });
      $workflow.html(workflowOptions);
      if (window.location.hash.includes("#deploy/owner")) {
        let args = hashArgs();
        if (args[4] != "" && args[4] != null)
          $workflow.val(args[4]);
      }
      if ($workflow.val() == null) {
        $workflow.val($workflow.find("option:first").val());
        window.location.hash = `#deploy/owner/${$owner.val()}/${$repo.val()}/${$workflow.val()}`;
      }
      //do not break
    }
    case "workflow":
    default:
      let i = $workflow.find("option:selected").attr('data-workflowIndex');
      let workflow = workflowList[i];
      let readme = findWorkflowReadme(workflow);
      if (typeof readme != "undefined" && typeof readme.html != "undefined")
        $readmeViewer.html(readme.html);
      else
        $readmeViewer.html("");
      //let blogURL = workflow.file.config.blogURL;
      // let blogURL = findWorkflowBlogURL(workflow);
      // if (blogURL != "") {
      //   $blogLink.html(`<a href="${blogURL}" class="newTab" target="_blank">Blog post <img src='images/link.svg'></a>`);
      //   $blogLink.show();
      // } else {
      //   $blogLink.hide();
      //   $blogLink.html("");
      // }
      insertBlogLink($blogLink, workflow);
      $issues.html(`<a href="https://github.com/${workflow.file.config.githubUser}/${workflow.file.config.githubRepo}/issues" target="_blank" class="newTab">Issues <img src="images/link.svg"></a>`);
      $issues.show();
      if ("workflowStatus" in workflow.file.config && workflow.file.config.workflowStatus
        && workflow.file.config.workflowStatus != "GA")
        $("#persona_usecase_next").after(`<div class='dttag'>${workflow.file.config.workflowStatus}</div>`);

      window.location.hash = `#deploy/owner/${$owner.val()}/${$repo.val()}/${$workflow.val()}`;
  }
}

function workflowPickerAllChangeHandler(e) {
  if (LOADING_REPOS) return false;
  let el = $(this);
  let id = el.attr('id');
  let $workflow = $("#workflow");
  let $readmeViewer = $("#readmeViewer");
  let $blogLink = $("#blogLink");
  let $issues = $(`#issues`);
  $("#persona_usecase_next").siblings(".dttag").remove();

  switch (id) {
    case undefined: {
      let workflowOptions = "";
      let filteredWFs = workflowList
        .filter(statusFilter);
      filteredWFs
        .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
        .forEach(function (wf) {
          let name = wf.file.config.workflowName;
          let i = workflowList.findIndex((x) => x == wf);
          workflowOptions += `<option data-workflowIndex="${i}">${name}</option>`;
        });
      $workflow.html(workflowOptions);
      if (window.location.hash.includes("#deploy/all")) {
        let args = hashArgs();
        if (args[2] != "" && args[2] != null)
          $workflow.val(args[2]);
      }
      //do not break
    }
    case "workflow":
    default:
      let i = $workflow.find("option:selected").attr('data-workflowIndex');
      let workflow = workflowList[i];
      if (typeof (workflow) == "undefined") return false;
      let readme = findWorkflowReadme(workflow);
      if (typeof readme != "undefined" && typeof readme.html != "undefined")
        $readmeViewer.html(readme.html);
      else
        $readmeViewer.html("");
      // let blogURL = workflow.file.config.blogURL;
      // if (blogURL != "") {
      //   $blogLink.html(`<a href="${blogURL}" class="newTab" target="_blank">Blog post <img src='images/link.svg'></a>`);
      //   $blogLink.show();
      // } else {
      //   $blogLink.hide();
      //   $blogLink.html("");
      // }
      insertBlogLink($blogLink, workflow);
      $issues.html(`<a href="https://github.com/${workflow.file.config.githubUser}/${workflow.file.config.githubRepo}/issues" target="_blank" class="newTab">Issues <img src="images/link.svg"></a>`);
      $issues.show();
      if ("workflowStatus" in workflow.file.config && workflow.file.config.workflowStatus
        && workflow.file.config.workflowStatus != "GA")
        $("#persona_usecase_next").after(`<div class='dttag'>${workflow.file.config.workflowStatus}</div>`);

      window.location.hash = `#deploy/all/${$workflow.val()}`;
  }
}

function srcChangeHandler(e) {
  let $el = $(this);
  let val = $el.val();

  switch (val) {
    case "GitHub API":
      $(`tr.github, tr.githubpat`).show();
      break;
    case "S3":
    default:
      $(`tr.github, tr.githubpat`).hide();
  }
}

function insertBlogLink(target, workflow) {
  let $blogLink = $(target);
  let blogURL = (typeof workflow != "undefined" &&
    typeof workflow.file != "undefined" &&
    typeof workflow.file.config != "undefined") ?
    workflow.file.config.blogURL :
    "";

  if (blogURL != "") {
    $blogLink
      .html(`<a href="${blogURL}" class="newTab" target="_blank">Blog post <img src='images/link.svg'></a>`)
      .show();
  } else {
    $blogLink
      .hide()
      .html("");
  }
}
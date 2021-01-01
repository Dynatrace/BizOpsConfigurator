/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
//UI navigation & painting
//
//
$(document).ready(function () {
  jqueryInit();
  // jQuery methods go here... (main logic)

  staticCleanup();
  // static link handlers
  loadStaticHandlers();

  // global button handler
  $("#viewport, #repo_config, #dashboard_list").on("click", "input:button", globalButtonHandler);

  //anchor handler
  $("#bcwrapper, #viewport, #repo_config, #dashboard_list, #errorBox")
    .on("click", "a", linkHandler);

  loadInputChangeHandlers();
  workflowBuilderHandlers();

  hashHandler(window.location.hash);
});

////////// Functions ////////////

function pencilToggle(on) {
  if (on === true || $("#whereClause").attr('readonly')) {
    $("#whereClause").attr('readonly', false);
    $("#whereClause").addClass("pencilMode");
    $("#goallist li").draggable({ disabled: true });
    $("#goallist li").addClass("pencilMode");
    //disable funnel
    //handled in funnelClickHandler
    options.block.fill.scale = d3.schemeGreys[9];
    options.label.fill = "#000";
    chart.draw(funnelData, options);
    $("#pencil").addClass("pencilMode");
    $("#plus").prop("disabled", true);
    $("#minus").prop("disabled", true);

  } else if (on === false || confirm("Revert where clause to funnel?")) {
    $("#whereClause").attr('readonly', true);
    $("#whereClause").removeClass("pencilMode");
    $("#goallist li").draggable({ disabled: false });
    $("#goallist li").removeClass("pencilMode");
    options.block.fill.scale = d3.schemeCategory10;
    options.label.fill = "#fff";
    chart.draw(funnelData, options);
    $("#pencil").removeClass("pencilMode");

    updateWhere(funnelData);
    if (selection.config.funnelData.length <= 10) $("#plus").prop("disabled", false);
    if (selection.config.funnelData.length >= 2) $("#minus").prop("disabled", false);

  }
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadExcel(filename, worksheet, selector) {
  let wb = XLSX.utils.table_to_book($(selector).get(0), { sheet: worksheet });
  /*let ws = wb.Sheets[worksheet];
  let ref = ws['!ref'].match(/([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)/);
  ws['!autofilter']={ref:`${ref[1]+ref[2]}:${ref[3]}${ref[4]-1}`};*/
  let wbout = XLSX.writeFile(wb, filename, { bookType: 'xlsx', bookSST: true, type: 'binary' });
}

function jqueryInit() {
  //test for ES6 support and fail otherwise
  try {
    new Function("(a = 0) => a");
  }
  catch (err) {
    alert("Your browser is too old. Please use a modern browser.");
  }

  //prevent caching of XHR loads, consider turning off once production ready
  /*$.ajaxSetup({
    cache: false,
  });*/

  // prevent normal form submissions, we're using jQuery instead
  $("form").submit(function (event) {
    event.preventDefault(); //prevent default action 
  });
  $(document).ajaxStart(function () {
    // show gif here, eg:
    $("#loaderwrapper").show();
  });
  $(document).ajaxStop(function () {
    // hide gif here, eg:
    $("#loaderwrapper").hide();
  });

  //if we're going to fail, let's do so with style
  $(window).on("error", function (e) {
    $("#everything").load("html/500.html");
  });

  //Open IndexDB
  openOrCreateDB();
}

function drawTenantOverviewList() {
  $("#tenantList").html("<dl class='list'></dl>");

  let TO = /bbbbbbbb-[0-9]{4}-0000-0000-000000000000/;
  DBAdashboards.forEach(function (dashboard) {
    if (TO.test(dashboard.id)) {
      let dt = "<dt><a target='_blank' href='" + url + "/#dashboard;id=" + dashboard.id + ";gf=defaultManagementZone' class='newTab'>" +
        dashboard.name + " <img src='images/link.svg'></a> (" + dashboard.owner + ")</dt>";
      let dd = "<dd id='" + dashboard.id + "'>" +
        "<input type='button' id='listApp' value='List App Overviews'>" +
        "<input type='button' id='deployApp' value='Deploy App Overview'>" +
        "<input type='button' id='deleteTenant' value='Delete'>" +
        "</dd>";
      $("#tenantList dl").append(dt + dd);
    } //else console.log(dashboardid+" did not match");
  });
}

function drawAppOverviewList(TOid) {
  $("#appList").html("<dl class='list'></dl>");

  let to = TOid.split("-")[1];
  let reS = "bbbbbbbb-" + to + "-[0-9]{4}-0000-000000000000";
  let re = new RegExp(reS);
  DBAdashboards.forEach(function (dashboard) {
    if (re.test(dashboard.id) && dashboard.id != TOid) {
      let dt = "<dt><a target='_blank' href='" + url + "/#dashboard;id=" + dashboard.id + ";gf=defaultManagementZone' class='newTab'>" +
        dashboard.name + " <img src='images/link.svg'></a> (" + dashboard.owner + ")</dt>";
      let dd = "<dd id='" + dashboard.id + "'>" +
        "<input type='button' id='listFunnel' value='List Journeys'>" +
        "<input type='button' id='deployFunnel' value='Deploy Journey'>" +
        "<input type='button' id='updateAppForecast' value='Update Forecast'>" +
        "<input type='button' id='editApp' value='Edit App Overview'>" +
        "<input type='button' id='deleteApp' value='Delete App Overview'>" +
        "</dd>";
      $("#appList dl").append(dt + dd);
    } //else console.log(dashboardid+" did not match");
  });
}

function drawFunnelList(AOid) {
  $("#funnelList").html("<dl class='list'></dl>");

  let to = AOid.split("-")[1];
  let ao = AOid.split("-")[2];
  let reS = "bbbbbbbb-" + to + "-" + ao + "-[0-9]{4}-000000000000";
  let re = new RegExp(reS);
  DBAdashboards.forEach(function (dashboard) {
    if (re.test(dashboard.id) && dashboard.id != AOid) {
      let dt = "<dt><a target='_blank' href='" + url + "/#dashboard;id=" + dashboard.id + ";gf=defaultManagementZone' class='newTab'>" +
        dashboard.name + " <img src='images/link.svg'></a> (" + dashboard.owner + ")</dt>";
      let dd = "<dd id='" + dashboard.id + "'>" +
        "<input type='button' id='updateFunnelForecast' value='Update Forecast'>" +
        "<input type='button' id='editFunnel' value='Edit'>" +
        "<input type='button' id='deleteFunnel' value='Delete'>" +
        "</dd>";
      $("#funnelList dl").append(dt + dd);
    } //else console.log(dashboardid+" did not match");
  });
}

function drawMZs(locator = "#mzlist") {
  let p0 = $.Deferred();
  let p = (MZs.length < 1 ? getMZs() : $.when(false));
  $.when(p).done(function (d) {
    if (d != false) processMZs(d);
    let options = "<option value=''>All</option>";
    MZs.forEach(function (mz) {
      options += "<option value='" + mz.id + "'>" + mz.name + "</option>";
    });
    $(locator).html(options);
    p0.resolve();
  });
  return p0;
}

function drawApps(apps, config, selector = "#applist") {
  apps.sort((a, b) => (a.displayName.toLowerCase() > b.displayName.toLowerCase()) ? 1 : -1);
  let options = "";
  apps.forEach(function (app) {
    options += "<option value='" + app.entityId + "'>" + app.displayName + "</option>";
  });
  $(selector).html(options);

  if ("appID" in config) $("#applist").val(config.appID);
}

function drawCompareApps(apps, config) {
  let options = "<option value=''>None</option>";
  apps.forEach(function (app) {
    options += "<option value='" + app.entityId + "'>" + app.displayName + "</option>";
  });
  $("#compareAppList").html(options);
  $("#compareAppList1").html(options);
  $("#compareAppList2").html(options);

  if ("compareAppID" in config) $("#compareAppList").val(config.compareAppID);
  if ("xapp_compareAppID1" in config) $("#compareAppList1").val(config.compareAppID1);
  if ("xapp_compareAppID2" in config) $("#compareAppList2").val(config.compareAppID2);
}

function drawKPIs(kpis) {
  let options = "<option value''>n/a</option>";
  kpis.forEach(function (kpi) {
    options += "<option value='" + kpi.type + "." + kpi.key + "'>" + kpi.key + "</option>";
  });
  //$("#usplist").html(options);
  return options;
}

function drawKPIsJQ(kpis, select) {
  let $select = $(select);
  $('<option>').val('').text('n/a').appendTo($select);
  kpis.forEach(function (kpi) {
    $('<option>').val(kpi.type + "." + kpi.key).text(kpi.key).appendTo($select);
  });
  return $select;
}

function drawSteps(steps, goallist = "#goallist", xapp = false) {
  let list = "";
  steps.steps.forEach(function (step) {
    let type = "";
    switch (steps.type) {
      case "useraction.name":
        type = "KUA";
        break;
      case "useraction.matchingConversionGoals":
        type = "Conv. Goal";
        break;
    }

    list += "<li class='ui-corner-all ui-widget-content tooltip'><input id='" + step.step +
      "' data-colname='" + steps.type + "' data-appName='" + step.appName + "' " +
      "type='hidden'><span class='steptype'>" +
      type + "</span>: " + step.step +
      (xapp ? "<span class='tooltiptext'>" + step.appName + "</span>" : "") +
      "</li>";
  });
  $(goallist).append(list);
}

function drawActions(data) {
  let options = "";

  let actions = [... new Set(data.values.flat(Infinity))].sort();
  actions = actions.map((x) => x.replace(/([^"])"([^"])?/g, "$1\"\"$2")); //escape janky doublequotes

  options = actions.reduce((agg, cv) => agg += `<option>${cv}</option>`, "");
  return options;
}

function jsonviewer(result, show = false, name = "", selector = "#jsonviewer") {
  //Load the JSON viewer
  $(selector).hide();
  $(selector).load("html/jsonviewer.html", function () {
    $(selector + " #jsontitle").append(name);
    let json = JSON.stringify(result);
    if (json.length > 10000) {
      $(selector + " div#results").append("<span class='warning'>JSON too large to pretty format!</span>\n");
      $(selector + " div#results").append("<pre>" + JSON.stringify(result, null, 2) + "</pre>\n");
    } else {
      $(selector + " div#results").append(json);
      $('.jsonFormatter').jsonFormatter();
    }
    if (show) {
      $(selector).show();
      if ($(selector).is(":visible")) $("input#json").val("Hide");
    }
  });
}

function errorboxJQXHR(jqXHR, textStatus, errorThrown) {
  var errorMsg = "";
  switch (jqXHR.status) {
    case 429: {//rate limiting
      $("#errorBox").addClass("info");
      let seconds = 0;
      try {
        let then = jqXHR.responseText.match(/Reset time:.*\(([0-9]+)\)/)[1];
        let now = new Date().getTime();
        seconds = (then - now) / 1000;
      } catch (e) { seconds = 60; } //if we didn't capture the reset time, just default to a minute
      errorMsg = "API Ratelimit Exceeded. Will automatically retry in " + seconds + " seconds...";
      break;
    }
    case 0: { //probably CORS error 
      $("#errorBox").removeClass("info");
      errorMsg += "Browser blocked XHR call, check Browser Console (F12).\nPossible CORS failure on " +
        this.url + ".";
      break;
    }
    default: {
      errorMsg = "dtAPIQuery failed (" + jqXHR.status + "): " + this.url;
      if (this.url.includes('v1/dashboards')) {
        let name = this.data.match(/dashboardMetadata[^}]*(name"?:"[^"]*")/);
        if (name !== null && name.length > 2) errorMsg += ` (${name[1]})`;
      }
      if (errorThrown.length > 0) errorMsg += "\nError: " + errorThrown;
      if (typeof (jqXHR.responseText) !== "undefined") {
        let responseText = "<pre>" + jqXHR.responseText.replace(/<([^>]*)>/g, "&lt$1&gt") + "</pre>";
        responseText = responseText.replace(/\n/g, "");
        errorMsg += "\nResponse: " + responseText;
      }
    }
  }
  $("#errorBox").html(errorMsg);
  $("#errorBox").show();
  logError(errorMsg, errorThrown);
}

function logError(errorMsg, e) {
  console.warn(errorMsg, e);
  if (typeof dtrum !== "undefined") dtrum.reportError(e);
}

function errorbox(e) {
  var errorMsg = ""
  if (e instanceof Error)
    errorMsg = "ERROR! " + e.name + ": " + e.message;
  if (typeof e == "string")
    errorMsg = e;
  $("#errorBox").html(errorMsg);
  $("#errorBox").show();
  logError(errorMsg, e);
}

function warningbox(e) {
  var errorMsg = ""
  let $errorBox = $("#errorBox");
  if (e instanceof Error)
    errorMsg = "WARNING: " + e.name + ": " + e.message;
  if (typeof e == "string")
    errorMsg = e;
  $errorBox.html(errorMsg);
  $errorBox.addClass("info");
  $errorBox.show();
  console.log(errorMsg);
  //if (typeof dtrum !== "undefined") dtrum.reportError(errorMsg);
}


function drawTimeInterval(v) {
  let timeList = "";

  timeTable.forEach(function (t) {
    if (typeof t.MyTime !== "undefined")
      timeList += "<option value='" + t.MyTime + "'>" + t.MyTime + "</option>";
  });
  $("#MyTime").html(timeList);
  $("#MyTime").val(v);
  MyTimeChangeHandler();
}

function popup(inputs, popupHeader, desc) {
  bcBuffer = $("#bcwrapper").html();
  let deferred = new $.Deferred();
  let html = "<div id='popup'>" +
    "<span class='header'>" + popupHeader + "</span>" +
    "<table>";

  inputs.forEach(function (i) {
    html += `<tr><td>${i.label}: </td>`;
    html += `<td><input name='${i.name}' value='${i.value}' type='${"type" in i ? i.type : "text"}'></td></tr>`;
  });

  html += "<tr><td colspan=2 class='desc'>" + desc + "</td></tr>";
  html += "<tr><td colspan=2><input type='button' name='ok' value='Ok' id='popup_ok'></td></tr></table></div>";
  $("#viewport").append(html);
  $("#popup").css('z-index', ++popupZindex);
  $("#popup_ok").on("click", function () { popout(deferred); });

  return deferred;
}

function popupHTML(popupHeader, content) {
  bcBuffer = $("#bcwrapper").html();
  let html = `<div class='popupHTML'>
    <div class='x_box'><a id='x_c'>x</a></div>
    <h3>${popupHeader}</h3>
    ${content}
    </div>`;
  $("#viewport").append(html);
  $(".popupHTML").css('z-index', ++popupZindex);
  $(".popupHTML").show();
}

function popupHTMLDeferred(popupHeader, content, resultFunction = getAllInputData) {
  let p = $.Deferred();
  //bcBuffer = $("#bcwrapper").html();
  let html = `<div class='popupHTML'>
    <div class='x_box'><a id='x_c'>x</a></div>
    <h3>${popupHeader}</h3>
    ${content}
    <div class="doneBar"><input type="button" class="done" value="Done"></div>
    </div>`;
  let popup = $(html).appendTo("#viewport");
  popup.css('z-index', ++popupZindex);
  popup.show();
  popup.find("input.done").on("click", function (e) {
    let data = resultFunction(popup);
    //popup.find("input,select").each(function(i,e) { data[e.id] = $(this).val() });
    popup.remove();
    popupZindex--;
    p.resolve(data);
  })
  popup.find("#x_c").on("click", function (e) {
    p.resolve();
  })
  return p;
}

function popout(popup_p) {
  let outputs = [];
  $("#popup input").each(function () {
    let output = {};
    switch ($(this).attr('type')) {
      case 'file':
        output = {
          name: $(this).attr('name'),
          file: $(this).prop('files')[0]
        };
        break;
      default:
        output = {
          name: $(this).attr('name'),
          val: $(this).val()
        };
    }
    outputs.push(output);
  });
  $("#popup").remove();

  popup_p.resolve(outputs);
  popupZindex--;
}

function buildFilterClause(selectors) {
  let continent = $(selectors[0]).val();
  let country = $(selectors[1]).val();
  let region = $(selectors[2]).val();
  let city = $(selectors[3]).val();
  let key = $(selectors[4]).val();
  let type = (($(selectors[5]).length > 0) ?
    $(selectors[5])[0].dataset['colname'] :
    undefined);
  let val = $(selectors[6]).val();
  let filterClause = "";
  let filters = [];

  if (continent != '' && continent != null) filters.push('usersession.continent="' + continent + '"');
  if (country != '' && country != null) filters.push('usersession.country="' + country + '"');
  if (region != '' && region != null) filters.push('usersession.region="' + region + '"');
  if (city != '' && city != null) filters.push('usersession.city="' + city + '"');
  if (key != '' && type != '' && val != '' &&
    key != null && type != null && val != null)
    filters.push(type + '.' + key + '="' + val + '"');

  filterClause = filters.length > 0 ?
    " AND (" + filters.join(" AND ") + ")" :
    "";

  return filterClause;
}

function autoTagBox(tech) {
  let p1 = getAutoTags();
  let p2 = getMZs();
  $.when(p1, p2).done(function (d1, d2) {
    parseAutoTags(d1[0]);
    processMZs(d2[0]);

    if (autoTags.findIndex(({ name }) => name === tech) < 0) {
      $("#tagStatus").html("<p>❌ " + tech + "AutoTag missing!</p><input type='button' id='deployAutoTag' data-tech='" + tech + "' value='Deploy AutoTag'>");
    } else {
      $("#tagStatus").html("<p>✅ " + tech + "AutoTag in place</p>");
    }

    if (MZs.findIndex(({ name }) => name === tech + " Overview") > -1) {
      let MZ = MZs.find(({ name }) => name === tech + " Overview");
      $("#MZStatus").html("<p>✅ " + tech + " Overview MZ found, using that</p>" +
        "<input type='hidden' id='mz' value='" + MZ.id + "'>" +
        "<input type='hidden' id='mzname' value='" + MZ.name + "'>"
      );
    } else {
      $("#MZStatus").html("<p>❌ " + tech + " Overview MZ not found!</p>" +
        "Pick an existing MZ: <select id='mzlist'></select><br>" +
        "or <input type='button' id='deployMZ' data-tech='" + tech + "' value='Deploy MZ'>");
      drawMZs()
        .done(function () {
          if ("mz" in selection.config)
            $("#mzlist").val(selection.config.mz);
        });
    }
  });
}

function drawServiceSelect(data, selector) {
  let html = "";
  data.forEach(function (s) {
    html += `<option value="${s.entityId}">${s.displayName}</option>`;
  });
  $(selector).html(html);
}

function getConnectInfo(full = false) {
  let p0 = $.Deferred();
  if (url == "" || token == "") {
    let p1 = $.get("html/connect.html");
    $.when(p1).done(function (content) {
      let p2 = popupHTMLDeferred("API Connection", content);

      $.when(p2).done(function (inputs) {
        url = inputs.url.toLowerCase();
        if (url.length > 1 && url.charAt(url.length - 1) == "/")
          url = url.substring(0, url.length - 1);
        if (url.length > 1 && !url.startsWith("https://"))
          url = "https://" + url;
        token = inputs.token;
        githubuser = inputs.githubuser;
        githubpat = inputs.githubpat;
        if (full) {
          let p3 = createFullConnection();
          return $.when(p3).done(function () { return p0.resolve(); });
        } else return p0.resolve();
      });
      return p0;
    });
  } else {
    p0.resolve();
  }
  return p0;
}

function getTestApp() {
  let p0 = $.Deferred();
  let content = `<div id="testAppDiv">
  <div class="inputHeader">App to test against:</div>
  <div class="userInput"><select id="testAppId"></select></div>
  </div>`;

  let p1 = getApps();
  $.when(p1).done(function (apps) {
    let p2 = popupHTMLDeferred("Test App", content);
    drawApps(apps, {}, "#testAppId");
    $.when(p2).done(function (inputs) {
      let appName = apps.find(x => x.entityId == inputs.testAppId).displayName;
      p0.resolve({ id: inputs.testAppId, name: appName });
    });
  });
  return p0;
}

function getAllInputData(popup) {
  let data = {};
  popup.find("input:not([type=checkbox]),select").each(function (i, e) { data[e.id] = $(this).val() });
  popup.find("input[type=checkbox]").each(function (i, e) { data[e.id] = $(this).is(":checked") });
  return data;
}

function drawWorkflowPagerButton(workflowSelector = "#workflow") {
  let $workflow = $(workflowSelector);
  let pages = $workflow.find(".workflowPage").length;
  let activePageNum = $workflow.find(".workflowPage.activePage").index();
  let $button = $("#workflowButton");
  let html;
  if (activePageNum < pages) {
    html = `<input type="button" id="workflowButton" value="Next">`;
  } else {
    html = `<input type="button" id="workflowButton" value="Done">
      <section><a class="expandable" id="workflowAdvanced">Advanced</a><article>
        <div id="workflowAdvancedArticle">
          <div>
            <div><b>Dashboard owner:</b></div>
            <div>
              <input type="radio" id="owner_token" name="owner" value="${owner}" checked>
              <label for="owner_token">${owner}</label>
            </div>
            <div>
              <input type="radio" id="owner_admin" name="owner" value="owner_admin">
              <label for="owner_admin">admin</label>
            </div>
            <div>
              <input type="radio" id="owner_other" name="owner" value="owner_other">
              <label for="owner_other">Other: <input id="other"></label>
            </div>
          </div>
          <div>
            <div><b>Sharing:</b></div>
            <div>
              <input type="checkbox" id="shared" checked>
              <label for="shared">Share dashboard</label>
            </div>
            <div>
              <input type="checkbox" id="published" checked>
              <label for="published">Publish dashboard</label>
            </div>
          </div>
          <div>
            <div><b>Additional tags:</b></div>
            <div>
              <div id="tag_list"></div>
              <div>
                <label for="new_tag">Tag:</label>
                <input id="new_tag" placeholder="newtag">
                <input type="button" id="new_tag_add" value="+">
              </div>
            </div>
          </div>
        </div>
      </article></section>
    `;
  }

  if ($button.length) {
    $button.remove();
  }
  $workflow.append(html);
  $(`#other`).on('focus', () => {
    $(`#owner_other`).prop('checked', 'checked');
  });
  $(`#new_tag_add`).on('click', () => {
    let $new_tag = $(`#new_tag`);
    let newtag = $new_tag.val().trim();
    $new_tag.val('');
    if (typeof (selection.additionalTags) == "undefined") selection.additionalTags = [];
    selection.additionalTags.push(newtag);
    let $tag_list = $(`#tag_list`);
    let $dttag = $('<div>')
      .addClass('dttag')
      .html(newtag)
      .appendTo($tag_list);
    let $x = $('<span>')
      .addClass('dttag_x')
      .text('x')
      .appendTo($dttag);
    $x.on('click', e => {
      let $el = $(e.target);
      let oldtag = $el.parent().text().replace(/x$/,'');
      $(`#new_tag`).val(oldtag);
      $el.parent().remove();
    })
  });
}

function updateDashboardButton() {
  if (dbList.length > 0) {
    $("#dbbutton img").attr("src", "images/dashboard.svg");
  } else {
    $("#dbbutton img").attr("src", "images/desktop.svg");
  }
}

function compareWorkflowVsRepo(tester) {
  let config = selection.config || {};
  let main = $.Deferred();
  let deferreds = [];
  let repo = { owner: config.githubUser, repo: config.githubRepo, path: config.githubPath };
  let overview = dbList.find(x => x.name === config.overviewDB &&
    x.repo.owner === repo.owner && x.repo.repo === repo.repo && x.repo.path === repo.path);

  //load specified repo if not already
  if (typeof overview == "undefined" && typeof repo.owner != "undefined") {
    if (!repoList.find(x => x.repo.owner === repo.owner && x.repo.repo === repo.repo && x.repo.path === repo.path))
      repoList.push(repo);
    let p_i = getRepoContents(repo);
    deferreds.push(p_i);
    $.when(p_i).done(function (data_i) {
      let old = { dbList: dbList, readmeList: readmeList, workflowList: workflowList };
      let result = parseRepoContents(data_i, repo, old)
      dbList = dbList.concat(result.dbList);
      readmeList = readmeList.concat(result.readmeList);
      workflowList = workflowList.concat(result.workflowList);
      let moreDeferreds = downloadDBsFromList();
      deferreds = deferreds.concat(moreDeferreds);
      $.when.apply($, deferreds).done(function () {
        main.resolve();
        updateDashboardButton();
        //updateLocalStorage();
      })
    });
  } else main.resolve();

  //build html
  $.when(main).done(function () {
    if (typeof overview == "undefined")
      overview = dbList.find(x => x.name === config.overviewDB &&
        x.repo.owner === repo.owner && x.repo.repo === repo.repo && x.repo.path === repo.path);
    let tokens = Array.from(new Set([...scanForTokens(overview)])).sort();
    let html = `<div id="testCompareWorkflow"><div>Workflow Tokens:<br>
      <table class="workflow dataTable">
      <thead><tr><td>From</td><td>To</td></tr></thead>`;
    selection.swaps
      .sort((a, b) => a.from.toLowerCase() > b.from.toLowerCase() ? 1 : -1)
      .forEach(x => {
        let match = (tokens.includes(x.from)) ? "match" : "notmatch";
        html += `<tr class="${match}"><td>${x.from}</td><td>${x.to}</td></tr>`;
      });
    html += `</table></div>`;

    if (tokens.length) {
      html += `<div>Dashboard tokens:<br>
      <table class="dashboard dataTable">
      <thead><tr><td>From</td></tr></thead>`;
      let swapFroms = selection.swaps.map(x => x.from);
      tokens.forEach(x => {
        let match = (swapFroms.includes(x)) ? "match" : "notmatch";
        html += `<tr class="${match}"><td>${x}</td></tr>`;
      });
      html += `</table></div>`;
    }

    let entIDs = Array.from(new Set([...scanForEntIDs(overview)])).sort();
    if (entIDs.length) {
      html += `<div>Potential EntityIDs:<br>
      <table class="dashboard dataTable">
      <thead><tr><td>Found</td></tr></thead>`;
      entIDs.forEach(x => {
        html += `<tr class="notmatch"><td>${x}</td></tr>`;
      });
      html += `</table></div>`;
    }

    html += `</div>`;
    popupHTMLDeferred("Test Results", html)
      .then(() => {
        $(tester).remove(); //Kill window underneath
        selection.testModePromise.resolve(); //restore main workflow
      });

  });

}
/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
//functions & defaults for workflowBuilder
function workflowBuilderHandlers() {
    //menubar links
    $("#viewport").on("click", "#workflowAddSection", workflowAddSection);
    $("#viewport").on("click", "#workflowConfigButton", workflowConfiguration);
    $("#viewport").on("click", "#workflowTestButton", workflowTest);
    $("#viewport").on("click", "#workflowDownloadButton", workflowDownloader);
    $("#viewport").on("click", "#workflowUploadButton", workflowUploader);
    $("#viewport").on("click", "#workflowPageDown", workflowPrevPage);
    $("#viewport").on("click", "#workflowPageNum", function (e) { });
    $("#viewport").on("click", "#workflowPageUp", workflowNextPage);
    $("#viewport").on("click", "#workflowPageAdd", workflowAddPage);
    $("#viewport").on("click", "#workflowPageDelete", workflowDeletePage);

    //show/hide popups
    $("#viewport").on("focus", ".workflowSection", function () {
        $(this).find(".workflowSectionPopup").removeClass("hidden");
    });
    $("#viewport").on("blur", ".workflowSection, .workflowSectionPopup", function (e) {
        closeIfFocusedElsewhere(e, ".workflowSectionPopup");
    });
    $("#viewport").on("focus", ".workflowInput", function (e) {
        $(this).find(".workflowInputPopup").removeClass("hidden");
    });
    $("#viewport").on("blur", ".workflowInput, .workflowInputPopup", function (e) {
        closeIfFocusedElsewhere(e, ".workflowInputPopup");
    });

    //sectionpopup links
    $("#viewport").on("click", ".workflowSectionAddInput", workflowSectionAddInput);
    $("#viewport").on("click", ".workflowSectionDelete", function (e) {
        $(this).parents(".workflowSection").remove();
    });
    $("#viewport").on("click", ".workflowSectionUp", function (e) {
        let clonedEl = $(this).parents(".workflowSection");
        clonedEl.prev(".workflowSection").insertAfter(clonedEl);
    });
    $("#viewport").on("click", ".workflowSectionDown", function (e) {
        let clonedEl = $(this).parents(".workflowSection");
        clonedEl.next(".workflowSection").insertBefore(clonedEl);
    });

    //inputpopup links
    $("#viewport").on("click", ".workflowInputDelete", function (e) {
        $(this).parents(".workflowInput").remove();
    });
    $("#viewport").on("click", ".workflowInputUp", function (e) {
        let clonedEl = $(this).parents(".workflowInput");
        clonedEl.prev(".workflowInput").insertAfter(clonedEl);
    });
    $("#viewport").on("click", ".workflowInputDown", function (e) {
        let clonedEl = $(this).parents(".workflowInput");
        clonedEl.next(".workflowInput").insertBefore(clonedEl);
    });

    //newInput buttons
    $("#viewport").on("change", "#inputType", inputTypeChangeHandler);
    $("#viewport").on("change", "#commonQueries", commonQueryChangeHandler);
    $("#viewport").on("change", "#usqlCommonQueries", usqlCommonQueryChangeHandler);
    $("#viewport").on("change", "#multiple", multipleHandler);
    $("#viewport").on("click", "#test", testHandler);
    $("#viewport").on("click", "#staticBoxAdd", staticBoxAddHandler);

    //prevent rich text paste
    $("#viewport").on("paste", "[contenteditable]", pasteFixer);
}

function workflowAddSection() {
    let sections = $(".activePage .workflowSections");
    let newSection = new Section();
    sections.append(newSection.html);
    $(".workflowSectionPopup, .workflowInputPopup").addClass("hidden");
}

function workflowSectionAddInput() {
    let section = $(this).parents(".workflowSection");
    let newInput = new Input();
    let p = newInput.prompt();
    $.when(p).done(function (newInput) {
        section.append(newInput);
        $(".workflowSectionPopup, .workflowInputPopup").addClass("hidden");
    });
}

function closeIfFocusedElsewhere(e, selector) {
    let from = $(e.currentTarget);
    let to = e.relatedTarget;
    if (from.has(to).length > 0) {
        return e; //still within
    } else {
        from.find(selector).delay(500).addClass("hidden"); //outside, let's go
    }
}

function WorkflowPage() {
    this.html = `
    <div class="workflowPage"><div class="workflowSections"></div></div>
    `;
}

function Section() {
    this.html = `
    <div class="workflowSection" tabindex="0">
        <div class="workflowSectionPopup">
            <div><a href="#workflowBuilder" class="workflowSectionAddInput">+</a></div>
            <div><a href="#workflowBuilder" class="workflowSectionDelete">❌</a></div>
            <div><a href="#workflowBuilder" class="workflowSectionUp">🔼</a></div>
            <div><a href="#workflowBuilder" class="workflowSectionDown">🔽</a></div>
        </div>
        <h3 contenteditable="true">Title</h3>
    </div>`;
}

function Input() {
    this.html = "";

    this.prompt = function () {
        let p0 = $.Deferred();
        let p1 = $.get("html/personaFlow/workflowBuilder-newInput.html");
        $.when(p1).done(function (content) {
            let p2 = popupHTMLDeferred("New Input", content);
            $(".doneBar").append(`<div id="inputInfoBox"></div>`);
            inputTypeChangeHandler();

            $.when(p2).done(function (data) {
                let input = "";
                switch (data.inputType) {
                    case "Text Input":
                        input = `<input class="workflowInput" placeholder="${data.placeholder}" value="${data.defaultvalue}" disabled>`;
                        break;
                    case "Select (API)":
                        input = `<select class="workflowSelect" disabled ${data.multiple}></select>
                        <input type="hidden" class="apiQuery" value="${data.apiQuery}">
                        <input type="hidden" class="apiResultSlicer" value="${data.apiResultSlicer}">
                        `;
                        break;
                    case "Select (USQL)":
                        input = `<select class="workflowSelect" disabled ${data.multiple}></select>
                        <input type="hidden" class="usqlQuery" value="${data.usqlQuery}">
                        <input type="hidden" class="usqlResultSlicer" value="${data.usqlResultSlicer}">
                        `;
                        break;
                    case "Select (static)":
                        input = `<select class="workflowSelect" data-options='${data.staticOptions}' disabled ${data.multiple}></select>
                        `;
                        break;
                    case "Funnel":
                        input = `<h1>Giant funnel graphic here</h1>`;
                        break;
                    case "Checkboxes":
                        input = `<input class="workflowCheck" type="checkbox" placeholder="Friendly Name" disabled>
                        <input type="hidden" class="apiQuery" value="${data.apiQuery}">`;
                        break;
                }
                let header = `${data.transform.charAt(0).toUpperCase()}${data.transform.slice(1)}:`;
                this.html = `
                <div class="workflowInput" tabindex="0">
                    <div class="workflowInputPopup">
                        <div><a href="#workflowBuilder" class="workflowInputDelete">❌</a></div>
                        <div><a href="#workflowBuilder" class="workflowInputUp">🔼</a></div>
                        <div><a href="#workflowBuilder" class="workflowInputDown">🔽</a></div>
                    </div>
                    <div class="inputHeader" contenteditable="true">${header}</div>
                    <div class="userInput">${input}</div>
                    <div class="transform">&dollar;{<span contenteditable="true">${data.transform}</span>}</div>
                </div>`
                p0.resolve(this.html);
            });
        });
        return p0;
    }
}

function inputTypeChangeHandler() {
    $("#apiQueryBox").hide();
    $("#usqlQueryBox").hide();
    $("#newInputResult").hide();
    $("#newInputPreview").hide();
    $("#staticBox").hide();
    $("#multiBox").hide();
    $("#textInputBox").hide();
    $("#inputInfoBox").hide();
    $("#apiQueryHeader").text();
    $("#preview").html();
    $("#preview").off();


    switch ($("#inputType").val()) {
        case "Text Input":
            $("#textInputBox").show();
            break;
        case "Select (API)":
            $("#apiQueryBox").show();
            $("#newInputResult").show();
            $("#newInputPreview").show();
            $("#multiBox").show();
            break;
        case "Select (USQL)":
            $("#usqlQueryBox").show();
            $("#newInputResult").show();
            $("#newInputPreview").show();
            $("#multiBox").show();
            $("#inputInfoBox").html(`<img src="images/light-bulb-yellow_300.svg">
            Be sure the replacement token in query is filled on a prior page.`);
            $("#inputInfoBox").show();
            break;
        case "Select (static)":
            $("#staticBox").show();
            let html = `<select id="staticPreview"></select>`;
            $("#preview").html(html);
            $("#newInputPreview").show();
            $("#multiBox").show();
            break;
        case "Checkboxes":
            break;
        case "KUA Funnel":
            break;
    }
}

function commonQueryChangeHandler() {
    let commonQueries = $("#commonQueries").val();

    switch (commonQueries) {
        case "Apps":
            $("#apiQuery").val("/api/v1/entity/applications?includeDetails=false");
            $("#apiResultSlicer").val("{entityId:displayName}");
            $("#transform").val("app");
            break;
        case "MZs":
            $("#apiQuery").val("/api/config/v1/managementZones");
            $("#apiResultSlicer").val("values:{id:name}");
            $("#transform").val("mz");
            break;
        case "Hosts":
            $("#apiQuery").val("/api/v1/entity/infrastructure/hosts?includeDetails=true");
            $("#apiResultSlicer").val("{entityId:displayName}");
            $("#transform").val("host");
            break;
        case "Autotags":
            $("#apiQuery").val("/api/config/v1/autoTags");
            $("#apiResultSlicer").val("values:{id:name}");
            $("#transform").val("autotag");
            break;
        case "Services":
            $("#apiQuery").val("/api/v1/entity/services?includeDetails=false");
            $("#apiResultSlicer").val("{entityId:displayName}");
            $("#transform").val("service");
            break;

    }
}

function usqlCommonQueryChangeHandler() {
    let commonQueries = $("#usqlCommonQueries").val();

    switch (commonQueries) {
        case "Double/Long USPs":
            $("#usqlQuery").val('SELECT usersession.longProperties, usersession.doubleProperties FROM useraction WHERE useraction.application = "${app.key}" LIMIT 5000');
            $("#usqlResultSlicer").val("Keys");
            $("#transform").val("usp");
            break;
        case "String/Date USPs":
            $("#usqlQuery").val('SELECT usersession.stringProperties, usersession.dateProperties FROM useraction WHERE useraction.application = "${app.key}" LIMIT 5000');
            $("#usqlResultSlicer").val("Keys/Values");
            $("#transform").val("usp");
            break;
        case "Regions":
            $("#usqlQuery").val('SELECT DISTINCT country, region, city FROM usersession WHERE useraction.application = "${app.key}" ORDER BY country,region,city LIMIT 5000');
            $("#usqlResultSlicer").val("ValX3");
            $("#transform").val("region");
            break;
    }
}

function testHandler() {
    let inputType = $("#inputType").val();
    $("#preview, #swaps").html("");
    $("#preview").off();
    switch (inputType) {
        case "Select (API)":
            testAPIhandler();
            break;
        case "Select (USQL)":
            testUSQLhandler();
            break;
    }
}

function testAPIhandler() {
    let p0 = getConnectInfo();

    $.when(p0).done(function () {
        let query = $("#apiQuery").val();
        $("#apiQueryHeader").text(query);
        let multiple = $("#multiple").prop("checked") ? "multiple" : "";
        $("#preview").html(`<select ${multiple}></select>`);
        let $target = $("#preview select");
        let slicer = $("#apiResultSlicer").val();
        let p = loadApiQueryOptions(query, slicer, $target);
        $.when(p).done(function (data) {
            jsonviewer(data, true, "", "#apiResult");
        });
    });
}

function testUSQLhandler() {
    let p0 = getConnectInfo();

    $.when(p0).done(function () {
        let p1 = getTestApp();

        $.when(p1).done(function (appName) {
            let usql = $("#usqlQuery").val();
            usql = usql.replace("${app.key}", appName);
            let query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
            let slicer = $("#usqlResultSlicer").val();
            let $target = $("#preview");
            $("#apiQueryHeader").text(query);
            let p2 = loadUsqlQueryOptions(query, slicer, $target)
            $.when(p2).done(function (data) {
                jsonviewer(data, true, "", "#apiResult");
            });
        });
    });
}

function staticBoxAddHandler() {
    let key = $("#staticBoxLabel").val();
    let val = $("#staticBoxValue").val();

    let clonedEl = $(`<option value="${val}">${key}</option>`);
    clonedEl.appendTo("#staticPreview");
    $("#staticPreview").val(val);
    $("#staticBoxLabel").val("");
    $("#staticBoxValue").val("");

    let vals = $("#staticOptions").val();
    if (vals.length < 1) vals = "[]";
    let staticOptions = JSON.parse(vals);
    let newOption = {};
    newOption[key] = val;
    staticOptions.push(newOption);
    $("#staticOptions").val(JSON.stringify(staticOptions));
}

function multipleHandler() {
    let multiple = $("#multiple").prop("checked") ? "multiple" : "";
    $("#multiple").val(multiple);
}

function workflowDownloader() {
    let workflow = {};
    workflow['html'] = $("#workflow").prop("outerHTML");
    let config = $("#workflowConfigJSON").val();
    if (config.length > 0) workflow['config'] = JSON.parse(config);
    let name = workflow.config.workflowName;
    let filename = `${name}.cwf.json`;
    let text = JSON.stringify(workflow);

    download(filename, text);
}

function workflowConfiguration() {
    let p0 = $.Deferred();
    let oldConfigVal = $("#workflowConfigJSON").val();
    let oldConfig = {};
    if (oldConfigVal.length > 0) oldConfig = JSON.parse(oldConfigVal);

    let p1 = $.get("html/personaFlow/workflowBuilder-config.html");
    $.when(p1).done(function (content) {
        let p2 = popupHTMLDeferred("Workflow Configuration", content);
        let html = "";
        personas.forEach(function (e) {
            html += `<option>${e.name}</option>`;
        })
        $("#persona").html(html);

        html = "";
        usecases.forEach(function (e) {
            html += `<option>${e.name}</option>`;
        });
        $("#usecase").html(html);

        for (const prop in oldConfig) {
            if (prop.length > 0) { //handle empty string props
                $(`#${prop}`).val(oldConfig[prop]);
            }
        }

        $.when(p2).done(function (data) {
            let newConfig = JSON.stringify(data);
            $("#workflowConfigJSON").val(newConfig);
            p0.resolve();
        })
    });
}

function workflowUploader() {
    let p0 = $.Deferred();

    //get file from a popup
    let popupHeader = "Workflow to upload";
    let inputs = [{ type: 'file', name: 'workflowFile', value: '', label: "JSON&nbsp;file" }];
    let desc = "Previously downloaded .cwf.json file";

    let popup_p = popup(inputs, popupHeader, desc);
    $.when(popup_p).done(function (data) {
        let file = data.find(obj => obj.name == "workflowFile").file;
        fr = new FileReader();
        fr.onload = function () {
            let res = fr.result;
            let json = JSON.parse(res);
            let html = sanitizer.sanitize(json.html);
            $("#workflow").html(html);
            workflowSetFirstPageActive();
        };
        if (typeof file !== "undefined") fr.readAsText(file);
    });
}

function updatePageListing() {
    let pages = $("#workflow").find(".workflowPage").length;
    let activePageNum = $("#workflow").find(".workflowPage.activePage").index();
    $("#workflowPageNum").text(`${activePageNum} / ${pages}`);
}

function workflowAddPage() {
    let workflow = $("#workflow");
    let newPage = new WorkflowPage();
    workflow.append(newPage.html);
    workflowNextPage();
    updatePageListing();
}

function workflowDeletePage() {
    let active = $("#workflow").find(".workflowPage.activePage").index();
    workflowPrevPage();
    $(`#workflow .workflowPage:nth-of-type(${active})`).remove();
    let pages = $("#workflow").find(".workflowPage").length;
    if (pages < 1) workflowAddPage();
    updatePageListing();
}

function workflowSetFirstPageActive() {
    $("#workflow").find(".workflowPage").removeClass("activePage");
    $("#workflow").find(".workflowPage:first-of-type").addClass("activePage");
    updatePageListing();
}

function workflowNextPage() {
    let pages = $("#workflow").find(".workflowPage").length;
    let active = $("#workflow").find(".workflowPage.activePage");
    let activePageNum = active.index();
    let newPageNum = Math.min(activePageNum + 1, pages);
    let newPage = $(`#workflow .workflowPage:nth-of-type(${newPageNum})`);

    active.removeClass("activePage");
    newPage.addClass("activePage");
    updatePageListing();

    return newPage;
}

function workflowPrevPage() {
    let active = $("#workflow").find(".workflowPage.activePage");
    let activePageNum = active.index();
    let newPageNum = Math.max(activePageNum - 1, 1);
    let newPage = $(`#workflow .workflowPage:nth-of-type(${newPageNum})`);

    active.removeClass("activePage");
    newPage.addClass("activePage");
    updatePageListing();
}

function workflowTest() {
    let p = renderWorkflow($("#workflow"));
    $("#workflow").attr("id", "workflowInactive");
    $.when(p).done(function (renderedHTML) {
        let p1 = popupHTMLDeferred("Testing Workflow", renderedHTML);
        $(".doneBar").hide();
        workflowSetFirstPageActive();
        let activePage = $("#workflow .workflowPage.activePage");
        renderWorkflowPage(activePage);
        drawWorkflowPagerButton();
        $.when(p1).done(function () {
            $("#workflowInactive").attr("id", "workflow");
        });
    });

}

function renderWorkflow(el) {
    let p = new $.Deferred();
    let promises = [];

    let $el = $(el);
    let clonedEl = $el.clone();

    clonedEl.find(".workflowInputPopup").remove();
    clonedEl.find(".workflowSectionPopup").remove();
    clonedEl.find("input[type=text]:disabled, input:not([type]):disabled").removeAttr("disabled");
    clonedEl.find("[contenteditable]").removeAttr("contenteditable");
    clonedEl.find(".transform").hide();

    let html = sanitizer.sanitize(clonedEl.wrap("<div></div>").parent().html());
    p.resolve(html);

    return p;
}

function renderWorkflowPage(el) {
    let p = new $.Deferred();
    let promises = [];

    let $el = $(el);

    //execute API queries here, then enable
    $el.find(".apiQuery").each(function () {
        let p1 = loadApiQuery($(this));
        promises.push(p1);
    });
    $el.find(".usqlQuery").each(function () {
        let p1 = loadUsqlQuery($(this));
        promises.push(p1);
    });

    //make sure any XHRs are finished before we return the html
    $.when.apply($, promises).done(function () {
        let html = sanitizer.sanitize($el.html());
        p.resolve(html);
    })

    return p;
}

function loadApiQuery($query) {
    $query = $($query);
    let query = $query.val();
    let slicer = $query.siblings(".apiResultSlicer").val();
    let $target = $query.siblings(".workflowSelect");
    if (typeof selection.swaps !== "undefined") queryDoSwaps(query, selection.swaps);
    if (!query.match(/^\/api\//)) {
        console.log(`invalid api query: ${query}`);
        return;
    }
    let p1 = loadApiQueryOptions(query, slicer, $target);
    return $.when(p1).done(function () { });
}

function loadUsqlQuery($query) {
    $query = $($query);
    let query = $query.val();
    let slicer = $query.siblings(".usqlResultSlicer").val();
    let $target = $query.siblings(".workflowSelect");
    if (typeof selection.swaps !== "undefined") queryDoSwaps(query, selection.swaps);
    if (!query.match(/^\/SELECT\//i)) {
        console.log(`invalid usql query: ${query}`);
        return;
    }
    let p1 = loadUsqlQueryOptions(query, slicer, $target);
    return $.when(p1).done(function () { });
}

function loadApiQueryOptions(query, slicer, target) {
    let $target = $(target);
    let p1 = dtAPIquery(query);
    return $.when(p1).done(function (data) {
        jsonviewer(data, true, "", "#apiResult");
        let parsedResults = sliceAPIdata(slicer, data);
        let optionsHTML = "";
        if (parsedResults.length > 0) {
            parsedResults.forEach(function (i) {
                optionsHTML += `<option value="${i.value}">${i.key}</option>`;
            });
        }
        $target.html(optionsHTML);
        $target.removeAttr("disabled");
        $target.on("change", previewChangeHandlerKeyVal);
        previewChangeHandlerKeyVal($target);
    });
}

function loadUsqlQueryOptions(query, slicer, target) {
    let $target = $(target);
    let p = dtAPIquery(query);
    return $.when(p).done(function (data) {
        jsonviewer(data, true, "", "#apiResult");
        sliceUSQLdata(slicer, data, $target);
        $target.removeAttr("disabled");
    });
}

function sliceAPIdata(slicer, data) {
    let parsedResults = [];
    switch (slicer) {
        case "{entityId:displayName}":
            if (data.length > 0) data.forEach(function (item) {
                parsedResults.push({ value: item.entityId, key: item.displayName });
            });
            break;
        case "values:{id:name}":
            if (typeof data.values == "object") data.values.forEach(function (item) {
                parsedResults.push({ value: item.id, key: item.name });
            });
            break;
    }
    return parsedResults;
}

function sliceUSQLdata(slicer, data, target) {
    let $target = $(target);
    let parsedResults = [];

    let previewHTML = "";
    let from = $("#transform").val();
    switch (slicer) {
        case 'parseUSPFilter':
            parsedResults = parseUSPFilter(data);
            break;
        case 'Keys':
            previewHTML = `
                <div class="inputHeader">Keys:</div>
                <div class="userInput"><select id="kpi" class="uspFilter"></select></div>
                `;
            $target.html(previewHTML);
            parsedResults = parseKPIs(data);
            $("#kpi").html(drawKPIs(parsedResults));
            $("#swaps").html();
            $target.on("change", "select", previewChangeHandlerKey);
            previewChangeHandlerKey($target);
            break;
        case 'Keys/Values':
            parsedResults = parseUSPFilter(data);
            previewHTML = `
                <div class="inputHeader">Keys:</div>
                <div class="userInput"><select id="uspKey" class="uspFilter"></select></div>
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="uspVal" class="uspFilter"></select></div>
                `;
            $target.html(previewHTML);
            $("#swaps").html(`
                <div class="inputHeader">From:</div>
                <div class="userInput">${'${' + from + '}'}</div>
                <div class="inputHeader">To:</div>
                <div class="userInput"><input id="filterClause"></div>
            `);
            uspFilterChangeHandler();
            break;
        case 'ValX3':
            parsedResults = parseRegions(data);
            previewHTML = `
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="countryList" class="regionFilter"></select></div>
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="regionList" class="regionFilter"></select></div>
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="cityList" class="regionFilter"></select></div>
                `;
            $target.html(previewHTML);
            $("#swaps").html(`
                <div class="inputHeader">From:</div>
                <div class="userInput">${'${' + from + '}'}</div>
                <div class="inputHeader">To:</div>
                <div class="userInput"><input id="filterClause"></div>
            `);
            regionsChangeHandler();
            break;
    }
    return parsedResults;
}

function pasteFixer(event) {
    let paste = (event.clipboardData || window.clipboardData).getData('text');

    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));

    event.preventDefault();
}

function previewChangeHandlerKeyVal(el) {
    let $el = (typeof el.length == "undefined" ? $(this) : $(el));
    let value = $el.val();
    let key = $el.children("option:selected").text();
    let fromkey = "${" + $("#transform").val() + ".key}";
    let fromval = "${" + $("#transform").val() + ".id}";

    let xform = `<b>from</b>:${fromkey}, <b>to</b>:${key}<br>
        <b>from</b>:${fromval}, <b>to</b>:${value}<br>`;
    $("#swaps").html(xform);
}

function previewChangeHandlerKey(el) {
    let $el = (typeof el.length == "undefined" ? $(this) : $(el));
    let value = $el.val();
    let key = $el.children("option:selected").text();
    let fromkey = "${" + $("#transform").val() + "}";

    let xform = `<b>from</b>:${fromkey}, <b>to</b>:${key}`;
    $("#swaps").html(xform);
}
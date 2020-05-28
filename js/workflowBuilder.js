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
        let el = $(this).parents(".workflowSection");
        el.prev(".workflowSection").insertAfter(el);
    });
    $("#viewport").on("click", ".workflowSectionDown", function (e) {
        let el = $(this).parents(".workflowSection");
        el.next(".workflowSection").insertBefore(el);
    });

    //inputpopup links
    $("#viewport").on("click", ".workflowInputDelete", function (e) {
        $(this).parents(".workflowInput").remove();
    });
    $("#viewport").on("click", ".workflowInputUp", function (e) {
        let el = $(this).parents(".workflowInput");
        el.prev(".workflowInput").insertAfter(el);
    });
    $("#viewport").on("click", ".workflowInputDown", function (e) {
        let el = $(this).parents(".workflowInput");
        el.next(".workflowInput").insertBefore(el);
    });

    //newInput buttons
    $("#viewport").on("change", "#inputType", inputTypeChangeHandler);
    $("#viewport").on("change", "#commonQueries", commonQueryChangeHandler);
    $("#viewport").on("change", "#usqlCommonQueries", usqlCommonQueryChangeHandler);
    $("#viewport").on("change", "#multiple", multipleHandler);
    $("#viewport").on("click", "#testAPI", testAPIhandler);
    $("#viewport").on("click", "#testUSQL", testUSQLhandler);
    $("#viewport").on("click", "#staticBoxAdd", staticBoxAddHandler);
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

                this.html = `
                <div class="workflowInput" tabindex="0">
                    <div class="workflowInputPopup">
                        <div><a href="#workflowBuilder" class="workflowInputDelete">❌</a></div>
                        <div><a href="#workflowBuilder" class="workflowInputUp">🔼</a></div>
                        <div><a href="#workflowBuilder" class="workflowInputDown">🔽</a></div>
                    </div>
                    <div class="inputHeader" contenteditable="true">New Header</div>
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
    $("#apiQueryHeader").text();
    $("#preview").html();

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
            break;
        case "Select (static)":
            $("#staticBox").show();
            let html = `<select id="staticPreview"></select>`;
            $("#newInputPreview").html(html);
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
            break;
        case "MZs":
            $("#apiQuery").val("/api/config/v1/managementZones");
            $("#apiResultSlicer").val("values:{id:name}");
            break;
        case "Hosts":
            $("#apiQuery").val("/api/v1/entity/infrastructure/hosts?includeDetails=true");
            $("#apiResultSlicer").val("{entityId:displayName}");
            break;
        case "Autotags":
            $("#apiQuery").val("/api/config/v1/autoTags");
            $("#apiResultSlicer").val("values:{id:name}");
            break;
        case "Services":
            $("#apiQuery").val("/api/v1/entity/services?includeDetails=false");
            $("#apiResultSlicer").val("{entityId:displayName}");
            break;

    }
}

function usqlCommonQueryChangeHandler() {
    let commonQueries = $("#usqlCommonQueries").val();

    switch (commonQueries) {
        case "Double/Long USPs":
            $("#usqlQuery").val('SELECT usersession.longProperties, usersession.doubleProperties FROM useraction WHERE useraction.application = "${app}" LIMIT 5000');
            $("#usqlResultSlicer").val("Keys");
            break;
        case "String/Date USPs":
            $("#usqlQuery").val('SELECT usersession.stringProperties, usersession.dateProperties FROM useraction WHERE useraction.application = "${app}" LIMIT 5000');
            $("#usqlResultSlicer").val("Keys/Values");
            break;
        case "Regions":
            $("#usqlQuery").val('SELECT DISTINCT country, region, city FROM usersession WHERE useraction.application = "${app}" ORDER BY country,region,city LIMIT 5000');
            $("#usqlResultSlicer").val("ValX3");
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
            usql = usql.replace("${app}", appName);
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

    let el = $(`<option value="${val}">${key}</option>`);
    el.appendTo("#staticPreview");
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
    let filename = `workflowname.cwf.json`;
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
            html += `<option>${e}</option>`;
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
    let renderedHTML = renderWorkflow($("#workflow"));
    popupHTML("Testing Workflow", renderedHTML);
}

function renderWorkflow(el) {
    el = el.clone();

    el.find(".workflowInputPopup").remove();
    el.find(".workflowSectionPopup").remove();
    el.find("input[type=text]:disabled, input:not([type]):disabled").removeAttr("disabled");
    el.find("[contenteditable]").removeAttr("contenteditable");
    el.find(".transform").hide();
    let html = sanitizer.sanitize(el.html());
    //TODO: execute API queries here, then enable
    el.find(".apiQuery").each(loadApiQuery);
    el.find(".usqlQuery").each(loadUsqlQuery);
    //TODO: add page handling
    return html;
}

function loadApiQuery() {
    let $query = $(this);
    let query = $query.val();
    let slicer = $query.siblings(".apiResultSlicer").val();
    let $target = $query.siblings(".workflowSelect");
    if (!query.match(/^\/api\//)) {
        console.log(`invalid api query: ${query}`);
        return;
    }
    loadApiQueryOptions(query, slicer, $target);
}

function loadUsqlQuery() {
    let $query = $(this);
    let query = $query.val();
    let slicer = $query.siblings(".usqlResultSlicer").val();
    let $target = $query.siblings(".workflowSelect");
    if (!query.match(/^\/SELECT\//i)) {
        console.log(`invalid usql query: ${query}`);
        return;
    }
    loadUsqlQueryOptions(query, slicer, $target);
}

function loadApiQueryOptions(query, slicer, $target) {
    let p = dtAPIquery(query);
    return $.when(p).done(function (data) {
        jsonviewer(data);
        let parsedResults = sliceAPIdata(slicer, data);
        let optionsHTML = "";
        if (parsedResults.length > 0) {
            parsedResults.forEach(function (i) {
                optionsHTML += `<option id="${i.id}">${i.value}</option>`;
            });
        }
        $target.html(optionsHTML);
        $target.removeAttr("disabled");
    });
}

function loadUsqlQueryOptions(query, slicer, $target) {
    let p = dtAPIquery(query);
    return $.when(p).done(function (data) {
        jsonviewer(data);
        let parsedResults = sliceUSQLdata(slicer, data, $target);
        $target.html(optionsHTML);
        $target.removeAttr("disabled");
    });
}

function sliceAPIdata(slicer, data) {
    let parsedResults = [];
    switch (slicer) {
        case "{entityId:displayName}":
            if (data.length > 0) data.forEach(function (item) {
                parsedResults.push({ id: item.entityId, value: item.displayName });
            });
            break;
        case "values:{id:name}":
            if (typeof data.values == "object") data.values.forEach(function (item) {
                parsedResults.push({ id: item.id, value: item.name });
            });
            break;
    }
    return parsedResults;
}

function sliceUSQLdata(slicer, data, $target) {
    let parsedResults = [];

    let previewHTML = "";
    switch (slicer) {
        case 'parseUSPFilter':
            parsedResults = parseUSPFilter(data);
            break;
        case 'Keys/Values':
            parsedResults = parseUSPFilter(data);
            previewHTML = `
                        <div class="inputHeader">Keys:</div>
                        <div class="userInput"><select id="uspKey" class="uspFilter"></select></div>
                        <div class="inputHeader">Values:</div>
                        <div class="userInput"><select id="uspVal" class="uspFilter"></select>
                        `;
            $target.html(previewHTML);
            uspFilterChangeHandler();
            break;
        case 'Keys':
            parsedResults = parseUSPFilter(data);
            previewHTML = `
                        <div class="inputHeader">Keys:</div>
                        <div class="userInput"><select id="uspKey" class="uspFilter"></select></div>
                        `;
            $target.html(previewHTML);
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
            regionsChangeHandler();
            break;
    }
    return parsedResults;
}
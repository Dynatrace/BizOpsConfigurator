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
    $("#viewport").on("change", "input[type=checkbox]", checkHandler);
    $("#viewport").on("click", "#test", previewHandler);
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
    let p = newInput.prompt(section);
    $.when(p).done(function (newInput) {
        //section.append(newInput);
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

    this.prompt = function (section) {
        let $section = $(section);
        let p0 = $.Deferred();
        let p1 = $.get("html/personaFlow/workflowBuilder-newInput.html");
        $.when(p1).done(function (content) {
            let p2 = popupHTMLDeferred("New Input", content);
            $(".doneBar").append(`<div id="inputInfoBox"></div>`);
            inputTypeChangeHandler();

            $.when(p2).done(function (data) {
                if (typeof data == "undefined") {
                    p0.resolve(null);
                    return;
                }
                let $newDiv = $(`
                <div class="workflowInput" tabindex="0">
                    <div class="workflowInputPopup">
                        <div><a href="#workflowBuilder" class="workflowInputDelete">❌</a></div>
                        <div><a href="#workflowBuilder" class="workflowInputUp">🔼</a></div>
                        <div><a href="#workflowBuilder" class="workflowInputDown">🔽</a></div>
                    </div>
                    <div class="inputHeader" contenteditable="true"></div>
                    <div class="userInput"></div>
                    <div class="transform">&dollar;{<span contenteditable="true"></span>}</div>
                </div>`);
                $section.append($newDiv);
                let $input = $newDiv.find(".userInput");
                let $header = $newDiv.find(".inputHeader");
                let $transform = $newDiv.find(".transform span");
                switch (data.inputType) {
                    case "Text Input": {
                        $(`<input class="workflowInput" disabled>`)
                            .attr("placeholder", data.placeholder)
                            .val(data.defaultvalue)
                            .appendTo($input);
                        break;
                    }
                    case "Select (API)": {
                        let $select = $(`<select class="workflowSelect" disabled></select>`);
                        if (data.multiple) $select.attr("multiple", "multiple").addClass("chosen-select");
                        $select.appendTo($input);
                        $(`<input type="hidden" class="apiQuery">`)
                            .val(data.apiQuery)
                            .appendTo($input);
                        $(`<input type="hidden" class="apiResultSlicer">`)
                            .val(data.apiResultSlicer)
                            .appendTo($input);
                        break;
                    }
                    case "Select (USQL)": {
                        let $select = $(`<select class="workflowSelect" disabled ${data.multiple ? "multiple" : ""}></select>`);
                        if (data.multiple) $select.attr("multiple", "multiple").addClass("chosen-select");
                        $select.appendTo($input);
                        $(`<input type="hidden" class="usqlQuery">`)
                            .val(data.usqlQuery)
                            .appendTo($input);
                        $(`<input type="hidden" class="usqlResultSlicer">`)
                            .val(data.usqlResultSlicer)
                            .attr("data-addWhereClause", data.addWhereClause)
                            .appendTo($input);
                        break;
                    }
                    case "Select (static)": {
                        let $select = $(`<select class="workflowSelect" disabled></select>`);
                        if (data.multiple) $select.attr("multiple", "multiple").addClass("chosen-select");
                        $select
                            .attr("data-options", data.staticOptions)
                            .appendTo($input);
                        break;
                    }
                    case "Journey Picker": {
                        $(`<img src="images/funnel.png" class="journeyPicker" data-addWhereClause="true">`)
                            .appendTo($input);
                            $(`<input type="hidden" class="journeyPicker">`)
                            .val(data.usqlResultSlicer)
                            .attr("data-addWhereClause", data.addWhereClause)
                            .appendTo($input);
                            $(`<input type="hidden" class="appTransform">`)
                            .val(data.app)
                            .appendTo($input);
                            $input.parent().find(".inputHeader, .tryitout").remove();
                        break;
                    }
                    case "Checkboxes": {
                        $(`<input class="workflowCheck" type="checkbox" disabled>`)
                            .attr("placeholder", "Friendly Name")
                            .appendTo($input);
                        $(`<input type="hidden" class="apiQuery">`)
                            .val(data.apiQuery)
                            .appendTo($input);;
                        break;
                    }
                    case "Markdown": {
                        let $div = $(`<div class="workflowMarkdown">`);
                        $div.append("<textarea>## Enter your text here...</textarea>")
                            .appendTo($input);
                        $input.parent().find(".inputHeader, .transform, .tryitout").remove();
                    }
                }
                $transform.text(data.transform);
                $header.text(data.transform.charAt(0).toUpperCase() + data.transform.slice(1) + ':');
                p0.resolve($newDiv);
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
    $("#whereClauseBox").hide();
    $("#textInputBox").hide();
    $("#inputInfoBox").hide();
    $("#apiQueryHeader").text();
    $("#preview").html();
    $("#preview").off();
    $("#appTransform").hide();


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
            $("#whereClauseBox").show();
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
        case "Journey Picker":
            $("#appTransform").show();
            break;
        case "Markdown":
            $(".transform").hide();
            break;
    }
}

function commonQueryChangeHandler() {
    let commonQueries = $("#commonQueries").val();
    $("#inputInfoBox").hide();

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
        case "Synthetics":
            $("#apiQuery").val("/api/v1/synthetic/monitors");
            $("#apiResultSlicer").val("{entityId:name}");
            $("#transform").val("synth");
            break;
        case "CustomMetric-RUM":
            $("#apiQuery").val("/api/config/v1/calculatedMetrics/rum");
            $("#apiResultSlicer").val("values:{id:name}");
            $("#transform").val("metricRum");
            break;
        case "CustomMetric-Mobile":
            $("#apiQuery").val("/api/config/v1/calculatedMetrics/mobile");
            $("#apiResultSlicer").val("values:{id:name}");
            $("#transform").val("metricMobile");
            break;
        case "CustomMetric-Service":
            $("#apiQuery").val("/api/config/v1/calculatedMetrics/service");
            $("#apiResultSlicer").val("values:{id:name}");
            $("#transform").val("metricService");
            break;
        case "CustomMetric-Log":
            $("#apiQuery").val("/api/config/v1/calculatedMetrics/log");
            $("#apiResultSlicer").val("values:{id:name}");
            $("#transform").val("metricLog");
            break;
        case "CustomMetric-Synthetic":
            $("#apiQuery").val("/api/config/v1/calculatedMetrics/synthetic");
            $("#apiResultSlicer").val("values:{id:name}");
            $("#transform").val("metricSynth");
            break;
        case "Application Methods":
            $("#apiQuery").val("/api/v1/entity/applications/${app.id}/baseline");
            $("#apiResultSlicer").val("ApplicationMethods");
            $("#transform").val("method");
            $("#inputInfoBox").html(`<img src="images/light-bulb-yellow_300.svg">
            Be sure the replacement token in query is filled on a prior page.`);
            $("#inputInfoBox").show();
            break;
    }
}

function usqlCommonQueryChangeHandler() {
    let commonQueries = $("#usqlCommonQueries").val();

    switch (commonQueries) {
        case "Double/Long USPs":
            $("#usqlQuery").val('SELECT usersession.longProperties, usersession.doubleProperties FROM useraction WHERE useraction.application = "${app.name}" LIMIT 5000');
            $("#usqlResultSlicer").val("Keys");
            $("#transform").val("usp");
            $("#addWhereClause").prop("checked", false);
            break;
        case "String/Date USPs":
            $("#usqlQuery").val('SELECT usersession.stringProperties, usersession.dateProperties FROM useraction WHERE useraction.application = "${app.name}" LIMIT 5000');
            $("#usqlResultSlicer").val("Keys/Values");
            $("#transform").val("uspClause");
            $("#addWhereClause").prop("checked", false);
            break;
        case "Regions":
            $("#usqlQuery").val('SELECT DISTINCT continent, country, region, city FROM usersession WHERE useraction.application = "${app.name}" ORDER BY country,region,city LIMIT 5000');
            $("#usqlResultSlicer").val("ValX3");
            $("#transform").val("regionClause");
            $("#addWhereClause").prop("checked", true);
            break;
        case "Key User Actions":
            $("#usqlQuery").val('SELECT useraction.name FROM useraction WHERE useraction.application = "${app.name}" AND keyUserAction = true LIMIT 5000');
            $("#usqlResultSlicer").val("actions");
            $("#transform").val("kua");
            $("#addWhereClause").prop("checked", true);
            break;
        case "Conversion Goals":
            $("#usqlQuery").val('SELECT useraction.matchingConversionGoals FROM useraction WHERE useraction.application = "${app.name}" AND matchingConversionGoals IS NOT NULL LIMIT 5000');
            $("#usqlResultSlicer").val("actions");
            $("#transform").val("goal");
            $("#addWhereClause").prop("checked", true);
            break;
    }
}

function previewHandler() {
    let inputType = $("#inputType").val();
    $("#preview, #swaps").html("");
    $("#preview").off();
    switch (inputType) {
        case "Select (API)":
            previewAPIhandler();
            break;
        case "Select (USQL)":
            previewUSQLhandler();
            break;
    }
}

function previewAPIhandler() {
    let p0 = getConnectInfo();

    $.when(p0).done(function () {
        let query = $("#apiQuery").val();
        let p1 = {};
        if (query.match(/\${.+}/))
            p1 = getTestApp();
        else
            p1 = {};
        $.when(p1).done(function (app) {
            query = query.replace("${app.name}", app.name);
            query = query.replace("${app.id}", app.id);
            $("#apiQueryHeader").text(query);
            let multiple = $("#multiple").is(":checked");
            $("#preview").html(`<select>`);
            let $target = $("#preview select");
            if (multiple) $target.attr("multiple", "multiple").addClass("chosen-select");
            let slicer = $("#apiResultSlicer").val();
            let p = loadApiQueryOptions(query, slicer, $target);
            $.when(p).done(function (data) {
                //jsonviewer(data, true, "", "#apiResult");
                $(".chosen-select").chosen();
            });
        })
    });
}

function previewUSQLhandler() {
    let p0 = getConnectInfo();

    $.when(p0).done(function () {
        let p1 = getTestApp();

        $.when(p1).done(function (app) {
            let usql = $("#usqlQuery").val();
            usql = usql.replace("${app.name}", app.name);
            usql = usql.replace("${app.id}", app.id);
            let query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
            let slicer = $("#usqlResultSlicer").val();
            let whereClause = $("#addWhereClause").is(":checked");
            let $target = $("#preview");
            $("#apiQueryHeader").text(query);
            let p2 = loadUsqlQueryOptions(query, slicer, $target, whereClause);
            $.when(p2).done(function (data) {
                jsonviewer(data, true, "", "#apiResult");
                $(".chosen-select").chosen();
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

function checkHandler() {
    let val = $(this).prop("checked") ? "true" : "false";
    $(this).val(val);
}

function workflowDownloader() {
    let $workflow = $("#workflow");
    syncMarkdowns($workflow);
    let workflow = {};
    workflow['html'] = $workflow.prop("outerHTML");
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
            html += `<option value="${e.prefix}">${e.name}</option>`;
        })
        $("#persona").html(html);

        html = "";
        usecases
            .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)
            .forEach(function (e) {
                html += `<option value="${e.prefix}">${e.name}</option>`;
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
            let workflows = $("div[id=workflow]");
            if (workflows.length > 1)
                workflows[0].replaceWith(workflows[workflows.length - 1]); //there can only be one
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
    selection = {};
    let p0 = getConnectInfo();

    $.when(p0).done(function () {
        selection.swaps = [
            { from: '${url}', to: url }
        ];
        let p = renderWorkflow($("#workflow"));
        $("#workflow").attr("id", "workflowInactive");
        $.when(p).done(function (renderedHTML) {
            selection.testMode = true;
            let p1 = popupHTMLDeferred("Testing Workflow", renderedHTML);
            $(".doneBar").hide();
            workflowSetFirstPageActive();
            let activePage = $("#workflow .workflowPage.activePage");
            renderWorkflowPage(activePage);
            drawWorkflowPagerButton();
            $.when(p1).done(function () {
                delete selection.testMode;
                delete selection.swaps;
                $("#workflowInactive").attr("id", "workflow");
                updatePageListing();
            });
        });
    });
}

function renderWorkflow(el) {
    let p = new $.Deferred();

    let $el = $(el);
    let clonedEl = $el.clone();

    //copy markdown values
    let fromMarkdowns = $el.find(".workflowMarkdown textarea");
    let toMarkdowns = clonedEl.find(".workflowMarkdown textarea");
    for(let i=0; i<fromMarkdowns.length; i++){
        let val = $(fromMarkdowns[i]).val();
        $(toMarkdowns[i]).text(val); 
    }

    //cleanup clone
    clonedEl.find(".workflowInputPopup").remove();
    clonedEl.find(".workflowSectionPopup").remove();
    clonedEl.find("input[type=text]:disabled, input:not([type]):disabled").removeAttr("disabled");
    clonedEl.find("[contenteditable]").removeAttr("contenteditable");
    clonedEl.find(".transform").hide();
    let config = clonedEl.find("#workflowConfigJSON").val();
    if (config.length > 0) selection['config'] = JSON.parse(config);

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

    //Journey Pickers
    $el.find(".journeyPicker").each(function() {
        let $target = $(this);
        let appTransform = $target.siblings(".appTransform").val();
        let app = {
            name: '${' + appTransform + '.name}',
            id: '${' + appTransform + '.id}'
        };
        if (typeof selection.swaps !== "undefined"){
            let swap = selection.swaps.find(x => x.from == app.name);
            app.name = swap?swap.to:app.name;
            swap = selection.swaps.find(x => x.from == app.id);
            app.id = swap?swap.to:app.id;
        }
        let p1 = JourneyPickerFactory($target,app);
        promises.push(p1);
    });

    //render markdowns
    $el.find(".workflowMarkdown").each(function () {
        let $ta = $(this).find("textarea"); 
        let md = $ta.val();
        let style = $ta.attr("style");
        var converter = new showdown.Converter();
        html = converter.makeHtml(md) || "Markdown failed to render";
        $(this).html(html);
        $(this).addClass("markdownTransformed");
        $(this).attr("style",style);
    });

    //make sure any XHRs are finished before we return the html
    $.when.apply($, promises).done(function () {
        let html = sanitizer.sanitize($el.html());
        $el.find(".chosen-select").chosen();
        p.resolve(html);
    })

    return p;
}

function loadApiQuery($query) {
    $query = $($query);
    let query = $query.val();
    let slicer = $query.siblings(".apiResultSlicer").val();
    let $target = $query.siblings(".workflowSelect");
    if (typeof selection.swaps !== "undefined") query = queryDoSwaps(query, selection.swaps);
    if (!query.match(/^\/api\//)) {
        console.log(`invalid api query: ${query}`);
        return;
    }
    let p1 = loadApiQueryOptions(query, slicer, $target);
    return $.when(p1).done(function (data) {
        jsonviewer(data);
    });
}

function loadUsqlQuery($usql) {
    $usql = $($usql);
    let usql = $usql.val();
    let slicer = $usql.siblings(".usqlResultSlicer").val();
    let whereClause = ($usql.siblings(".usqlResultSlicer[data-addWhereClause]").attr("data-addWhereClause") === 'true') ?
        true : false;
    let $target = $usql.siblings(".workflowSelect");
    if (typeof selection.swaps !== "undefined") usql = queryDoSwaps(usql, selection.swaps);
    if (!usql.match(/^SELECT /i)) {
        console.log(`invalid usql query: ${usql}`);
        return;
    }
    let query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
    let p1 = loadUsqlQueryOptions(query, slicer, $target, whereClause);
    return $.when(p1).done(function (data) {
        jsonviewer(data);
    });
}

function loadApiQueryOptions(query, slicer, target) {
    let $target = $(target); //here target is the select box
    let p1 = dtAPIquery(query);
    return $.when(p1).done(function (data) {
        jsonviewer(data, true, "", "#apiResult");
        let parsedResults = sliceAPIdata(slicer, data);
        $target.html('');
        $("<option>").appendTo($target);
        if (parsedResults.length > 0) {
            parsedResults.forEach(function (i) {
                let $opt = $(`<option>`).val(i.value).text(i.key);
                if (typeof i.type !== "undefined") $opt.attr("data-type", i.type);
                $opt.appendTo($target);
            });
        }
        $target.removeAttr("disabled");
        let eventData = { selectors: [$target], data: parsedResults, target: null };
        $target.on("change", eventData, apiQueryChangeHandlerKeyVal);
        $target.trigger("change");
    });
}

function loadUsqlQueryOptions(query, slicer, target, whereClause) {
    let $target = $(target);
    let p = dtAPIquery(query);
    return $.when(p).done(function (data) {
        jsonviewer(data, true, "", "#apiResult");
        let parsedResults = sliceUSQLdata(slicer, data, $target, whereClause);
        $target.removeAttr("disabled");
    });
}

function sliceAPIdata(slicer, data) {
    let parsedResults = [];

    switch (slicer) {
        case "{entityId:displayName}":
            if (!Array.isArray(data)) { //flatten values/monitors/etc
                data = data[Object.keys(data)[0]];
            }
            data.forEach(function (item) {
                parsedResults.push({ value: item.entityId, key: item.displayName });
            });
            break;
        case "{entityId:name}":
            if (!Array.isArray(data)) { //flatten values/monitors/etc
                data = data[Object.keys(data)[0]];
            }
            data.forEach(function (item) {
                parsedResults.push({ value: item.entityId, key: item.name });
            });
            break;
        case "values:{id:name}":
            if (!Array.isArray(data)) { //flatten values/monitors/etc
                data = data[Object.keys(data)[0]];
            }
            data.forEach(function (item) {
                parsedResults.push({ value: item.id, key: item.name });
            });
            break;
        case "ApplicationMethods":
            parsedResults = [];
            let valueMap = Object.keys(data)
                .filter(key => key.includes("Baselines"))
                .reduce((obj, key) => {
                    data[key].map((x) => {
                        //TODO: get type and create new object with key, val, type
                        let type = x.displayName.toLowerCase();
                        return x.childBaselines.map((y) => {
                            obj.set(y.displayName, { id: y.entityId, type: type });
                        })
                    })
                    return obj;
                }, new Map());
            valueMap.forEach((val, key, map) => { parsedResults.push({ value: val.id, key: key, type: val.type }); });
            parsedResults = parsedResults.sort((a, b) => a.key.toLowerCase() > b.key.toLowerCase() ? 1 : -1);
            break;
    }
    return parsedResults.sort((a, b) => (a.key.toLowerCase() > b.key.toLowerCase()) ? 1 : -1);
}

function sliceUSQLdata(slicer, data, target, whereClause) { //TODO: refactor this bowl of spaghetti
    let $target = $(target);
    let parsedResults = [];

    if ($target.is("select")) { //TODO: clean-up, currently creating one level too far down
        let $div = $("<div class='flex'></div>");
        $div.replaceAll($target);
        $target = $div;  //here target is actually a div containing multiple selects
    }

    let from = $("#transform").val();
    switch (slicer) {
        case 'Keys': {
            let selectors = [`#usp${uniqId()}`];
            $target.html(`
                <div class="inputHeader"><!--Keys:--></div>
                <div class="userInput"><select id="${selectors[0].substr(1)}"><option></option></select></div>
                `);
            parsedResults = parseKPIs(data);
            /*let options = drawKPIs(parsedResults);
            $(`${selectors[0]}`).html(options);*/
            drawKPIsJQ(parsedResults, selectors[0]);
            $("#swaps").html();

            if (whereClause) {
                let targetSelector = `#filterClause${uniqId()}`;
                $target.append(`<div class="inputHeader">Where Clause:</div>
                <div class="userInput"><input disabled id="${targetSelector.substr(1)}" class="filterClause"></div>
                `);
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector };
                $target.on("change", "select", eventData, previewChangeHandlerKeyWhereClause);
                $target.find("select:first-of-type").trigger("change");
            } else {
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: '' };
                $target.on("change", "select", eventData, previewChangeHandlerKey);
                $target.find("select:first-of-type").trigger("change");
            }
            break;
        }
        case 'Keys/Values': {
            let selectors = [`#uspKey${uniqId()}`, `#uspVal${uniqId()}`];
            parsedResults = parseUSPFilter(data);
            $target.html(`
                <div class="inputHeader">Keys:</div>
                <div class="userInput"><select id="${selectors[0].substr(1)}"><option></option></select></div>
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="${selectors[1].substr(1)}"><option></option></select></div>
                `);
            $("#swaps").html(`
                <div class="inputHeader">From:</div>
                <div class="userInput">${'${' + from + '}'}</div>
            `);

            if (whereClause) {
                let targetSelector = `#filterClause${uniqId()}`;
                $target.append(`<div class="inputHeader">Where Clause:</div>
                <div class="userInput"><input disabled id="${targetSelector.substr(1)}" class="filterClause"></div>
                `);
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector };
                $target.on("change", "select", eventData, uspFilterChangeHandler);
                $target.find("select:first-of-type").trigger("change");
            } else {
                let targetSelector = '';
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector };
                $target.on("change", "select", eventData, previewChangeHandlerKeyVal);
                $target.find("select:first-of-type").trigger("change");
            }
            break;
        }
        case 'ValX3': {
            let selectors = [`#continent${uniqId()}`, `#country${uniqId()}`, `#region${uniqId()}`, `#city${uniqId()}`];
            parsedResults = parseRegions(data);
            $target.html(`
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="${selectors[0].substr(1)}" class="continentList"><option></option></select></div>
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="${selectors[1].substr(1)}" class="countryList"><option></option></select></div>
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="${selectors[2].substr(1)}" class="regionList"><option></option></select></div>
                <div class="inputHeader">Values:</div>
                <div class="userInput"><select id="${selectors[3].substr(1)}" class="cityList"><option></option></select></div>
                `);
            $("#swaps").html(`
                <div class="inputHeader">From:</div>
                <div class="userInput">${'${' + from + '}'}</div>
            `);
            if (whereClause) {
                let targetSelector = `#filterClause${uniqId()}`;
                $target.append(`<div class="inputHeader">Where Clause:</div>
                <div class="userInput"><input disabled id="${targetSelector.substr(1)}" class="filterClause"></div>
                `);
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector };
                $target.on("change", "select", eventData, regionsChangeHandler);
                $target.find("select:first-of-type").trigger("change");
            } else {
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: null };
                $target.on("change", "select", eventData, previewChangeHandlerValX4);
                $target.find("select:first-of-type").trigger("change");
            }
            break;
        }
        case "actions": {
            let selectors = [`#action${uniqId()}`];

            let colname = data.columnNames[0];
            $target.html(`
                <div class="inputHeader"><!--Actions:--></div>
                <div class="userInput"><select id="${selectors[0].substr(1)}" data-colname="${colname}">
                    <option></option></select></div>
                `);
            let options = drawActions(data);
            $(`${selectors[0]}`).html(options);
            $("#swaps").html();

            if (whereClause) {
                let targetSelector = `#filterClause${uniqId()}`;
                $target.append(`<div class="inputHeader">Where Clause:</div>
                <div class="userInput"><input disabled id="${targetSelector.substr(1)}" class="filterClause"></div>
                `);
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector };
                $target.on("change", "select", eventData, previewChangeHandlerActionWhereClause);
                $target.find("select:first-of-type").trigger("change");
            } else {
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: '' };
                $target.on("change", "select", eventData, previewChangeHandlerAction);
                $target.find("select:first-of-type").trigger("change");
            }
            break;
        }
    }
    return parsedResults;
}

function pasteFixer(event) {
    let data = (event.clipboardData || window.clipboardData || event.originalEvent.clipboardData);
    if (typeof data != "undefined") {
        let paste = data.getData('text');

        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(paste));

        event.preventDefault();
    }
}

function apiQueryChangeHandlerKeyVal(event) {

    let $select = $(event.data.selectors[0]);
    let transform = $("#transform").val();
    let swaps = [];
    let preview = $(`<table>`);

    preview.append(`<tr><th>From</th><th>To</th></tr>`);
    apiSelectGetSwaps($select, transform, swaps);
    swaps.forEach((x) => {
        preview.append(`<tr><td>${x.from}</td><td>${x.to}</td></tr>`);
    });
    $("#swaps").html(preview);
}

function previewChangeHandlerKey(event) {
    let $el = $(event.data.selectors[0]);

    let $option = $el.find("option:selected");
    //let val = $option.attr("data-colname") + "." + $option.val();
    let val = $option.val();
    let key = $option.text();
    let fromkey = "${" + $("#transform").val() + ".name}";
    let fromval = "${" + $("#transform").val() + ".id}";

    let xform = `<table><tr><th>From</th>
        <b>from</b>: ${fromkey}, <b>to</b>: ${key}<br>
        <b>from</b>: ${fromval}, <b>to</b>: ${val}<br>`;
    $("#swaps").html(xform);
}

function previewChangeHandlerKeyWhereClause(event) {
    let $el = $(event.data.selectors[0]);
    let $target = $(event.data.targetSelector);

    let $option = $el.find("option:selected");
    let val = $option.val();
    let from = "${" + $("#transform").val() + "}";

    let filters = [];
    if (val != null && val != '' && val != 'n/a')
        filters.push(val + ' is not null');

    let filterClause = filters.length > 0 ?
        " AND (" + filters.join(" AND ") + ")" :
        "";
    $target.val(filterClause);

    let xform = `
        <b>from</b>:${from}, <b>to</b>:${filterClause}`;
    $("#swaps").html(xform);
}

function previewChangeHandlerAction(event) {
    let $el = $(event.data.selectors[0]);

    let $option = $el.find("option:selected");
    //let val = $option.attr("data-colname") + "." + $option.val();
    let val = $option.val();
    let from = "${" + $("#transform").val() + "}";


    let xform = `
        <b>from</b>:${from}, <b>to</b>:${val}`;
    $("#swaps").html(xform);
}

function previewChangeHandlerActionWhereClause(event) {
    let $el = $(event.data.selectors[0]);
    let $target = $(event.data.targetSelector);

    let $option = $el.find("option:selected");
    let colname = $el.attr("data-colname");
    let val = $option.val();
    let from = "${" + $("#transform").val() + "}";

    let filters = [];
    if (val != null && val != '' && val != 'n/a')
        filters.push(`${colname}="${val}"`);

    let filterClause = filters.length > 0 ?
        " AND (" + filters.join(" AND ") + ")" :
        "";
    $target.val(filterClause);

    let xform = `
        <b>from</b>:${from}, <b>to</b>:${filterClause}`;
    $("#swaps").html(xform);
}

function previewChangeHandlerKeyVal(event) {
    uspFilterChangeHandler(event);

    let key = $(event.data.selectors[0]).val();
    let val = $(event.data.selectors[1]).val();

    let fromkey = "${" + $("#transform").val() + ".key}";
    let fromval = "${" + $("#transform").val() + ".value}";

    let xform = `
        <b>from</b>:${fromkey}, <b>to</b>:${key}<br>
        <b>from</b>:${fromval}, <b>to</b>:${val}<br>`;
    $("#swaps").html(xform);
}

function previewChangeHandlerValX4(event) {
    regionsChangeHandler(event);

    let val1 = $(event.data.selectors[0]).val();
    let val2 = $(event.data.selectors[1]).val();
    let val3 = $(event.data.selectors[2]).val();
    let val4 = $(event.data.selectors[3]).val();

    let from1 = "${" + $("#transform").val() + ".1}";
    let from2 = "${" + $("#transform").val() + ".2}";
    let from3 = "${" + $("#transform").val() + ".3}";
    let from4 = "${" + $("#transform").val() + ".4}";
    let xform = `
        <b>from</b>:${from1}, <b>to</b>:${val1}<br>
        <b>from</b>:${from2}, <b>to</b>:${val2}<br>
        <b>from</b>:${from3}, <b>to</b>:${val3}<br>
        <b>from</b>:${from4}, <b>to</b>:${val4}<br>
        `;
    $("#swaps").html(xform);
}

function syncMarkdowns(el){
    let $el = $(el);
    let $markdowns = $el.find(".workflowMarkdown textarea");
    for(let i=0; i < $markdowns.length; i++){
        let val = $($markdowns[i]).val();
        $($markdowns[i]).text(val); 
    }
}
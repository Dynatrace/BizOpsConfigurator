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
    $("#viewport").on("click", ".workflowInputEdit", workflowEditInput);
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
    $("#viewport").on("change", "#usqlResultSlicer", usqlSlicerChangeHandler);
    $("#viewport").on("change", "input[type=checkbox]", checkHandler);
    $("#viewport").on("change", "#configPushType", configPushTypeHandler);
    $("#viewport").on("change", "#staticPreview", staticBoxPreviewHandler);
    $("#viewport").on("change", "#multiple", multipleChangeHandler);
    $("#viewport").on("click", "#test", previewHandler);
    $("#viewport").on("click", "#staticBoxAdd", staticBoxAddHandler);
    $("#viewport").on("click", "#conditionalAdd", conditionalAddHandler);
    $("#viewport").on("click", "#overrideAdd", overrideAddHandler);

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

function workflowEditInput(e) {
    let $pencil = $(this);
    let $oldInput = $pencil.parents(".workflowInput");
    let $section = $(this).parents(".workflowSection");

    let newInput = new Input();
    let p = newInput.prompt($section, $oldInput);
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

function checkHandler() {
    let val = $(this).prop("checked") ? "true" : "false";
    $(this).val(val);
}

function workflowDownloader() {
    let $workflow = $("#workflow");
    syncMarkdowns($workflow);
    syncInputs($workflow);
    let workflow = {};
    workflow['html'] = $workflow.prop("outerHTML");
    let config = $("#workflowConfigJSON").val();
    if (config.length > 0) workflow['config'] = JSON.parse(config);
    let name = (typeof workflow.config != "undefined" &&
        typeof workflow.config.workflowName != "undefined")
        ? workflow.config.workflowName : "untitled";
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
        $("#workflowConfigBox").find("input[type=checkbox]").each(function () {
            $el = $(this);
            if ($el.val() !== "false") $el.attr("checked", true);
            else $el.attr("checked", false);
        });

        $("#persona").chosen();

        $.when(p2).done(function (data) {
            if (data) {
                let newConfig = JSON.stringify(data);
                $("#workflowConfigJSON").val(newConfig);
            }
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
            replacePopupHeaders();
            workflowSetFirstPageActive();
        };
        if (typeof file !== "undefined") fr.readAsText(file);
        p0.resolve();
    });
    return p0;
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

function previewHandler() {
    let inputType = $("#inputType").val();
    switch (inputType) {
        case "Select (API)":
            previewReset();
            previewAPIhandler();
            break;
        case "Select (USQL)":
            previewReset();
            previewUSQLhandler();
            break;
        case "Conditional Swap":
            previewReset();
            conditionalPreview();
            break;
        case "Workflow Config Override":
            previewReset();
            configOverridePreview();
            break;
        case "Select (static)":
            staticBoxPreviewHandler();
            break;
    }
}

function previewReset() {
    $("#preview, #swaps").html("");
    $("#preview").off();
}

function staticBoxPreviewHandler() {
    let $select = $("#staticPreview");
    let transform = $("#transform").val();
    let multiple = $("#multiple").prop("checked");
    if (multiple) {
        if (!$select.hasClass("chosen-select") || !$select.attr("multiple")) {
            $select
                .attr("multiple", "multiple")
                .addClass("chosen-select")
                .chosen();
        }
        let $opts = $select.find("option:selected");
        let preview = $(`<table class="dataTable">`);
        preview.append(`<thead><tr><td>From</td><td>To</td></tr></thead>`);
        for (let i = 0; i < $opts.length; i++) {
            let $opt = $($opts[i]);
            let fromkey = "${" + transform + "-" + i + ".key}";
            let fromval = "${" + transform + "-" + i + ".value}";
            let key = $opt.text();
            let val = $opt.val();
            preview.append(`<tr><td>${fromkey}</td><td>${key}</td></tr>`);
            preview.append(`<tr><td>${fromval}</td><td>${val}</td></tr>`);
        }
        $("#swaps").html(preview);
    } else {
        if ($select.hasClass("chosen-select") || $select.attr("multiple")) {
            $select
                .removeClass("chosen-select")
                .removeAttr("multiple")
                .chosen('destroy');
        }
        let $opt = $("#staticPreview option:selected");
        let key = $opt.text();
        let val = $opt.val();

        let fromkey = "${" + transform + ".key}";
        let fromval = "${" + transform + ".value}";

        let preview = $(`<table class="dataTable">`);
        preview.append(`<thead><tr><td>From</td><td>To</td></tr></thead>`);
        preview.append(`<tr><td>${fromkey}</td><td>${key}</td></tr>`);
        preview.append(`<tr><td>${fromval}</td><td>${val}</td></tr>`);
        $("#swaps").html(preview);
    }

}

function conditionalPreview(vals) {
    if (vals == null) {
        vals = $("#conditionalValues").val();
        if (vals) vals = JSON.parse(vals);
        else vals = [];
    }
    let transform = "${" + $("#transform").val() + "}";
    let priorSwap = $("#conditionalPrior").val();
    let preview = `if ${priorSwap} == X, then swap ${transform} to Y:<br>`;
    let swapPreview = `
    <table class="dataTable">
    <thead><tr><td>X</td><td>Y</td></tr></thead>
    `;
    vals.forEach(function (v) {
        swapPreview += `<tr><td>${v.prior}</td><td>${v.swap}</td></tr>`;
    });
    swapPreview += `</table>`;
    $("#preview").html(preview);
    $("#swaps").html(swapPreview);
}

function configOverridePreview(vals) {
    if (vals == null) {
        vals = $("#overrideValues").val();
        if (vals) vals = JSON.parse(vals);
        else vals = [];
    }
    let priorSwap = $("#overridePriorSwap").val();
    let overrideAction = $("#overrideAction").val();
    let preview = `if ${priorSwap} == X, then override ${overrideAction} to Y:<br>`;
    let swapPreview = `
    <table class="dataTable">
    <thead><tr><td>X</td><td>Y</td></tr></thead>
    `;
    vals.forEach(function (v) {
        swapPreview += `<tr><td>${v.prior}</td><td>${v.overrideValue}</td></tr>`;
    });
    swapPreview += `</table>`;
    $("#preview").html(preview);
    $("#swaps").html(swapPreview);
}

function replacePopupHeaders() {
    let p = $.get('html/personaFlow/workflowBuilder.html');

    $.when(p).done(template => {
        let $template = $(template);
        let $workflowSectionPopup = $template.find(".workflowSectionPopup");
        let $workflowInputPopup = $template.find(".workflowInputPopup");

        let $workflow = $("#workflow");
        $workflow.find(".workflowSectionPopup")
            .replaceWith($workflowSectionPopup);
        $workflow.find(".workflowInputPopup")
            .replaceWith($workflowInputPopup);
        $workflow.find(".workflowSectionPopup, .workflowInputPopup")
            .addClass("hidden");
    });
    return p;
}
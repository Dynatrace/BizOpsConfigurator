//functions & defaults for workflowBuilder
function workflowBuilderHandlers() {
    //menubar links
    $("#viewport").on("click", "#workflowAddSection", workflowAddSection);
    $("#viewport").on("click", "#workflowConfig", function (e) { });
    $("#viewport").on("click", "#workflowTest", function (e) { });
    $("#viewport").on("click", "#workflowDownload", function (e) { });
    $("#viewport").on("click", "#workflowPageDown", function (e) { });
    $("#viewport").on("click", "#workflowPageNum", function (e) { });
    $("#viewport").on("click", "#workflowPageUp", function (e) { });
    $("#viewport").on("click", "#workflowPageAdd", function (e) { });
    $("#viewport").on("click", "#workflowPageDelete", function (e) { });

    //show/hide popups
    $("#viewport").on("focus", ".workflowSection", function () {
        $(this).find(".workflowSectionPopup").show();
    });
    $("#viewport").on("blur", ".workflowSection, .workflowSectionPopup", function (e) {
        closeIfFocusedElsewhere(e, ".workflowSectionPopup");
    });
    $("#viewport").on("focus", ".workflowInput", function (e) {
        $(this).find(".workflowInputPopup").show();
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
    $("#viewport").on("click", "#testAPI", function (e) {
        let p0 = getConnectInfo();

        $.when(p0).done(function () {
            let query = $("#apiQuery").val();
            let p = dtAPIquery(query);
            $.when(p).done(function (data) {
                jsonviewer(data, true, "", "#apiResult");
                $("#apiQueryHeader").text(query);
                let parsedResults = [];
                let apiResultSlicer = $("#apiResultSlicer").val();
                if(data.length>0) switch (apiResultSlicer) {
                    case "{entityId:displayName}":
                        data.forEach(function (item) {
                            parsedResults.push({ id: item.entityId, value: item.displayName });
                        });
                        break;
                    case "{id:name}":
                        data.forEach(function (item) {
                            parsedResults.push({ id: item.id, value: item.name });
                        });
                        break;
                }
                let previewHTML = "";
                let inputType = $("#inputType").val();
                let multiple = $("#multiple").prop("checked")?"multiple":"";
                if(parsedResults.length>0) switch (inputType) {
                    case "Select":
                        previewHTML = `<select ${multiple}>`;
                        parsedResults.forEach(function (i) {
                            previewHTML += `<option id="${i.id}">${i.value}</option>`;
                        });
                        previewHTML += `</select>`;
                        break;
                }
                $("#preview").html(previewHTML);
            });
        });
    });
    $("#viewport").on("click", "#testUSQL", function (e) {
        let p0 = getConnectInfo();

        $.when(p0).done(function () {
            let usql = $("#usqlQuery").val();
            let query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
            let p = dtAPIquery(query);
            $.when(p).done(function (data) {
                jsonviewer(data, true, "", "#apiResult");
                $("#apiQueryHeader").text(query);
                let parsedResults = [];
                let apiResultSlicer = $("#usqlResultSlicer").val();
                switch (apiResultSlicer) {
                    case 'parseUSPFilter':
                        parsedResults = parseUSPFilter(data);
                        break;
                }
                let previewHTML = `
                    <div class="inputHeader">Keys:</div>
                    <div class="userInput"><select id="uspKey" class="uspFilter"></select></div>
                    <div class="inputHeader">Values:</div>
                    <div class="userInput"><select id="uspVal" class="uspFilter"></select>
                `;
                $("#preview").html(previewHTML);
                uspFilterChangeHandler();
            });
        });
    });
}

function workflowAddSection() {
    let sections = $("#workflowSections");
    let newSection = new Section();
    sections.append(newSection.html);
    $(".workflowSectionPopup, .workflowInputPopup").hide();
}

function workflowSectionAddInput() {
    let section = $(this).parents(".workflowSection");
    let newInput = new Input();
    let p = newInput.prompt();
    $.when(p).done(function (newInput) {
        section.append(newInput);
        $(".workflowSectionPopup, .workflowInputPopup").hide();
    });
}

function closeIfFocusedElsewhere(e, selector) {
    let from = $(e.currentTarget);
    let to = e.relatedTarget;
    if (from.has(to).length > 0) {
        return e; //still within
    } else {
        from.find(selector).delay(500).hide(); //outside, let's go
    }
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
                    case "Select":
                        input = `<select class="workflowSelect" disabled></select>
                        <input type="hidden" class="apiQuery" value="${data.apiQuery}">`;
                        break;
                    case "Multi-Select":
                        input = `<select class="workflowSelect" disabled multiple></select>
                        <input type="hidden" class="apiQuery" value="${data.apiQuery}">`;
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
    $("#apiQueryHeader").text();
    $("#preview").html();

    switch ($("#inputType").val()) {
        case "Text Input":
            break;
        case "Select":
            $("#apiQueryBox").show();
            break;
        case "Select (USQL)":
            $("#usqlQueryBox").show();
            break;
        case "Multi-Select":
            $("#apiQueryBox").show();
            break;
        case "Checkboxes":
            break;
        case "Funnel":
            break;
    }
}

function commonQueryChangeHandler() {
    let commonQueries = $("#commonQueries").val();

    switch (commonQueries){
        case "Apps":
            $("#apiQuery").val("/api/v1/entity/applications?includeDetails=false");
            break;
        case "MZs":
            $("#apiQuery").val("/api/config/v1/managementZones");
            break;
        case "Hosts":
            $("#apiQuery").val("/api/v1/entity/infrastructure/hosts?includeDetails=true");
            break;
        case "Autotags":
            $("#apiQuery").val("/api/config/v1/autoTags");
            break;
        case "Services":
            $("#apiQuery").val("/api/v1/entity/services?includeDetails=false");
            break;
        
    }
}
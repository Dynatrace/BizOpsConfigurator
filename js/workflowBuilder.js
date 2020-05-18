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
}

function workflowAddSection() {
    let sections = $("#workflowSections");
    let newSection = new Section();
    sections.append(newSection.html);
    $(".workflowSectionPopup, .workflowInputPopup").hide();
}

function workflowSectionAddInput() {
    let section = $(this).parents(".workflowSection");
    let newInput = new Input("input");
    section.append(newInput.html);
    $(".workflowSectionPopup, .workflowInputPopup").hide();
}

function closeIfFocusedElsewhere(e, selector) {
    let from = $(e.currentTarget);
    let to = e.relatedTarget;
    if (from.has(to).length > 0) {
        return e; //still within
    } else {
        $(this).find(selector).delay(500).hide(); //outside, let's go
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

function Input(type) {
    let input = "";
    switch (type) {
        case "input":
            input = `<input class="workflowInput" placeholder="Friendly Name" disabled>`;
            break;
        case "select":
            input = `<select class="workflowSelect" disabled></select>`;
            break;
        case "multiselect":
            input = `<select class="workflowSelect" disabled multiple></select>`;
            break;
        case "funnel":
            input = `<h1>Giant funnel graphic here</h1>`;
            break;
        case "checkboxes":
            input = `<input class="workflowCheck" type="checkbox" placeholder="Friendly Name" disabled>`;
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
        <div class="transform">&dollar;{<span contenteditable="true">MyString</span>}</div>
    </div>`
}
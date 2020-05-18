//functions & defaults for workflowBuilder
function workflowBuilderHandlers() {
    $("#viewport").on("focus", ".workflowSection", function () {
        $(this).find(".workflowSectionPopup").show();
    });
    $("#viewport").on("blur", ".workflowSection, .workflowSectionPopup", function (e) {
        let from = $(this);
        let to = e.relatedTarget;
        if(from.has(to).length>0){
            return e; //still within
        } else {
            $(this).find(".workflowSectionPopup").delay(500).hide(); //outside, let's go
        }   
    });
    $("#viewport").on("focus", ".workflowInput", function (e) {
        $(this).find(".workflowInputPopup").show();
    });
    $("#viewport").on("blur", ".workflowInput, .workflowInputPopup", function (e) {
        let from = $(this);
        let to = e.relatedTarget;
        if(from.has(to).length>0){
            return e; //still within
        } else {
            $(this).find(".workflowInputPopup").delay(500).hide(); //outside, let's go
        }
    });
    $("#viewport").on("click", "#workflowAddSection", workflowAddSection);
    $("#viewport").on("click", ".workflowSectionAddInput", workflowSectionAddInput);
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
        <div class="inputHeader" contenteditable="true">New Header
            <div class="workflowInputPopup">
            <div><a href="#workflowBuilder" class="workflowInputDelete">❌</a></div>
            <div><a href="#workflowBuilder" class="workflowInputUp">🔼</a></div>
            <div><a href="#workflowBuilder" class="workflowInputDown">🔽</a></div>
            </div>
        </div>
        <div class="userInput">${input}</div>
    </div>`
}
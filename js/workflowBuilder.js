//functions & defaults for workflowBuilder

function Section() {
    this.html = `
    <div class="workflowSection">
        <div class="workflowSectionPopup">
            <input type="button" class="workflowSectionAddInput" value="+">
            <input type="button" class="workflowSectionDelete" value="❌">
            <input type="button" class="workflowSectionUp" value="🔼">
            <input type="button" class="workflowSectionDown" value="🔽">
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
    <div class="workflowInput">
        <div class="inputHeader" contenteditable="true">New Header
            <div class="workflowInputPopup">
                <input type="button" class="workflowInputDelete" value="❌">
                <input type="button" class="workflowInputUp" value="🔼">
                <input type="button" class="workflowInputDown" value="🔽">
            </div>
        </div>
        <div class="userInput">${input}</div>
    </div>`
}
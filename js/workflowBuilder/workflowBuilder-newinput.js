/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function Input() {
    this.html = "";

    this.prompt = function (section, oldInput) {
        let $section = $(section);
        let $oldInput = $(oldInput);
        let p0 = $.Deferred();
        let p1 = $.get("html/personaFlow/workflowBuilder-newInput.html");
        $.when(p1).done(function (content) {
            let p2 = popupHTMLDeferred("New Input", content);
            $(".doneBar").append(`<div id="inputInfoBox"></div>`);

            if ($oldInput.length) {
                populateNewInput($oldInput);
            } else {
                inputTypeChangeHandler();
            }

            $.when(p2).done(function (data) {
                if (typeof data == "undefined") {
                    p0.resolve(null);
                    return;
                }
                let $newDiv = $(`
                <div class="workflowInput" tabindex="0">
                    <div class="workflowInputPopup">
                        <div><a href="#workflowBuilder" class="workflowInputEdit">✏️</a></div>
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
                        let $inputBox = $(`<input class="workflowInput" disabled>`)
                            .attr("placeholder", data.placeholder)
                            .val(data.defaultvalue)
                            .appendTo($input);
                        if (data.required) $inputBox.attr("required", "required");
                        break;
                    }
                    case "Select (API)": {
                        let $select = $(`<select class="workflowSelect" disabled></select>`);
                        if (data.multiple) $select.attr("multiple", "multiple").addClass("chosen-select");
                        if (data.required) $select.attr("required", "required");
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
                        if (data.required) $select.attr("required", "required");
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
                        let $select = $(`<select class="workflowSelect staticSelect" disabled></select>`);
                        if (data.multiple) $select.attr("multiple", "multiple").addClass("chosen-select");
                        if (data.required) $select.attr("required", "required");
                        $select
                            .attr("data-options", data.staticOptions)
                            .appendTo($input);
                        break;
                    }
                    case "Journey Picker": {
                        $(`<img src="images/funnel.png" class="journeyPicker" data-addWhereClause="true">`)
                            .appendTo($input);
                        $(`<input type="hidden" class="appTransform">`)
                            .val(data.app)
                            .appendTo($input);
                        $input.parent().find(".inputHeader, .tryitout").remove();
                        break;
                    }
                    case "Tile Replicator": {
                        let $div = $(`<div class="tileReplication">`)
                            .appendTo($input);
                        $(`<input type="hidden" class="replicationPriorTransform">`)
                            .val(data.replicationPriorTransform)
                            .appendTo($div);
                        $(`<input type="hidden" class="replicationColumns">`)
                            .val(data.replicationColumns)
                            .appendTo($div);
                        $(`<input type="text" disabled class="replicationTileName">`)
                            .val(data.replicationTileName)
                            .appendTo($div);

                        $input.parent().find(".inputHeader").remove();
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
                        $input.parent().find(".inputHeader, .transform").remove();
                        break;
                    }
                    case "Conditional Swap": {
                        let $div = $(`<div class="conditionalSwap">`)
                            .appendTo($input);
                        let $el = $(`<input type="hidden" class="conditionalValues">`)
                            .val(data.conditionalValues)
                            .appendTo($div);
                        $el = $(`<input type="text" disabled class="conditionalPrior">`)
                            .val(data.conditionalPrior)
                            .appendTo($div);

                        $input.parent().find(".inputHeader").remove();
                        break;
                    }
                    case "Workflow Config Override": {
                        let $div = $(`<div class="configOverride">`)
                            .appendTo($input);
                        let $el = $(`<input type="hidden" class="overrideValues">`)
                            .val(data.overrideValues)
                            .appendTo($div);
                        $el = $(`<input type="text" disabled class="overridePrior">`)
                            .val(data.overridePriorSwap)
                            .appendTo($div);
                        $el = $(`<input type="hidden" disabled class="overrideAction">`)
                            .val(data.overrideAction)
                            .appendTo($div);

                        $input.parent().find(".inputHeader").remove();
                        break;
                    }
                    case "DT Config Pusher": {
                        let $div = $(`<div class="configPusher">`)
                            .appendTo($input);
                        let $el = $(`<input type="hidden" class="configPushType">`)
                            .val(data.configPushType)
                            .appendTo($div);
                        $el = $(`<input type="hidden" class="customServiceTech">`)
                            .val(data.customServiceTech)
                            .appendTo($div)
                        $el = $(`<input type="hidden" class="customMetricType">`)
                            .val(data.customMetricType)
                            .appendTo($div)
                        $el = $(`<input type="text" disabled class="configPushFile">`)
                            .val(data.configPushFile)
                            .appendTo($div);
                        break;
                    }
                    case "Tag Value Picker": {
                        $input.html(`
                        <div class="tagValuePicker">
                            <input type="hidden" class="entityType">
                            <div class="inputHeader">Tag:</div>
                            <div class="userInput"><select class="tagValuePickerTag" disabled></select></div>
                            <div class="inputHeader">Value:</div>
                            <div class="userInput"><select class="tagValuePickerValue chosen-select" multiple disabled></select></div>
                        </div>`);

                        //if (data.multiple) $select.attr("multiple", "multiple").addClass("chosen-select");
                        if (data.required) $input.find(`select`).attr("required", "required");
                        $input.find(`.entityType`).val(data.entityType)
                        break;
                    }

                }
                $transform.text(data.transform);
                $header.text(data.transform.charAt(0).toUpperCase() + data.transform.slice(1) + ':');
                $oldInput.remove();
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
    $("requiredBox").hide();
    $("#textInputBox").hide();
    $("#inputInfoBox").hide();
    $("#apiQueryHeader").text();
    $("#preview").html();
    $("#preview").off();
    $("#swaps").html();
    $("#appTransform").hide();
    $("#conditionalSwap").hide();
    $("#resultHeader").text("Result:");
    $("#configOverride").hide();
    $("#configPusher").hide();
    $("#tileReplication").hide();
    $("#tagValuePicker").hide();


    switch ($("#inputType").val()) {
        case "Text Input":
            $("#textInputBox").show();
            $("requiredBox").show();
            break;
        case "Select (API)":
            $("#apiQueryBox").show();
            $("#newInputResult").show();
            $("#newInputPreview").show();
            $("#multiBox").show();
            $("requiredBox").show();
            break;
        case "Select (USQL)":
            $("#usqlQueryBox").show();
            $("#newInputResult").show();
            $("#newInputPreview").show();
            $("#multiBox").show();
            $("#whereClauseBox").show();
            $("requiredBox").show();
            $("#inputInfoBox").html(`<img src="images/light-bulb-yellow_300.svg">
            Be sure the replacement token in query is filled on a prior page.`);
            $("#inputInfoBox").show();
            break;
        case "Select (static)":
            $("#staticBox").show();
            let html = `<div class="userInput"><select id="staticPreview"></select></div>`;
            $("#preview").html(html);
            $("#newInputPreview").show();
            $("#multiBox").show();
            $("requiredBox").show();
            break;
        case "Checkboxes":
            break;
        case "Journey Picker":
            $("#transform").val("journey");
            $("#appTransform").show();
            $(".tryitout").hide();
            $("#inputInfoBox").html(`<img src="images/light-bulb-yellow_300.svg">
            Journey Pickers should be on their own page.`);
            $("#inputInfoBox").show();
            break;
        case "Tile Replicator":
            $("#tileReplication").show();
            $(".transform, .tryitout").hide();
            $("#resultHeader").text("Example:");
            $("#apiQueryHeader").text("")
            $("#apiResult").html(`<img src="images/tilereplicator.png">`);
            $("#newInputResult").show();
            break;
        case "Markdown":
            $(".transform, .tryitout").hide();
            break;
        case "Conditional Swap":
            $("#conditionalSwap").show();
            $("#newInputPreview").show();
            $("#resultHeader").text("Examples:");
            $("#apiQueryHeader").text("")
            $("#apiResult").html(`
                if \${feature} == X, then swap \${dashboardid} to Y:<br>
                <table class="dataTable"><thead><tr><td>X</td><td>Y</td></tr></thead>
                <tr><td>true</td><td>31349d20-e714-4aaa-8184-7e5a76f5bf5b</td></tr>
                <tr><td>false</td><td>98749d20-1234-4567-8244-876a76f5b567</td></tr>
                </table><br>
                if \${journey.steps} == X, then swap \${dashboardid} to Y:<br>
                <table class="dataTable"><thead><tr><td>X</td><td>Y</td></tr></thead>
                <tr><td>3</td><td>31349d20-e714-4aaa-8184-7e5a76f5bf5b</td></tr>
                <tr><td>4</td><td>98749d20-1234-4567-8244-876a76f5b567</td></tr>
                <tr><td>5</td><td>12349d20-4234-9567-8244-126a76f5b789</td></tr>
                </table><br>`);
            $("#newInputResult").show();
            $("#transform").val("nextdb");
            break;
        case "Workflow Config Override":
            $("#configOverride").show();
            $("#newInputPreview").show();
            $("#resultHeader").text("Examples:");
            $("#apiQueryHeader").text("")
            $("#apiResult").html(`
                if \${version} == X, then override OverviewDB to Y:<br>
                <table class="dataTable"><thead><tr><td>X</td><td>Y</td></tr></thead>
                <tr><td>detailed</td><td>Overview-detailed.json</td></tr>
                <tr><td>highlevel</td><td>Overview-highlevel.json</td></tr>
                </table><br>
                if \${journey.steps} == X, then override OverviewDB to Y:<br>
                <table class="dataTable"><thead><tr><td>X</td><td>Y</td></tr></thead>
                <tr><td>3</td><td>JourneyOverview-3.json</td></tr>
                <tr><td>4</td><td>JourneyOverview-4.json</td></tr>
                <tr><td>5</td><td>JourneyOverview-5.json</td></tr>
                </table><br>`);
            $("#newInputResult").show();
            $(".transform").hide();
            break;
        case "DT Config Pusher":
            $("#configPusher").show();
            $(".transform").show();
            $(".tryitout").hide();
            $("#configPushType").trigger("change");;
            break;
        case "Tag Value Picker":
            $("#tagValuePicker").show();
            //$("#multiBox").show();
            $(".transform").show();
            $("#newInputPreview").show();
            break;
    }
}

function staticBoxAddHandler() {
    let key = $("#staticBoxLabel").val();
    let val = $("#staticBoxValue").val();

    let $opt = $(`<option value="${val}">${key}</option>`);
    $opt.appendTo("#staticPreview");
    $("#staticPreview").val(val);
    $("#staticBoxLabel").val("");
    $("#staticBoxValue").val("");

    let vals = $("#staticOptions").val();
    if (vals.length < 1) vals = "[]";
    let staticOptions = JSON.parse(vals);
    let newOption = {};
    newOption['key'] = key;
    newOption['val'] = val;
    staticOptions.push(newOption);
    $("#staticOptions").val(JSON.stringify(staticOptions));
}

function conditionalAddHandler(e) {
    let vals = $("#conditionalValues").val();
    if (vals) vals = JSON.parse(vals);
    else vals = [];
    let prior = $("#conditionalPriorValue").val();
    let swap = $("#conditionalSwapValue").val();
    vals.push({ prior: prior, swap: swap });
    $("#conditionalValues").val(JSON.stringify(vals));

    conditionalPreview(vals);

    $("#conditionalPriorValue").val("");
    $("#conditionalSwapValue").val("");
}

function overrideAddHandler(e) {
    let vals = $("#overrideValues").val();
    if (vals) vals = JSON.parse(vals);
    else vals = [];
    let prior = $("#overridePriorValue").val();
    let overrideValue = $("#overrideValue").val();
    vals.push({ prior: prior, overrideValue: overrideValue });
    $("#overrideValues").val(JSON.stringify(vals));

    configOverridePreview(vals);

    $("#overridePriorValue").val("");
    $("#overrideValue").val("");
}

function configPushTypeHandler() {
    $el = $(this);
    $(".configPusherCustomService").hide();
    $(".configPusherCustomMetric").hide();
    switch ($el.val()) {
        case "Autotag":
            break;
        case "MZ":
            break;
        case "RequestAttribute":
            break;
        case "CustomMetric":
            $(".configPusherCustomMetric").show();
            break;
        case "CustomService":
            $(".configPusherCustomService").show();
            break;
        case "Extension":
            break;
    }
    $("#transform").val($el.val().toLowerCase());
}

function populateNewInput(oldInput) {
    let $oldInput = $(oldInput);
    let $usqlQuery = $oldInput.find('.usqlQuery');
    let $usqlResultSlicer = $oldInput.find('.usqlResultSlicer');
    let $apiQuery = $oldInput.find('.apiQuery');
    let $apiResultSlicer = $oldInput.find('.apiResultSlicer');
    let $workflowInput = $oldInput.find('.workflowInput');
    let $staticSelect = $oldInput.find('.staticSelect');
    let $journeyPicker = $oldInput.find('.journeyPicker');
    let $tileReplication = $oldInput.find('.tileReplication');
    let $replicationColumns = $oldInput.find(".replicationColumns"); 
    let $replicationPriorTransform = $oldInput.find(".replicationPriorTransform");
    let $replicationTileName = $oldInput.find(".replicationTileName");
    let $conditionalSwap = $oldInput.find('.conditionalSwap');
    let $conditionalPrior = $oldInput.find(".conditionalPrior");
    let $conditionalPriorVals = $oldInput.find(".conditionalValues");
    let $configOverride = $oldInput.find('.configOverride');
    let $overridePriorSwap = $oldInput.find(".overridePriorSwap");
    let $overridePriorVals = $oldInput.find(".overrideValues");
    let $configPusher = $oldInput.find('.configPusher');
    let $configPushType = $configPusher.find('.configPushType');
    let $customServiceTech = $configPusher.find('.customServiceTech');
    let $customMetricType = $configPusher.find('.customMetricType');
    let $configPushFile = $configPusher.find('.configPushFile');
    let $select = $oldInput.find('select');
    let options = $select.attr("data-options");
    let vals = options ? JSON.parse(options) : null;
    let $transform = $oldInput.find(".transform span");

    if ($usqlQuery.length) {
        $("#inputType").val('Select (USQL)');
        inputTypeChangeHandler();
        $("#usqlQuery").val($usqlQuery.val());
        $("#usqlResultSlicer").val($usqlResultSlicer.val());
        $("#multiple").prop('checked',
            ($select.attr("multiple") === "multiple" ? true : false));
        $("#addWhereClause").prop('checked',
            ($usqlResultSlicer.attr("data-addwhereclause") === "true" ? true : false));
        $("#required").prop('checked',
            ($select.attr("required") === "required" ? true : false));
    } else if ($apiQuery.length) {
        $("#inputType").val('Select (API)');
        inputTypeChangeHandler();
        $("#commonQueries").val('');
        $("#apiQuery").val($apiQuery.val());
        $("#apiResultSlicer").val($apiResultSlicer.val());
        $("#multiple").prop('checked',
            ($select.attr("multiple") === "multiple" ? true : false));
        $("#required").prop('checked',
            ($select.attr("required") === "required" ? true : false));
    } else if ($workflowInput.length) {
        $("#inputType").val('Text Input');
        inputTypeChangeHandler();
        $("#placeholder").val($workflowInput.attr('placeholder'));
        $("#defaultvalue").val($workflowInput.val());
        $("#required").prop('checked',
            ($workflowInput.attr("required") === "required" ? true : false));
    } else if ($staticSelect.length) {
        $("#inputType").val('Select (static)');
        inputTypeChangeHandler();
        $("#staticOptions").val($select.attr("data-options"));
        $("#staticPreview").html(
            JSON.parse($select.attr("data-options"))
                .reduce((agg, cv) =>
                    agg + `<option value="${cv.val}">${cv.key}</option>`
                    , "")
        );
        $("#multiple").prop('checked',
            ($select.attr("multiple") === "multiple" ? true : false));
        $("#required").prop('checked',
            ($select.attr("required") === "required" ? true : false));
    } else if ($journeyPicker.length) {
        $("#inputType").val('Journey Picker');
        inputTypeChangeHandler();
        $("#app").val($appTransform.val());
    } else if ($tileReplication.length) {
        $("#inputType").val('Tile Replicator');
        inputTypeChangeHandler();
        $("#replicationTileName").val($replicationTileName.val());
        $("#replicationPriorTransform").val($replicationPriorTransform.val());
        $("#replicationColumns").val($replicationColumns.val());
    } else if ($conditionalSwap.length) {
        $("#inputType").val('Conditional Swap');
        inputTypeChangeHandler();
        $("#conditionalValues").val($conditionalPriorVals.val());
        $("#conditionalPrior").val($conditionalPrior.val());
        conditionalPreview(vals);
    } else if ($configOverride.length) {
        $("#inputType").val('Workflow Config Override');
        inputTypeChangeHandler();
        $("#overrideValues").val($overridePriorVals.val());
        $("#overridePriorSwap").val($overridePriorSwap.val());
        configOverridePreview(vals);
    } else if ($configPusher.length) {
        $("#inputType").val('DT Config Pusher');
        inputTypeChangeHandler();
        $("#configPushType").val($configPushType.val());
        $("#customServiceTech").val($customServiceTech.val());
        $("#customMetricType").val($customMetricType.val());
        $("#configPushFile").val($configPushFile.val());
    } else {
        inputTypeChangeHandler();
    }
    $("#transform").val($transform.text());
}

/*function multipleChangeHandler(){
    let $multi = $(`#multiple`);
    let $required = $(`#required`);
    if($multi.prop("checked")){ //multi selected, cannot do required
        $required.prop("disabled",true);
        $required.prop("checked",false);
    } else { //required ok
        $required.prop("disabled",false);
    }
}*/
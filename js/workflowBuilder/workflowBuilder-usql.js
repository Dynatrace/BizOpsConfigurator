/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function loadUsqlQuery($usql) {
    $usql = $($usql);
    let usql = $usql.val();
    let slicer = $usql.siblings(".usqlResultSlicer").val();
    let whereClause = ($usql.siblings(".usqlResultSlicer[data-addWhereClause]").attr("data-addWhereClause") === 'true') ?
        true : false;
    let multiple = $usql.siblings("select").attr("multiple");
    let $target = $usql.siblings(".workflowSelect");
    if (typeof selection.swaps !== "undefined") usql = queryDoSwaps(usql, selection.swaps);
    if (!usql.match(/^SELECT /i)) {
        console.log(`invalid usql query: ${usql}`);
        return;
    }
    let query = "/api/v1/userSessionQueryLanguage/table?query=" + encodeURIComponent(usql) + "&explain=false";
    let p1 = loadUsqlQueryOptions(query, slicer, $target, whereClause, multiple);
    return $.when(p1).done(function (data) {
        jsonviewer(data);
    });
}

function loadUsqlQueryOptions(query, slicer, target, whereClause, multiple, required) {
    let $target = $(target);
    let p = dtAPIquery(query);
    return $.when(p).done(function (data) {
        jsonviewer(data, true, "", "#apiResult");
        let parsedResults = sliceUSQLdata(slicer, data, $target, whereClause, multiple, required);
        $target.removeAttr("disabled");
    });
}

function sliceUSQLdata(slicer, data, target, whereClause, multiple, required) { //TODO: refactor this bowl of spaghetti
    let $target = $(target);
    let parsedResults = [];

    if ($target.is("select")) { //TODO: clean-up, currently creating one level too far down
        let $div = $("<div class='flex'></div>");
        $div.replaceAll($target);
        $target = $div;  //here target is actually a div containing multiple selects
    }

    let from = $("#transform").val();
    switch (slicer) {
        case 'Keys_edit': {
            let id = `usp${uniqId()}`;
            let selectors = [`#${id}`];
            $target.html(`
                <div class="inputHeader"><!--Keys_edit:--></div>
                <div class="userInput">
                    <input id="${id}" list="${id}_list">
                    <datalist id="${id}_list"><option></option></datalist>
                </div>
                `);
            parsedResults = parseKPIs(data);
            drawKPIsJQ(parsedResults, `#${id}_list`);
            $("#swaps").html();

            let targetSelector = '';
            let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector, slicer: slicer };
            $target.on("change", "input", eventData, previewChangeHandlerKeyEdit);
            $target.find("input:first-of-type").trigger("change");
            break;
        }
        case 'Keys/Values_edit': {
            let selectors = [`#uspKey${uniqId()}`, `#uspVal${uniqId()}`];
            parsedResults = parseUSPFilter(data);
            $target.html(`
                <div class="inputHeader">Keys:</div>
                <div class="userInput">
                    <input id="${selectors[0].substr(1)}" list="${selectors[0].substr(1)}_list">
                    <datalist id="${selectors[0].substr(1)}_list"><option></option></datalist>
                </div>
                <div class="inputHeader">Values:</div>
                <div class="userInput">
                    <input id="${selectors[1].substr(1)}" list="${selectors[1].substr(1)}_list">
                    <datalist id="${selectors[1].substr(1)}_list"><option></option></datalist>
                </div>
                `);
            $("#swaps").html(`
                <div class="inputHeader">From:</div>
                <div class="userInput">${'${' + from + '}'}</div>
            `);

            let targetSelector = '';
            let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector, slicer: slicer };
            $target.on("change", "input", eventData, previewChangeHandlerKeyValEdit);
            $target.find("input:first-of-type").trigger("change");

            break;
        }
        case 'Keys': {
            let selectors = [`#usp${uniqId()}`];
            $target.html(`
                <div class="inputHeader"><!--Keys:--></div>
                <div class="userInput"><select id="${selectors[0].substr(1)}"><option></option></select></div>
                `);
            if (multiple) {
                $target.find('select')
                    .attr("multiple", "multiple")
                    .addClass("chosen-select");
            }
            if (required) {
                $target.find('select')
                    .attr("required", "required");
            }
            parsedResults = parseKPIs(data);
            drawKPIsJQ(parsedResults, selectors[0]);
            $("#swaps").html();

            if (whereClause) {
                let targetSelector = `#filterClause${uniqId()}`;
                $target.append(`<div class="inputHeader">Where Clause:</div>
                <div class="userInput"><input id="${targetSelector.substr(1)}" class="filterClause"></div>
                `);
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector, slicer: slicer, whereClause: whereClause };
                $target.on("change", "select", eventData, previewChangeHandlerKeyWhereClause);
                $target.find("select:first-of-type").trigger("change");
            } else {
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: '', slicer: slicer, whereClause: whereClause };
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
            if (multiple) {
                $target.find(`#${selectors[1].substr(1)}`)
                    .attr("multiple", "multiple")
                    .addClass("chosen-select");
            }
            if (required) {
                $target.find(`#${selectors[1].substr(1)}`)
                    .attr("required", "required");
            }

            if (whereClause) {
                let targetSelector = `#filterClause${uniqId()}`;
                $target.append(`<div class="inputHeader">Where Clause:</div>
                <div class="userInput"><input id="${targetSelector.substr(1)}" class="filterClause"></div>
                `);
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector, slicer: slicer, whereClause: whereClause};
                $target.on("change", "select", eventData, previewChangeHandlerKeyVal);
                $target.find("select:first-of-type").trigger("change");
            } else {
                let targetSelector = '';
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector, slicer: slicer, whereClause: whereClause };
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
                <div class="userInput"><input id="${targetSelector.substr(1)}" class="filterClause"></div>
                `);
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector, slicer: slicer, whereClause: whereClause };
                $target.on("change", "select", eventData, previewChangeHandlerValX4Where);
                $target.find("select:first-of-type").trigger("change");
            } else {
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: null, slicer: slicer, whereClause: whereClause };
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
            if (multiple) {
                $target.find('select')
                    .attr("multiple", "multiple")
                    .addClass("chosen-select");
            }
            if (required) {
                $target.find('select')
                    .attr("required", "required");
            }
            let options = drawActions(data);
            $(`${selectors[0]}`).html(options);
            $("#swaps").html();

            if (whereClause) {
                let targetSelector = `#filterClause${uniqId()}`;
                $target.append(`<div class="inputHeader">Where Clause:</div>
                <div class="userInput"><input id="${targetSelector.substr(1)}" class="filterClause"></div>
                `);
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: targetSelector, slicer: slicer, whereClause: whereClause };
                $target.on("change", "select", eventData, previewChangeHandlerActionWhereClause);
                $target.find("select:first-of-type").trigger("change");
            } else {
                let eventData = { selectors: selectors, data: parsedResults, targetSelector: '', slicer: slicer, whereClause: whereClause };
                $target.on("change", "select", eventData, previewChangeHandlerAction);
                $target.find("select:first-of-type").trigger("change");
            }
            break;
        }
    }
    return parsedResults;
}


function previewChangeHandlerKey(event) {
    let $el = $(event.data.selectors[0]);

    let $option = $el.find("option:selected");
    //let val = $option.attr("data-colname") + "." + $option.val();
    let val = $option.val();
    let key = $option.text();
    let fromkey = "${" + $("#transform").val() + ".name}";
    let fromval = "${" + $("#transform").val() + ".id}";

    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
}

function previewChangeHandlerKeyEdit(event) {
    let $el = $(event.data.selectors[0]);

    let id = $el.val();
    let name = id.split('.').slice(-1);
    let fromname = "${" + $("#transform").val() + ".name}";
    let fromid = "${" + $("#transform").val() + ".id}";

    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
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

    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
}

function previewChangeHandlerAction(event) {
    let $el = $(event.data.selectors[0]);

    let $option = $el.find("option:selected");
    //let val = $option.attr("data-colname") + "." + $option.val();
    let val = $option.val();
    let from = "${" + $("#transform").val() + "}";

    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
}

function previewChangeHandlerActionWhereClause(event) {
    let $el = $(event.data.selectors[0]);
    let $target = $(event.data.targetSelector);

    let $option = $el.find("option:selected");
    let colname = $el.attr("data-colname");
    let val = $option.val();
    let from = "${" + $("#transform").val() + "}";

    let filters = [];
    if (val != null && val != '' && val != 'n/a'){
        if($option.length===1)
        filters.push(`${colname}="${val}"`);
        else if($option.length>1){ //multi-select
            let vals = $option.map(function () { return $(this).val(); })
                .get()
                .join(`", "`);
            filters.push(`${colname} IN ("${vals}")`);
        }
    }

    let filterClause = filters.length > 0 ?
        " (" + filters.join(" AND ") + ")" :
        "";
    $target.val(filterClause);

    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
}

function previewChangeHandlerKeyVal(event) {
    //use old overloaded handler, clean this up over time
    uspFilterChangeHandler(event);

    let $key = $(event.data.selectors[0]);
    let $val = $(event.data.selectors[1]);
    let $clause = $(event.data.targetSelector);

    //handle multi
    $val.filter("select.chosen-select").chosen('destroy');
    $val.filter("select.chosen-select").each((i, chose) => {
        let $chose = $(chose);
        if ($chose.find("option").length > 1) { //1 is likely default empty option
            $chose.show().chosen();
        }
    })

    //handle whereClause
    if ($clause.length) {
        $clause.val(usqlKeyValFilterBuilder($key, $val));
    }
    
    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
}

function previewChangeHandlerKeyValEdit(event) {
    let $key = $(event.data.selectors[0]);
    let $keyList = $(event.data.selectors[0] + '_list');
    let key = $key.val();
    let name = key.split('.').slice(-1)[0];
    let $val = $(event.data.selectors[1]);
    let $valList = $(event.data.selectors[1] + '_list');
    let val = $val.val();

    let uspData;
    if (typeof event !== "undefined" && typeof event.data !== "undefined" && typeof event.data.data !== "undefined") {
        uspData = event.data.data;
    }

    if (typeof key == "undefined" || key == null || key == '') { //build out key list if needed
        $keyList.html('');
        $('<option>').val('').text('n/a').appendTo($keyList);
        Object.keys(uspData).sort().forEach(function (t) {
            Object.keys(uspData[t]).sort().forEach(function (k) {
                $('<option>').val(`${t}.${k}`).text(k).attr('data-colname', t).appendTo($keyList);
            });
        });
        $val.hide();
    }

    if (key != "") {  //if we have the key draw the values
        $valList.html('');
        $('<option>').val('').text('n/a').appendTo($valList);
        Object.keys(uspData).sort().forEach(function (t) {
            Object.keys(uspData[t]).sort().forEach(function (k) {
                if (`${t}.${k}` === key)
                    uspData[t][k].sort().forEach(function (v) {
                        $('<option>').val(v).text(v).appendTo($valList);
                    });
            });
        });
        $val.show();
    }

    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
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

    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
}

function previewChangeHandlerValX4Where(event) {
    regionsChangeHandler(event);

    let val = $(event.data.targetSelector).val();

    let from = "${" + $("#transform").val() + "}";

    //generate preview if in workflow builder
    showUSQLPreviewSwaps(event);
}

function usqlCommonQueryChangeHandler() {
    let commonQueries = $("#usqlCommonQueries").val();

    switch (commonQueries) {
        case "Double/Long USPs":
            $("#usqlQuery").val('SELECT usersession.longProperties, usersession.doubleProperties FROM useraction WHERE useraction.application IN ("${app.name}") LIMIT 5000');
            $("#usqlResultSlicer").val("Keys");
            $("#transform").val("usp");
            $("#addWhereClause").prop("checked", false);
            break;
        case "String/Date USPs":
            $("#usqlQuery").val('SELECT usersession.stringProperties, usersession.dateProperties FROM useraction WHERE useraction.application IN ("${app.name}") LIMIT 5000');
            $("#usqlResultSlicer").val("Keys/Values");
            $("#transform").val("uspClause");
            $("#addWhereClause").prop("checked", false);
            break;
        case "Regions":
            $("#usqlQuery").val('SELECT DISTINCT continent, country, region, city FROM usersession WHERE useraction.application IN ("${app.name}") ORDER BY country,region,city LIMIT 5000');
            $("#usqlResultSlicer").val("ValX3");
            $("#transform").val("regionClause");
            $("#addWhereClause").prop("checked", true);
            break;
        case "Key User Actions":
            $("#usqlQuery").val('SELECT useraction.name FROM useraction WHERE useraction.application IN ("${app.name}") AND keyUserAction = true LIMIT 5000');
            $("#usqlResultSlicer").val("actions");
            $("#transform").val("kua");
            $("#addWhereClause").prop("checked", true);
            break;
        case "Distinct Actions":
            $("#usqlQuery").val('SELECT DISTINCT useraction.name FROM useraction WHERE useraction.application IN ("${app.name}") LIMIT 5000');
            $("#usqlResultSlicer").val("actions");
            $("#transform").val("action");
            $("#addWhereClause").prop("checked", true);
            break;
        case "Conversion Goals":
            $("#usqlQuery").val('SELECT useraction.matchingConversionGoals FROM useraction WHERE useraction.application IN ("${app.name}") AND matchingConversionGoals IS NOT NULL LIMIT 5000');
            $("#usqlResultSlicer").val("actions");
            $("#transform").val("goal");
            $("#addWhereClause").prop("checked", true);
            break;
    }
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
            let multiple = $("#multiple").is(":checked");
            let required = $("#required").is(":checked");
            $("#apiQueryHeader").text(query);
            let p2 = loadUsqlQueryOptions(query, slicer, $target, whereClause, multiple, required);
            $.when(p2).done(function (data) {
                jsonviewer(data, true, "", "#apiResult");
                $(".chosen-select").chosen();
            });
        });
    });
}

function usqlSlicerChangeHandler() {
    let slicer = $("#usqlResultSlicer").val();

    switch (slicer) {
        case "Keys/Values_edit":
        case "Keys_edit":
            $("#addWhereClause").prop("checked", false);
            $("#multiple").prop("checked", false);
            $("#multiBox").hide();
            $("#whereClauseBox").hide();
            break;
        default:
            $("#multiBox").show();
            $("#whereClauseBox").show();
    }
}

function showUSQLPreviewSwaps(event) {
    //PREVIEW
    let $preview = $("#preview");
    if ($preview.length) {
        let transform = $("#transform").val();
        let slicer = event.data.slicer;
        let whereClause = event.data.whereClause;
        let swaps = usqlSelectGetSwaps(slicer, $preview, transform, [], whereClause);
        let previewSwaps = $(`<table class="dataTable">`);
        previewSwaps.append(`<thead><tr><td>From</td><td>To</td></tr></thead>`);
        swaps.forEach((x) => {
            previewSwaps.append(`<tr><td>${x.from}</td><td>${x.to}</td></tr>`);
        });
        $("#swaps").html(previewSwaps);
    }
}

function usqlKeyValFilterBuilder(keySelector, valSelector) {
    let $key = $(keySelector);
    let key = $key.val();
    let $keyOpt = $key.find("option:selected");
    let type = (($keyOpt.length > 0) ?
        $keyOpt[0].dataset['colname'] :
        undefined);
    let $val = $(valSelector).find("option:selected");
    let val = $val.val();
    let filterClause = "";
    let filters = [];

    if (key != '' && type != '' && val != '' &&
        key != null && type != null && val != null) {
        if ($val.length === 1)
            filters.push(`${type}.${key}="${val}"`);
        else if ($val.length > 1) {
            let vals = $val.map(function () { return $(this).val(); })
                .get()
                .join(`", "`);
            filters.push(`${type}.${key} IN ("${vals}")`);
        }
    }

    filterClause = filters.length > 0 ?
        " AND (" + filters.join(" AND ") + ")" :
        "";

    return filterClause;
}
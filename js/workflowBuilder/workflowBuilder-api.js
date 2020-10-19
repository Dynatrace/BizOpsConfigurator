/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function loadApiQuery($query) {
    $query = $($query);
    let query = $query.val();
    let slicer = $query.siblings(".apiResultSlicer").val();
    let $target = $query.siblings(".workflowSelect");
    if (typeof selection.swaps !== "undefined") query = queryDoSwaps(query, selection.swaps);
    if (selection.config.convertSelectToDatalist){
        let id = $target.attr("id");
        let $input = $("<input>")
            .attr("id",id)
            .attr("list",id+'_list')
            .insertBefore($target);
        let $datalist = $("<datalist>");
        //copy attrs
        let a = $target[0].attributes;
        for(let i=0; i < a.length; i++){
            $datalist.attr(a[i].name,a[i].value);
        }
        $datalist.html($target.html());
        $datalist.attr("id",id+'_list');
        //replace element
        $target.replaceWith($datalist);
        $target = $datalist;
    }
    if (!query.match(/^\/api\//)) {
        console.log(`invalid api query: ${query}`);
        return;
    }
    let p1 = loadApiQueryOptions(query, slicer, $target);
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
            let appid = data.entityId;
            let appname = data.displayName;
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
            valueMap.forEach((val, key, map) => { parsedResults.push({ value: val.id, key: key, type: val.type, appid: appid, appname: appname, colname: 'useraction.name' }); });
            parsedResults = parsedResults.sort((a, b) => a.key.toLowerCase() > b.key.toLowerCase() ? 1 : -1);
            break;
    }
    return parsedResults.sort((a, b) => (a.key.toLowerCase() > b.key.toLowerCase()) ? 1 : -1);
}

function apiQueryChangeHandlerKeyVal(event) {

    let $select = $(event.data.selectors[0]);
    let transform = $("#transform").val();
    let swaps = [];
    let preview = $(`<table class="dataTable">`);

    preview.append(`<thead><tr><td>From</td><td>To</td></tr></thead>`);
    apiSelectGetSwaps($select, transform, swaps);
    swaps.forEach((x) => {
        preview.append(`<tr><td>${x.from}</td><td>${x.to}</td></tr>`);
    });
    $("#swaps").html(preview);
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
                if($target.hasClass("chosen-select"))
                    $target.chosen();
            });
        })
    });
}

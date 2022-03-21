/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function ConfigPusherFactory(target, transform, configPushType, configPushFile, customServiceTech = null, customMetricType = null) { //ConfigPusher factory, usage: var cp = ConfigPusherFactory("#viewport","AutoTag","config/MyAutoTag.json");
    let mainP = $.Deferred();
    //public data

    //private data
    let configData = {};
    let configured = false;
    let alternates = [];
    let $target = $(target);
    let $altSelect = {};
    let $button = {};
    let $html = {};

    //private methods
    function loadConfigJSON() {
        if (typeof selection == "undefined" ||
            typeof selection.config == "undefined" ||
            typeof selection.config.githubRepo == "undefined") {
            console.log("loadConfigJSON but repo not set");
            return;
        }

        let repo = selection.config.githubRepo;
        let owner = selection.config.githubUser;
        let path = selection.config.githubPath;

        //"https://raw.githubusercontent.com/TechShady/Dynatrace-Dashboards/master/FunnelAnalysisStep2.json"
        let file = `https://raw.githubusercontent.com/${owner}/${repo}/master/${path != "" ? path + '/' : ''}${configPushFile}`;
        let p = $.get(file);

        $.when(p).done(function (data) {
            try {
                if (data.includes('${'))
                    data = queryDoSwaps(data, selection.swaps);
                configData = JSON.parse(data);
            } catch (err) {
                configData = {};
                console.log(err);
            }
        })
        return p;
    }

    function checkForExistingConfig() {
        let c = configData;
        let p = {};

        switch (configPushType) {
            case "Autotag": {
                let query = `/api/config/v1/autoTags`;
                p = dtAPIquery(query);
                $.when(p).done(function (result) {
                    if (result.values.find(x => x.id === c.id && x.name === c.name)) {
                        configured = true;
                    } else {
                        configured = false;
                        alternates = result.values;
                    }
                });
                break;
            }
            case "MZ": {
                let query = `/api/config/v1/managementZones`;
                p = dtAPIquery(query);
                $.when(p).done(function (result) {
                    if (result.values.find(x => x.id === c.id && x.name === c.name)) {
                        configured = true;
                    } else {
                        configured = false;
                        alternates = result.values;
                    }
                });
                break;
            }
            case "RequestAttribute": {
                let query = `/api/config/v1/service/requestAttributes`;
                p = dtAPIquery(query);
                $.when(p).done(function (result) {
                    if (result.values.find(x => x.id === c.id && x.name === c.name)) {
                        configured = true;
                    } else {
                        configured = false;
                        alternates = result.values;
                    }
                });
                break;
            }
            case "CustomService": {
                let query = `/api/config/v1/service/customServices/${customServiceTech}`; //get tech from workflow creator
                p = dtAPIquery(query);
                $.when(p).done(function (result) {
                    if (result.values.find(x => x.id === c.id && x.name === c.name)) {
                        configured = true;
                    } else {
                        configured = false;
                        alternates = result.values;
                    }
                });
                break;
            }
            case "Extension": {
                let query = `/api/config/v1/extensions`; //need zip file handling here
                p = dtAPIquery(query);
                $.when(p).done(function (result) {
                    if (result.values.find(x => x.id === c.id && x.name === c.name)) {
                        configured = true;
                    } else {
                        configured = false;
                        alternates = result.values;
                    }
                });
                break;
            }
            case "CustomMetric": {
                let query = `/api/config/v1/calculatedMetrics/${customMetricType}`;
                p = dtAPIquery(query);
                $.when(p).done(function (result) {
                    let MK = (c.hasOwnProperty("tsmMetricKey")?"tsmMetricKey":"metricKey");
                    if (result.values.find(x => x.id === c[MK] && x.name === c.name)) {
                        configured = true;
                    } else {
                        configured = false;
                        alternates = result.values;
                    }
                });
                break;
            }
            case "SLO": {
                let query = `/api/v2/slo/sloSelector=${encodeURIComponent(sloSelector)}&sort=name&timeFrame=CURRENT&pageIdx=1&demo=false&evaluate=false&enabledSlos=true`;
                p = dtAPIquery(query);
                $.when(p).done(function (result) {
                    if (result.totalCount === 1) {
                        configured = true;
                    } else if (result.totalCount > 1){
                        configured = true;
                        alternates = result.values;
                    } else {
                        configured = false;
                        alternates = result.values;
                    }
                });
                break;
            }
            default: {
                console.log("unknown checkForExistingConfig type");
                break;
            }
        }
        return p;
    }

    function displayUserChoice() {
        $target.empty();
        if (configured) {
            $html = $(`<span>✅ ${configPushType} found.</span>`);
            $html.appendTo($target);
        } else {
            let buttonID = `button${uniqId()}`;
            let altID = `select${uniqId()}`;
            $html = $(`<span><input type="button" id="${buttonID}" value="Push Config"> 
            or choose alternate: </span>`);
            $altSelect = $(`<select id="${altID}">`)
                .appendTo($html);
            alternates.forEach(function (i) {
                let $opt = $("<option>");
                $opt.val(i.id)
                    .text(i.name)
                    .appendTo($altSelect);
            });
            $html.appendTo($target);
            $button = $(`#${buttonID}`);
            $button.on("click", pushConfig);
        }
    }

    function pushConfig() {
        let c = configData;
        let data = JSON.stringify(c);
        let p = {};

        switch (configPushType) {
            case "Autotag": {
                let query = `/api/config/v1/autoTags/${c.id}`;
                p = dtAPIquery(query, { method: "PUT", data: data });
                $.when(p).done(refreshConfigPusher);
                break;
            }
            case "MZ": {
                let query = `/api/config/v1/managementZones/${c.id}`;
                p = dtAPIquery(query, { method: "PUT", data: data });
                $.when(p).done(refreshConfigPusher);
                break;
            }
            case "RequestAttribute": {
                let query = `/api/config/v1/service/requestAttributes/${c.id}`;
                p = dtAPIquery(query, { method: "PUT", data: data });
                $.when(p).done(refreshConfigPusher);
                break;
            }
            case "CustomService": {
                let query = `/api/config/v1/service/customServices/${customServiceTech}/${c.id}`;
                p = dtAPIquery(query, { method: "PUT", data: data });
                $.when(p).done(refreshConfigPusher);
                break;
            }
            case "Extension": {
                let query = `/api/config/v1/extensions/${c.id}`; //need some sort of zip handling here
                p = dtAPIquery(query, { method: "PUT", data: data });
                $.when(p).done(refreshConfigPusher);
                break;
            }
            case "CustomMetric": {
                c = configData;
                let MK = (c.hasOwnProperty("tsmMetricKey")?"tsmMetricKey":"metricKey");
                let parts = c[MK].split(':');
                c[MK] = parts[0] + ':' +
                    parts[1].replace(/[/,: ]/g,'_'); //app.name may have reserved chars, but don't replace :
                data = JSON.stringify(c);
                let query = `/api/config/v1/calculatedMetrics/${customMetricType}`;
                p = dtAPIquery(query, { method: "POST", data: data });
                $.when(p).done(refreshConfigPusher);
                break;
            }
            case "SLO": {
                let query = `/api/v2/SLO`;
                if(c.hasOwnProperty('id')) {
                    delete c.id;
                    data = JSON.stringify(c);
                }
                p = dtAPIquery(query, { method: "PUSH", data: data });
                $.when(p).done(refreshConfigPusher);
                break;
            }
            /*case "FULL_WEB_REQUEST": {
                let query = `/api/config/v1/service/detectionRules/FULL_WEB_REQUEST/${customServiceTech}/${c.id}`;
                p = dtAPIquery(query, { method: "PUT", data: data });
                $.when(p).done(refreshConfigPusher);
                break;
            }*/
            default: {
                console.log("unknown checkForExistingConfig type");
                break;
            }
        }
        return p;
    }

    //public methods
    function refreshConfigPusher() {
        let p1 = checkForExistingConfig();
        $.when(p1).done(displayUserChoice);
    }

    function addCPToSwaps(swaps) {
        if (configured) {
            switch (configPushType) {
                case "CustomMetric":
                    addToSwaps(swaps, { from: '${' + transform + '.mtype}', to: customMetricType });
                    addToSwaps(swaps, { from: '${' + transform + '.id}', to: configData.metricKey });
                    addToSwaps(swaps, { from: '${' + transform + '.name}', to: configData.name });
                    addToSwaps(swaps, { from: '${' + transform + '.type}', to: configPushType });
                    break;
                case "CustomService":
                    addToSwaps(swaps, { from: '${' + transform + '.tech}', to: customServiceTech });
                    addToSwaps(swaps, { from: '${' + transform + '.id}', to: configData.id });
                    addToSwaps(swaps, { from: '${' + transform + '.name}', to: configData.name });
                    addToSwaps(swaps, { from: '${' + transform + '.type}', to: configPushType });
                    break;
                //case "Extension":
                //case "Autotag":
                //case "MZ":
                //case "RequestAttribute":
                default:
                    addToSwaps(swaps, { from: '${' + transform + '.id}', to: configData.id });
                    addToSwaps(swaps, { from: '${' + transform + '.name}', to: configData.name });
                    addToSwaps(swaps, { from: '${' + transform + '.type}', to: configPushType });
            }
        } else if (Object.entries($altSelect).length) {
            let id = $altSelect.val();
            let name = $altSelect.find("option:selected").text();

            switch (configPushType) {
                case "CustomMetric":
                    addToSwaps(swaps, { from: '${' + transform + '.mtype}', to: customMetricType });
                    addToSwaps(swaps, { from: '${' + transform + '.id}', to: id });
                    addToSwaps(swaps, { from: '${' + transform + '.name}', to: name });
                    addToSwaps(swaps, { from: '${' + transform + '.type}', to: configPushType });
                    break;
                case "CustomService":
                    addToSwaps(swaps, { from: '${' + transform + '.tech}', to: customServiceTech });
                    addToSwaps(swaps, { from: '${' + transform + '.id}', to: id });
                    addToSwaps(swaps, { from: '${' + transform + '.name}', to: name });
                    addToSwaps(swaps, { from: '${' + transform + '.type}', to: configPushType });
                    break;
                //case "Extension":
                //case "Autotag":
                //case "MZ":
                //case "RequestAttribute":
                default:
                    addToSwaps(swaps, { from: '${' + transform + '.id}', to: id });
                    addToSwaps(swaps, { from: '${' + transform + '.name}', to: name });
                    addToSwaps(swaps, { from: '${' + transform + '.type}', to: configPushType });
            }
        } else {
            console.log("Tried to addToSwaps w/o configPusher ready");
        }
    }

    //constructor
    let p0 = loadConfigJSON();

    $.when(p0).done(function () {
        let p1 = checkForExistingConfig();

        $.when(p1).done(function () {
            displayUserChoice();

            mainP.resolve({ html: $html, refreshConfigPusher, addCPToSwaps });
        })
    });
    return mainP;
}
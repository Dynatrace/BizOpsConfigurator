/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function ConfigPusherFactory(target, configPushType, configPushFile) { //JourneyPicker factory, usage: var jp = JourneyPickerFactory("#viewport",{name:"www.angular.easytravel.com",id:"APPLICATION-726A108B51CB78E2"});
    let masterP = $.Deferred();
    //public data

    //private data
    let configData={}; 
    let configured=false;
    let alternates=[];
    let $target = $(target);

    //private methods
    function loadConfigJSON() {
        if (typeof selection == "undefined" ||
            typeof selection.config == "undefined" ||
            typeof selection.config.repo == "undefined")
            return;

        let file = `https://github.com/${file.repo.owner}/${file.repo.repo}/raw/master/${configPushFile}`;
        let p = $.get(file);

        $.when(p).done(function (data) {
            configData = data;
        })
        return p;
    }

    function checkForExistingConfig() {
        let id = configData.id;

        switch (configPushType) {
            case "Autotag": {
                let query = `/api/config/v1/autoTags`;
                p = dtAPIquery(query);
                $.when(p).done(function(result){
                    if(result.values.find(x => x.id === id)){
                        configured=true;
                    } else {
                        configured=false;
                        alternates=result.values;
                    }
                });
                break;
            }
            case "MZ": {
                let query = `/api/config/v1/managementZones`;
                p = dtAPIquery(query);
                $.when(p).done(function(result){
                    if(result.values.find(x => x.id === id)){
                        configured=true;
                    } else {
                        configured=false;
                        alternates=result.values;
                    }
                });
                break;
            }
            case "RequestAttribute": {

                break;
            }
            case "CustomService": {

                break;
            }
            case "Plugin": {

                break;
            }
            default: {
                console.log("unknown checkForExistingConfig type");
                break;
            }
        }
    }


    //public methods


    //constructor
    let p0 = loadConfigJSON();

    $.when(p0).done(function () {

        masterP.resolve({ html: $html, });
    });
    return masterP;
}
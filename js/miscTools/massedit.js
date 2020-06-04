/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
function dryRunHandler(){
    if( $("#dryrun").prop("checked") == true ){
        $("#massedit").val("Dry Run");
    } else if( $("#dryrun").prop("checked") == false ){
        $("#massedit").val("Mass Edit");
    }
}

function hostMassEdit(){
    url = $("#url").val();
    if(url.length>1 && url.charAt(url.length-1)=="/")
        url = url.substring(0,url.length-1);
    token = $("#token").val();
    let dryrun = $("#dryrun").prop("checked");
    let hostGroup = $("#hostGroup").val();
    let infraMode = $("#infraMode").val();
    let monitoringEnabled = $("#monitoringEnabled").val();
    let query = `/api/v1/entity/infrastructure/hosts?includeDetails=false`;
    if(hostGroup != "")
        query += `&hostGroupName=${hostGroup}`;

    let res = dtAPIquery(query,{});
    $.when(res).done(function(data){
        let options = {
            "method": "PUT"
        };
        let numHosts = data.length;

        let hostlist = [];
        data.forEach(function(host){
            hostlist.push(`<li>${host.displayName} (${host.entityId})</li>`);
        });
        $("#hostlist").html(`<ul>${hostlist.join("\n")}</ul>`);


        if(!dryrun && confirm(`Edit ${numHosts} hosts?\nmonitoringEnabled:${monitoringEnabled}\nmonitoringMode:${infraMode}`)){
            data.forEach(function(host){
                options.data = JSON.stringify({
                    "monitoringEnabled": monitoringEnabled,
                    "monitoringMode": infraMode=="no change"?host.monitoringMode:infraMode});
                query = `/api/config/v1/hosts/${host.entityId}/monitoring`;
                dtAPIquery(query,options);
            });
        }
    });
}

function massEditInit(){
    $("#viewport").on("click", "#massedit", hostMassEdit);
    $("#viewport").on("change","#dryrun",dryRunHandler);
    dryRunHandler();
}
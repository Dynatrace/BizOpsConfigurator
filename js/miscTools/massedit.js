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

    let res = dtAPIquery(query);
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


        if(!dryrun && confirm(`Disable ${numHosts} hosts?`)){
            data.forEach(function(host){
                options.data = {
                    "monitoringEnabled": monitoringEnabled,
                    "monitoringMode": infraMode=="no change"?host.monitoringMode:infraMode};
                query = `/api/config/v1/hosts/${host.entityId}/monitoring`;
                dtAPIquery(query,options);
            });
        }
    });
}
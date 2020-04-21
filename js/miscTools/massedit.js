var url = "";
var token = "";
var dryrun = false;
const disableJSON = JSON.stringify({
    "description": "Turn it off",
    "monitoringEnabled": false,
    "monitoringMode": "CLOUD_INFRASTRUCTURE"
});

$(document).ready(function(){
    $("#disableAll").on("click", "", disableAll);
    $("#dryrun").on("change","",dryRun);
});

function dryRun(){
    if( $("#dryrun").prop("checked") == true ){
        dryrun = true;
        $("#disableAll").val("Dry Run");
    } else if( $("#dryrun").prop("checked") == false ){
        dryrun = false;
        $("#disableAll").val("Disable All");
    }
}

function disableAll(){
    url = $("#url").val();
    if(url.length>1 && url.charAt(url.length-1)=="/")
        url = url.substring(0,url.length-1);
    token = $("#token").val();
    let hostGroup = $("#hostGroup").val();
    let query = `/api/v1/entity/infrastructure/hosts?includeDetails=false`;
    if(hostGroup != "")
        query += `&hostGroupName=${hostGroup}`;

    let res = dtAPIquery(query);
    $.when(res).done(function(data){
        let options = {
            "method": "PUT",
            "data": disableJSON
        };
        let numHosts = data.length;

        let hostlist = [];
        data.forEach(function(host){
            hostlist.push(`<li>${host.displayName} (${host.entityId})</li>`);
        });
        $("#hostlist").html(`<ul>${hostlist.join("\n")}</ul>`);


        if(!dryrun && confirm(`Disable ${numHosts} hosts?`)){
            data.forEach(function(host){
                query = `/api/config/v1/hosts/${host.entityId}/monitoring`;
                dtAPIquery(query,options);
            });
        }
    });
}

function dtAPIquery(query, options={}, retries=3) {
    let success = (options.hasOwnProperty('success') ? options.success : function(data, textStatus, jqXHR)
    {//console.log("dtAPIQuery success")
    } );
    let method = (options.hasOwnProperty('method') ? options.method : "GET" );
    let data = (options.hasOwnProperty('data') ? options.data : {} );
    let error = (options.hasOwnProperty('error') ? options.error : console.log);

    //Get App list from API as JSON
    return $.ajax({
    url: url + query, 
    contentType: "application/json; charset=utf-8",
    headers: { 'Authorization': "Api-Token " + token },
    data: data,
    method: method,
    dataType: "json",
    success: success,
    error: error
    })
    .fail(function(jqXHR,textStatus,errorThrown) {
        if(jqXHR.status!=429)return; //for now only retry rate limiting
        if(retries<=0) {
            console.log("Retries exhausted.");
            return;
        }
        let seconds = 0;
        let now = 0;
        let then = 0;
        try {
            then = jqXHR.responseText.match(/Reset time:.*\(([0-9]+)\)/)[1];
            now = new Date().getTime();
            seconds = (then - now)/1000 + 1;
        } catch(e) {seconds=60;} //if we didn't capture the reset time, just default to a minute
        console.log("Inside Fail: query="+query+" retries="+retries+" seconds="+seconds+" now="+now+" then="+then);
       return setTimeout(function() {dtAPIquery(query,options,retries-1);},seconds*1000); 
    });
}
/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
function getRepoContents(repo) {
    let headers = {};
    if(githubuser!="" && githubpat!="")
        headers.Authorization = "Basic " + btoa(githubuser+":"+githubpat);
    
    //Get App list from API as JSON
    return $.ajax({
    url: "https://api.github.com/repos/"+repo.owner+"/"+repo.repo+"/contents/"+repo.path,
    contentType: "application/json; charset=utf-8",
    method: 'GET',
    dataType: "json",
    headers: headers
    })
    .fail(errorboxJQXHR);
}

function getREADME(repo){ //not used anymore
    let headers = {'Accept':'application/vnd.github.v3.html'};
    if(githubuser!="" && githubpat!="")
        headers.Authorization = "Basic " + btoa(githubuser+":"+githubpat);

    //Get README.md as HTML
    return $.get({
    url: `https://api.github.com/repos/${repo.owner}/${repo.repo}/readme`,
    headers: headers
    })
    .fail(errorboxJQXHR);
}

function parseRepoContents(data,repo) {
    let dbListTemp = [];
    let workflowsTemp = [];
    let readmesTemp = [];
    data.forEach(function(file) {
        file.repo=repo;
        let reWorkflow = /(\.cwf\.json$)/;
        let reDB = /(\.json$)|(^[0-9a-f-]{36}$)/;
        if(reWorkflow.test(file.name)){
            workflowsTemp.push(file);
        } else if(reDB.test(file.name)) {
            dbListTemp.push(file);
        } else if(file.name=="README.md") {
            readmesTemp.push(file);
        } else {
            console.log("parseRepoContents: rejected '"+file.path+"' based on regex");
        }
    });
    return {dbList:dbListTemp, workflowList: workflowsTemp, readmeList: readmesTemp};
}

function getDBJSON(list) {
    let dbs = [];
    let promises = [];

    list.forEach(function(file) {
        let p = $.get(file.download_url)
            .fail(errorboxJQXHR);
        promises.push(p);
    });

    return $.when.apply($, promises).then(function() {
        for(let i=0; i<arguments.length; i++) {
            dbs.push(JSON.parse(arguments[i][0]));;
        };
        return dbs;
    });
}

function testRepo(i=0) {
    let p1 = getRepoContents(repoList[i]);

    $.when(p1).done(function(data) {
        let repos = parseRepoContents(data,repoList[i]);

        let p2 = getDBJSON(repos);
        $.when(p2).done(function(d2) {
            console.log(d2);
        });
    });
}

/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
function getRepoContents(repo) {
    return gitHubAPI(`/repos/${repo.owner}/${repo.repo}/contents/${repo.path}`);
}

function gitHubAPICheckRateLimit(){
    return gitHubAPI("/rate_limit");
}



function gitHubAPI(query, options = {}, retries = 3) {
    let headers = (typeof options.headers != "undefined") ? options.headers : {};
    if (githubuser != "" && githubpat != "")
        headers.Authorization = "Basic " + btoa(githubuser + ":" + githubpat);

    let url = "https://api.github.com" + query;
    if (Object.keys(headers).length === 0) { //no need for preflight
        return $.ajax(url)
            .fail(gitHubAPIFailHandler);
    } else { //fine to do full preflight
        return $.ajax({
            url: url,
            contentType: "application/json; charset=utf-8",
            method: 'GET',
            dataType: "json",
            headers: headers
        })
            .fail(gitHubAPIFailHandler);
    }
}

function gitHubAPIFailHandler(jqXHR, textStatus, errorThrown) {
    if (jqXHR.getResponseHeader("X-RateLimit-Remaining") !== 0) return; //only handle ratelimiting here for now
    if (retries <= 0) {
        errorboxJQXHR(jqXHR, "Retries exhausted.", errorThrown);
        return;
    }
    let seconds = 0;
    let now = 0;
    let then = 0;
    try {
        then = parseInt(jqXHR.getResponseHeader("X-Ratelimit-Reset"));
        now = (new Date().getTime()) / 1000;
        seconds = (then - now) + 1;
    } catch (e) { seconds = 60; } //if we didn't capture the reset time, just default to a minute
    warningbox(`GitHub API Ratelimiting: retrying in ${seconds}s. Consider using GitHub PAT to avoid this.`);
    console.log("Inside Fail: query=" + query + " retries=" + retries + " seconds=" + seconds + " now=" + now + " then=" + then);
    return setTimeout(function () { gitHubAPI(query, options, retries - 1); }, seconds * 1000);
}

function getREADME(repo) { //not used anymore
    let headers = { 'Accept': 'application/vnd.github.v3.html' };
    if (githubuser != "" && githubpat != "")
        headers.Authorization = "Basic " + btoa(githubuser + ":" + githubpat);

    //Get README.md as HTML
    return $.get({
        url: `https://api.github.com/repos/${repo.owner}/${repo.repo}/readme`,
        headers: headers
    })
        .fail(errorboxJQXHR);
}

function parseRepoContents(data, repo) {
    let dbListTemp = [];
    let workflowsTemp = [];
    let readmesTemp = [];
    data.forEach(function (file) {
        file.repo = repo;
        let reWorkflow = /(\.cwf\.json$)/;
        let reDB = /(\.json$)|(^[0-9a-f-]{36}$)/;
        let reReadme = /\.md$/;
        if (reWorkflow.test(file.name)) {
            workflowsTemp.push(file);
        } else if (reDB.test(file.name)) {
            dbListTemp.push(file);
        } else if (reReadme.test(file.name)) {
            readmesTemp.push(file);
        } else {
            console.log("parseRepoContents: rejected '" + file.path + "' based on regex");
        }
    });
    return { dbList: dbListTemp, workflowList: workflowsTemp, readmeList: readmesTemp };
}

function getDBJSON(list) {
    let dbs = [];
    let promises = [];

    list.forEach(function (file) {
        let p = $.get(file.download_url)
            .fail(errorboxJQXHR);
        promises.push(p);
    });

    return $.when.apply($, promises).then(function () {
        for (let i = 0; i < arguments.length; i++) {
            dbs.push(JSON.parse(arguments[i][0]));;
        };
        return dbs;
    });
}

function testRepo(i = 0) {
    let p1 = getRepoContents(repoList[i]);

    $.when(p1).done(function (data) {
        let repos = parseRepoContents(data, repoList[i]);

        let p2 = getDBJSON(repos);
        $.when(p2).done(function (d2) {
            console.log(d2);
        });
    });
}

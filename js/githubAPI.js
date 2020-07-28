/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
function getRepoContents(repo) {
    let p1 = $.Deferred();
    let options = { headers: {} }
    if ("etag" in repo && repo.contents && repo.contents.length) {
        if ("repo" in repo.contents[0]) {
            console.log("Cleaning circular reference...");
            delete repo.etag;
            delete repo.contents;
        } else {
            options.headers['If-None-Match'] = repo.etag;
        }
    }
    if (githubuser != "" && githubpat != "")
        options.headers.Authorization = "Basic " + btoa(githubuser + ":" + githubpat);

    let p2 = gitHubAPI(`/repos/${repo.owner}/${repo.repo}/contents/${repo.path}`, options);
    $.when(p2).done(function (data, textStatus, jqXHR) {
        switch (jqXHR.status) {
            case 200: //new data
                gitHubUpdateContents(repo, data, textStatus, jqXHR);
                p1.resolve(p2);
                break;
            case 304: //no change
                let contents = JSON.parse(JSON.stringify(repo.contents));
                if ("repo" in contents[0]) {
                    contents.forEach(function (el) { delete el.repo; });
                }
                p1.resolve(contents);
                break;
        }

    })
    return p1;
}

/*function gitHubAPICheckRateLimit(){ //does not work, CORS & JSONP are broken on this endpoint
    return $.ajax({
        url: "https://api.github.com/rate_limit?callback=gitHubAPIJSONPHandler",
        dataType: "jsonp"
    }).then(gitHubAPIJSONPHandler);
}*/

function gitHubAPI(query, options = {}, retries = 3) {
    let seconds = 0;
    if (GithubRemaining < 1) { //handle rate limiting
        let then = GithubReset;
        let now = (new Date().getTime()) / 1000;
        seconds = Math.trunc(Math.max((then - now) + 1, 1));
        warningbox(`GitHub API Ratelimiting: retrying in ${seconds}s. Consider using GitHub PAT to avoid this.`);
        console.log("GitHub API Ratelimiting: query=" + query + " retries=" + retries + " seconds=" + seconds + " now=" + now + " then=" + then);
    }
    return deferredSafeDelay(gitHubAPIinner, seconds * 1000);

    function gitHubAPIinner() {
        let headers = (typeof options.headers != "undefined") ? options.headers : {};

        let url = "https://api.github.com" + query;
        return $.ajax({
            url: url,
            contentType: "application/json; charset=utf-8",
            method: 'GET',
            dataType: "json",
            headers: headers
        })
            .done(gitHubUpdateLimits) //only do this on success, over rate limit gives CORS failure for unexplained reasons
            .fail(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status !== 403) { //only do retries if it was ratelimiting
                    errorboxJQXHR(jqXHR, textStatus, errorThrown);
                    return;
                }
                if (retries <= 0) {
                    errorboxJQXHR(jqXHR, "Retries exhausted.", errorThrown);
                    return;
                }
                gitHubUpdateLimits(null, null, jqXHR);
                let then = GithubReset;
                let now = (new Date().getTime()) / 1000;
                seconds = Math.trunc(Math.max((then - now) + 1, 1));
                warningbox(`GitHub API Ratelimiting: retrying in ${seconds}s. Consider using GitHub PAT to avoid this.`);
                console.log("GitHub API Ratelimiting: query=" + query + " retries=" + retries + " seconds=" + seconds + " now=" + now + " then=" + then);
                return setTimeout(function () { return gitHubAPI(query, options, retries - 1); }, seconds * 1000);
            });
    }

    function deferredSafeDelay(f, ms) {
        let p1 = $.Deferred();
        let p2 = $.Deferred();
        setTimeout(p2.resolve, ms);

        $.when(p2).done(function () {
            let p3 = f();
            $.when(p3).done(function (data, textStatus, jqXHR) {
                p1.resolve(data, textStatus, jqXHR);
            });
        });

        return p1;
    }
}



function gitHubUpdateLimits(data, textStatus, jqXHR) {
    GithubRemaining = parseInt(jqXHR.getResponseHeader("X-RateLimit-Remaining"));
    GithubReset = parseInt(jqXHR.getResponseHeader("X-Ratelimit-Reset"));
}

function gitHubUpdateContents(repo, data, textStatus, jqXHR) {
    let etag = jqXHR.getResponseHeader("etag");
    repo.etag = etag;
    repo.contents = JSON.parse(JSON.stringify(data));
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

function parseRepoContents(data = [], repo, old) {
    let dbListTemp = [];
    let workflowsTemp = [];
    let readmesTemp = [];
    data.forEach(function (file) {
        repo = JSON.parse(JSON.stringify(repo));
        if ("contents" in repo) delete repo.contents;
        file.repo = repo;
        let reWorkflow = /(\.cwf\.json$)/;
        let reDB = /(\.json$)|(^[0-9a-f-]{36}$)/;
        let reReadme = /\.md$/;
        if (reWorkflow.test(file.name)) {
            let oldMatch = old.workflowList.find((x) => x.git_url == file.git_url); //checks repo, filename, and sha
            if (typeof oldMatch != "undefined")
                workflowsTemp.push(oldMatch);
            else
                workflowsTemp.push(file);
        } else if (reDB.test(file.name)) {
            let oldMatch = old.dbList.find((x) => x.git_url == file.git_url); //checks repo, filename, and sha
            if (typeof oldMatch != "undefined")
                dbListTemp.push(oldMatch);
            else
                dbListTemp.push(file);
        } else if (reReadme.test(file.name)) {
            let oldMatch = old.readmeList.find((x) => x.git_url == file.git_url); //checks repo, filename, and sha
            if (typeof oldMatch != "undefined")
                readmesTemp.push(oldMatch);
            else
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

function loadEverythingFromGithubAndCache() {
    let p = $.Deferred();
    if (OfflineMode) {
        console.log("Configurator in offline mode...");
        //Github repos
        dbLoadRepoList()
            //Load from IndexedDB cache
            .then(dbLoadWorkflowList)
            .then(dbLoadReadmeList)
            .then(dbLoadDBList)
            .then(() => { p.resolve(); });
    } else {
        //Github repos
        dbLoadRepoList()
            .then(loadGithubRepos)
            //Load from IndexedDB cache
            .then(dbLoadWorkflowList)
            .then(dbLoadReadmeList)
            .then(dbLoadDBList)
            //Download files
            .then(downloadWorkflowsFromList)
            .then(downloadReadmesFromList)
            .then(downloadDBsFromList)
            //Store in IndexedDB cache
            .then(dbPopulateRepoList)
            .then(dbPopulateWorkflowList)
            .then(dbPopulateReadmeList)
            .then(dbPopulateDBList)
            .then(() => { p.resolve(); });
    }

    return p;
}
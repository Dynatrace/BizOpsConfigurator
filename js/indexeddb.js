/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

/////////// Create DB ////////////
function openOrCreateDB() {
    let p = $.Deferred();
    let db = Idxdb; //local ref to global obj

    if (!window.indexedDB) {
        alert("Your browser is too old to support IndexedDB. Please upgrade.");
        return false;
    }

    let request = window.indexedDB.open(db.name, db.version);
    request.onupgradeneeded = upgradeDB;
    request.onsuccess = (e) => {
        db.db = e.target.result;
        p.resolve(db);
    }
    request.onerror = () => { p.resolve(null); }
    return p;
}

function upgradeDB(e) {
    let db = e.target.result;

    if (event.oldVersion < 1) {
        let os = {};
        os = db.createObjectStore("repoList", { keyPath: ["owner", "repo", "path"] });
        os = db.createObjectStore("dbList", { keyPath: "sha" });
        os.createIndex("by_ID", "file.id");
        os = db.createObjectStore("workflowList", { keyPath: "sha" });
        os = db.createObjectStore("readmeList", { keyPath: "sha" });
    }
}


/////////// Populate DB ////////////
function dbPopulateRepoList() {
    let list = repoList;
    let p = $.Deferred();
    let db = Idxdb.db;
    let tx = db.transaction(["repoList"], "readwrite");
    let os = tx.objectStore("repoList");

    list.forEach((repo) => {
        os.put(repo);
    });

    tx.oncomplete = () => { p.resolve(true); }
    tx.onerror = (e) => {
        console.log("dbPopulateRepoList error: " + e.target.errorCode)
        p.resolve(false);
    }
    return p;
}

function dbPopulateDBList() {
    let list = dbList;
    let p = $.Deferred();
    let db = Idxdb.db;
    let tx = db.transaction(["dbList"], "readwrite");
    let os = tx.objectStore("dbList");

    list.forEach((el) => {
        if ("repo" in el && "contents" in el.repo) delete el.repo.contents;
        os.put(el);
    });

    tx.oncomplete = () => { p.resolve(true); }
    tx.onerror = (e) => {
        console.log("dbPopulateDBList error: " + e.target.errorCode)
        p.resolve(false);
    }
    return p
}

function dbPopulateWorkflowList() {
    let list = workflowList;
    let p = $.Deferred();
    let db = Idxdb.db;
    let tx = db.transaction(["workflowList"], "readwrite");
    let os = tx.objectStore("workflowList");

    list.forEach((wf) => {
        os.put(wf);
    });

    tx.oncomplete = () => { p.resolve(true); }
    tx.onerror = (e) => {
        console.log("dbPopulateWorkflowList error: " + e.target.errorCode)
        p.resolve(false);
    }
    return p
}

function dbPopulateReadmeList() {
    let list = readmeList;
    let p = $.Deferred();
    let db = Idxdb.db;
    let tx = db.transaction(["readmeList"], "readwrite");
    let os = tx.objectStore("readmeList");

    list.forEach((rm) => {
        os.put(rm);
    });

    tx.oncomplete = () => { p.resolve(true); }
    tx.onerror = (e) => {
        console.log("dbPopulateReadmeList error: " + e.target.errorCode)
        p.resolve(false);
    }
    return p
}



/////////// Load from DB ////////////
function dbLoadRepoList() {
    let list = repoList;
    let p = $.Deferred();
    let db = Idxdb.db;
    let tx = db.transaction(["repoList"], "readonly");
    let os = tx.objectStore("repoList");
    let req = os.getAll();

    req.onsuccess = () => {
        req.result.forEach(repo => {
            let i = list.findIndex(x =>
                x.owner === repo.owner && x.repo === repo.repo && x.path === repo.path);
            if (i > -1)
                list[i] = repo; //update if exists
            else if (repo.personal)
                list.push(repo); //add any personal ones
        })
    }

    tx.oncomplete = () => { p.resolve(true); }
    tx.onerror = (e) => {
        console.log("dbLoadRepoList error: " + e.target.errorCode)
        p.resolve(false);
    }
    return p
}

function dbLoadDBList() {
    let list = dbList;
    let p = $.Deferred();
    let db = Idxdb.db;
    let tx = db.transaction(["dbList"], "readonly");
    let os = tx.objectStore("dbList");
    let req = os.getAll();

    req.onsuccess = () => {
        req.result.forEach(el => {
            if ("repo" in el && "contents" in el.repo) delete el.repo.contents;

            let i = list.findIndex(x => x.sha === el.sha && x.name === el.name);
            if (i > -1) {
                list[i] = el; //update if exists
            } else {
                //console.log("dbLoadDBList miss, sha: "+el.sha+" name:"+el.name);
            }


        })
    }

    tx.oncomplete = (e) => { p.resolve(true); }
    tx.onerror = (e) => {
        console.log("dbLoadDBList error: " + e.target.errorCode)
        p.resolve(false);
    }
    return p
}

function dbLoadWorkflowList() {
    let list = workflowList;
    let p = $.Deferred();
    let db = Idxdb.db;
    let tx = db.transaction(["workflowList"], "readonly");
    let os = tx.objectStore("workflowList");
    let req = os.getAll();

    req.onsuccess = () => {
        req.result.forEach(el => {
            let i = list.findIndex(x => x.sha === el.sha && x.name === el.name);
            if (i > -1)
                list[i] = el; //update if exists

        })
    }

    tx.oncomplete = () => { p.resolve(true); }
    tx.onerror = (e) => {
        console.log("dbLoadWorkflowList error: " + e.target.errorCode)
        p.resolve(false);
    }
    return p
}

function dbLoadReadmeList() {
    let list = readmeList;
    let p = $.Deferred();
    let db = Idxdb.db;
    let tx = db.transaction(["readmeList"], "readonly");
    let os = tx.objectStore("readmeList");
    let req = os.getAll();

    req.onsuccess = () => {
        req.result.forEach(el => {
            let i = list.findIndex(x => x.sha === el.sha && x.name === el.name);
            if (i > -1)
                list[i] = el; //update if exists

        })
    }

    tx.oncomplete = () => { p.resolve(true); }
    tx.onerror = (e) => {
        console.log("dbLoadReadmeList error: " + e.target.errorCode)
        p.resolve(false);
    }
    return p
}
const https = require('https');
var AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: "us-east-1" });
const zlib = require('zlib');

const repos = [
    { 'owner': 'TechShady', 'repo': 'Dynatrace-DashboardV5', 'path': '' },
    { 'owner': 'TechShady', 'repo': 'Dynatrace-Dashboards', 'path': '' },
    { 'owner': 'TechShady', 'repo': 'Dynatrace-Remote-Employee', 'path': '' },
    { 'owner': 'TechShady', 'repo': 'Dynatrace-Infrastructure', 'path': '' },
    { 'owner': 'TechShady', 'repo': 'BizOpsLite', 'path': '' },
    { 'owner': 'LucasHocker', 'repo': 'DashboardTemplates', 'path': 'v1.192.96' },
    { 'owner': 'LucasHocker', 'repo': 'DashboardTemplates', 'path': '' },
    { 'owner': 'Dynatrace-JasonOstroski', 'repo': 'CitrixDynatraceDashboards', 'path': '' },
    { 'owner': 'jjbologna', 'repo': 'SAP-extension-dashboards', 'path': '' },
    { 'owner': 'JLLormeau', 'repo': 'dynatrace_template_fr', 'path': '' },
    { 'owner': 'popecruzdt', 'repo': 'BizOpsConfiguratorPacks', 'path': '' },
    { 'owner': 'mcaminiti', 'repo': 'dynatrace-dashboards-dem-usage', 'path': '' },
    { 'owner': 'imrankhan4z', 'repo': 'Dynatrace_Dashboards', 'path': '' },
    { 'owner': 'sergiohinojosa', 'repo': 'dashboards-dt-kubernetes', 'path': '' },
    { 'owner': 'br-se', 'repo': 'poc-dashboards', 'path': '' },
    { 'owner': 'mikeferg99', 'repo': 'dashboards', 'path': '' }
];


//// main
exports.handler = async (event) => {
    let mainResolve, mainReject,
        mainPromise = new Promise((resolve, reject) => {
            mainResolve = resolve;
            mainReject = reject;
        });
    let dashboards = [];
    let workflows = [];
    let readmes = [];
    let promises = [];
    let data = {
        dashboards: dashboards,
        workflows: workflows,
        readmes: readmes
    }

    for (const repo of repos) {
        let contents = await getRepo(repo);
        if (contents && Array.isArray(contents)) {
            parseRepoContents(contents, repo, data);
            repo.success = true;
        } else {
            console.log(`repo contents: ${JSON.stringify(contents).substring(0, 100)}`);
            repo.success = false;
        }
    }

    console.log(`data length: ` + JSON.stringify({ dashboards: dashboards.length, readmes: readmes.length, workflows: workflows.length }));
    for (const db of dashboards) {
        let p = downloadDB(db);
        promises.push(p);
    }
    for (const wf of workflows) {
        let p = downloadWF(wf);
        promises.push(p);
    }
    for (const rm of readmes) {
        let p = downloadRM(rm);
        promises.push(p);
    }

    Promise.allSettled(promises).then(async (results) => {
        let output = JSON.stringify({
            dbList: dashboards,
            repos: repos,
            readmeList: readmes,
            workflowList: workflows
        });
        let zipped = zlib.gzipSync(output);
        let success = repos.filter(r => r.success).length;
        const filename = `dashboardpack-${(new Date()).getTime()}.json.gz`;
        const latest = `dashboardpack-latest.json.gz`;

        try {
            //upload unique object
            const s3response = await s3.upload({
                Bucket: "bizopsconfigurator",
                Key: filename,
                Body: zipped,
                ContentType: 'application/gzip'
            }).promise();

            //copy to latest
            const s3response2 = await s3.copyObject({
                Bucket: "bizopsconfigurator",
                Key: latest,
                CopySource: `bizopsconfigurator/${filename}`
            }).promise();

            //done
            const response = {
                statusCode: 200,
                body: JSON.stringify(`Successfully loaded ${success} of ${repos.length} repos and wrote to S3.`),
            };
            mainResolve(response);
        } catch (e) {
            /*const response = {
                statusCode: (success == repos.length ? 200 : 500),
                body: JSON.stringify(`Successfully loaded ${success} of ${repos.length} repos, but failed to write to S3. ` + e),
            };*/
            mainReject(e);
        }
    });

    return mainPromise;
};

//// Async functions
async function download(url) {
    const opts = {
        headers: {
            'User-Agent': 'populateBizOpsConfigurator'
        }
    }

    const promise = new Promise(function (resolve, reject) {
        const request = function (url, opts) {
            const req = https.get(url, opts, (res) => {
                if(res.statusCode === 301 || res.statusCode === 302) {
                    return request(res.headers.location,opts);
                  } else if(res.statusCode >= 400){
                    console.error(`https call to ${url} failed with statusCode ${res.statusCode}`);
                    reject();
                  } else {
                    let data = "";
                    res.on('data', chunk => { data += chunk; });
                    res.on('end', () => {
                        resolve(data);
                    });
                }
            }).on('error', (e) => {
                console.error(e);
                reject();
            })
        }

        request()
    })
    return promise;
}

async function downloadJSON(url) {
    let p = download(url);
    return p.then((data) => {
        try {
            let json = JSON.parse(data);
            return (json);
        } catch (e) {
            console.warn(e);
            console.log(`url source: ${url}`);
            console.log(`downloaded data: ${JSON.stringify(data).substring(0, 100)}`);
            throw new Error(e);
        }
    })
}

async function getRepo(repo) {
    let url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${repo.path}`;
    return downloadJSON(url);
}

async function downloadDB(db) {
    let file = await downloadJSON(db.download_url);
    if (file) {
        db.file = file;
        db.success = true;
    } else {
        db.success = false;
    }
}

async function downloadWF(wf) {
    let file = await downloadJSON(wf.download_url);
    if (file) {
        wf.file = file;
        wf.success = true;
    } else {
        wf.success = false;
    }
}

async function downloadRM(rm) {
    let file = await download(rm.download_url);
    if (file) {
        rm.file = file;
        rm.html = ""; //convert MD and sanitize on client side, not here
        rm.success = true;
    } else {
        rm.success = false;
    }
}

//// other functions


function parseRepoContents(contents = [], repo, data = {}) {
    if (Array.isArray(contents)) {
        console.log(`files: ${contents.length}`);
        contents.forEach(function (file) {
            file.repo = repo;
            const reWorkflow = /(\.cwf\.json$)/;
            const reDB = /(\.json$)|(^[0-9a-f-]{36}$)/;
            const reReadme = /\.md$/;
            if (reWorkflow.test(file.name)) {
                data.workflows.push(file);
            } else if (reDB.test(file.name)) {
                data.dashboards.push(file);
            } else if (reReadme.test(file.name)) {
                data.readmes.push(file);
            } else {
                console.log("parseRepoContents: rejected '" + file.path + "' based on regex");
            }
        });
    } else {
        console.warn(`contents not an array: ${JSON.stringify(contents).substring(0, 100)}`);
    }
}
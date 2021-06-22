/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

async function runMZcleanupReport() {
    let HOST = getURL(`#url`);
    let TOKEN = $(`#token`).val();
    let SCOPES = [];
    let SELFHEALTHHOST = getURL(`#selfhealthurl`);
    let SELFHEALTHTOKEN = $(`#selfhealthtoken`).text();
    let MZLIST = [];
    let $infobox = $(`#MZ-infobox`);
    let valid = await checkTokenScopes();

    if(valid){
        await getAllTheData();
        generateReports();
    }
    


    ////////////////////////////////////////
    async function checkTokenScopes(){
        let required = [
            "ReadConfig",
            "entities.read"
        ];
        let url = `${HOST}/api/v1/tokens/lookup`;

        $infobox.removeClass('invalid');
        const response = await fetch(url,{
            method: "post",
            body: JSON.stringify({
                "token": TOKEN
            })
        })
        const res = await response.json();
        SCOPES = res.scopes;
        let missing = required.filter(x => !SCOPES.includes(x));
        if(missing.length){
            $infobox.text(`Missing token scopes: ${missing.join(', ')}.<br>`);
            $infobox.addClass('invalid');
            return false;
        }
        return true;
    }

    async function getAllTheData() {
        await getMZlist();
        await getHostsPerMZ();
        await getRulesPerMZ();
        if(SELFHEALTHHOST && SELFHEALTHTOKEN)
            await getSelfHealthUsagePerMZ();
    }

    function generateReports() {
        $(`#MZ-list`).text(JSON.stringify(MZLIST,null,3));
        listOfEmptyMZs();
        listDupMZs();
        listFrequentRules();
        listUnusedMZs();
    }

    function disableRulesForAll() {

    }

    function deleteAll() {

    }

    async function getMZlist() {
        let url = `${HOST}/api/config/v1/managementZones?Api-Token=${TOKEN}`;
        const response = await fetch(url)
        const res = await response.json();
        MZLIST = res.values;
        $infobox.text(`Retrieved ${MZLIST.length} MZs.<br>`)
    }

    async function getHostsPerMZ() {
        $infobox.append(`Firing ${MZLIST.length} XHRs to get a count of hosts in MZ... Please be patient.<br>`);
        let $status = $(`<span>`).appendTo($infobox);
        let xhrCount = 0;

        for (let i = 0; i < MZLIST.length; i++) {
            let mz = MZLIST[i];
            let entitySelector = encodeURIComponent(`type("HOST"),mzId(${mz.id})`);
            let url = `${HOST}/api/v2/entities?pageSize=1&entitySelector=${(entitySelector)}&Api-Token=${TOKEN}`;

            if (!mz.hasOwnProperty('hosts')) {
                const response = await fetch(url)
                const hosts = await response.json();
                mz.hosts = hosts.totalCount;
                xhrCount++;
            }
            if (i && i % 100 === 0)
                $status.text(`${i} XHRs complete`);
        }

        $status.text(`all XHRs complete.<br>`);
        return await xhrCount;
    }

    async function getRulesPerMZ() {
        $infobox.append(`Firing ${MZLIST.length} XHRs to get a list of rules... Please be patient.<br>`);
        let $status = $(`<span>`).appendTo($infobox);
        let xhrCount = 0;

        for (let i = 0; i < MZLIST.length; i++) {
            let mz = MZLIST[i];
            let entitySelector = encodeURIComponent(`type("HOST"),mzId(${mz.id})`);
            let url = `${HOST}/api/config/v1/managementZones/${mz.id}?Api-Token=${TOKEN}`;

            if (!mz.hasOwnProperty('rules') || !Array.isArray(mz.rules) || !mz.rules.length) {
                const response = await fetch(url)
                const res = await response.json();
                mz.rules = res.rules;
                xhrCount++;
            }
            if (i && i % 100 === 0)
                $status.text(`${i} XHRs complete`);
        }

        $status.text(`all XHRs complete.<br>`);
        return await xhrCount;
    }

    async function getSelfHealthUsagePerMZ(){
        $infobox.append(`Firing ${MZLIST.length} XHRs against self-health to get usage... Please be patient.<br>`);
        let $status = $(`<span>`).appendTo($infobox);
        let xhrCount = 0;

        for (let i = 0; i < MZLIST.length; i++) {
            let mz = MZLIST[i];
            let ms = new Date().getTime() - (1000*60*60*24*30); //-30d
            let url = `${SELFHEALTHHOST}/api/v1/userSessionQueryLanguage/table?query=select%20count%28%2A%29%20from%20useraction%20where%20stringProperties.mz%20%3D%20%22${mz.name}%22%20&startTimestamp=${ms}&addDeepLinkFields=false&explain=false&Api-Token=${SELFHEALTHTOKEN}`;

            if (!mz.hasOwnProperty('count') || !mz.count) {
                const response = await fetch(url)
                const res = await response.json();
                mz.count = res.values[0];
                xhrCount++;
            }
            if (i && i % 100 === 0)
                $status.text(`${i} XHRs complete`);
        }

        $status.text(`all XHRs complete.<br>`);
        return await xhrCount;
    }

    function listOfEmptyMZs(){}
    function listDupMZs(){}
    function listFrequentRules(){}
    function listUnusedMZs(){}

    function getURL(selector){
        url = $(selector).val().toLowerCase();
        if (url.length > 1 && url.charAt(url.length - 1) == "/")
          url = url.substring(0, url.length - 1);
        if (url.length > 1 && !url.startsWith("https://"))
          url = "https://" + url;
        $(selector).val(url);
        return url;
    }

}

function MZcleanupHandler(){
    $(`#runMZcleanupReport`).click(runMZcleanupReport);
}
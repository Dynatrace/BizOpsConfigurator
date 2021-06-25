/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

async function runMZcleanupReport() {
    let HOST = getURL(`#url`);
    let TOKEN = $(`#token`).val();
    let SCOPES = [];
    let SELFHEALTHHOST = getURL(`#selfhealthurl`);
    let SELFHEALTHTOKEN = $(`#selfhealthtoken`).val();
    let MZLIST = [];
    let $infobox = $(`#MZ-infobox`);
    let $resultbox = $(`#MZ-list`);
    let $spinner = $(`#MZ-spinner`);
    let valid = await checkTokenScopes();
    let selfhealthvalid = await checkSelfHealthTokenScopes();

    if (valid) {
        await getAllTheData();
        generateReports();
    }



    ////////////////////////////////////////
    async function checkTokenScopes() {
        $infobox.removeClass('invalid');
        let required = [
            "ReadConfig",
            "entities.read"
        ];
        let url = `${HOST}/api/v1/tokens/lookup`;

        
        if (!HOST || !TOKEN) return false;
        $spinner.show();
        const response = await fetch(url, {
            method: "post",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                Authorization: `Api-Token ${TOKEN}`
            },
            body: JSON.stringify({
                "token": TOKEN
            })
        })
        const res = await response.json();
        SCOPES = res.scopes;
        let missing = required.filter(x => !SCOPES.includes(x));
        if (missing.length) {
            $infobox.text(`Missing token scopes: ${missing.join(', ')}.<br>`);
            $infobox.addClass('invalid');
            $spinner.hide();
            return false;
        }
        $spinner.hide();
        return true;
    }

    async function checkSelfHealthTokenScopes() {
        $infobox.removeClass('invalid');
        let required = [
            "DTAQLAccess"
        ];
        let url = `${SELFHEALTHHOST}/api/v1/tokens/lookup`;

        if (!SELFHEALTHHOST || !SELFHEALTHTOKEN) return false;
        $spinner.show();
        const response = await fetch(url, {
            method: "post",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                Authorization: `Api-Token ${SELFHEALTHTOKEN}`
            },
            body: JSON.stringify({
                "token": SELFHEALTHTOKEN
            })
        })
        const res = await response.json();
        SCOPES = res.scopes;
        let missing = required.filter(x => !SCOPES.includes(x));
        if (missing.length) {
            $infobox.text(`Missing token scopes: ${missing.join(', ')}.<br>`);
            $infobox.addClass('invalid');
            $spinner.hide();
            return false;
        }
        $spinner.hide();
        return true;
    }

    async function getAllTheData() {
        $spinner.show();
        await getMZlist();
        await getHostsPerMZ();
        await getRulesPerMZ();
        if (selfhealthvalid)
            await getSelfHealthUsagePerMZ();
        else
            $(`#MZ-tab-unused`).disable();
        $spinner.hide();
        $infobox.html(`Data loaded successfully.`)
    }

    function generateReports() {
        $(`#MZ-tab-empty`).click(listOfEmptyMZs);
        $(`#MZ-tab-dup`).click(listDupMZs);
        $(`#MZ-tab-rules`).click(listFrequentRules);
        if (selfhealthvalid) $(`#MZ-tab-unused`).click(listUnusedMZs);
        $(`#MZ-tab-disabled`).click(listDisabled);
        $(`#MZ-tab-JSON`).click(showJSON);
    }

    function disableRulesForAll() {

    }

    function deleteAll() {

    }

    async function getMZlist() {
        if (!MZLIST.length) {
            let url = `${HOST}/api/config/v1/managementZones?Api-Token=${TOKEN}`;
            const response = await fetch(url)
            const res = await response.json();
            MZLIST = res.values;
            $infobox.html(`Retrieved ${MZLIST.length} MZs.<br>`)
        } else {
            $infobox.html(`Already have ${MZLIST.length} MZs, keeping list.<br>`);
        }
    }

    async function getHostsPerMZ() {
        let list = MZLIST.filter(x => !x.hasOwnProperty("hosts"));
        if (list.length) {
            let skipped = MZLIST.length - list.length;
            if (skipped)
                $infobox.append(`Firing ${list.length} API calls to get a count of hosts in MZ, ${skipped} skipped... Please be patient.<br>`);
            else
                $infobox.append(`Firing ${MZLIST.length} API calls to get a count of hosts in MZ... Please be patient.<br>`);
            let $status = $(`<span>`).appendTo($infobox);
            let xhrCount = 0;

            for (let i = 0; i < list.length; i++) {
                let mz = list[i];
                let entitySelector = encodeURIComponent(`type("HOST"),mzId(${mz.id})`);
                let url = `${HOST}/api/v2/entities?pageSize=1&entitySelector=${(entitySelector)}&Api-Token=${TOKEN}`;

                if (!mz.hasOwnProperty('hosts')) {
                    const response = await fetch(url)
                    const hosts = await response.json();
                    mz.hosts = hosts.totalCount;
                    xhrCount++;
                }
                if (i && i % 100 === 0)
                    $status.html(`${i} API calls complete`);
            }

            $status.html(`all API calls complete.<br>`);
            return await xhrCount;
        } else {
            $infobox.append(`All ${MZLIST.length} MZs have a count of hosts, skipping...<br>`);
        }
    }

    async function getRulesPerMZ() {
        let list = MZLIST.filter(x => !x.hasOwnProperty("rules"));
        if (list.length) {
            let skipped = MZLIST.length - list.length;
            if (skipped)
                $infobox.append(`Firing ${list.length} API calls to get a list of rules, ${skipped} skipped... Please be patient.<br>`);
            else
                $infobox.append(`Firing ${MZLIST.length} API calls to get a list of rules... Please be patient.<br>`);
            let $status = $(`<span>`).appendTo($infobox);
            let xhrCount = 0;

            for (let i = 0; i < list.length; i++) {
                let mz = list[i];
                let entitySelector = encodeURIComponent(`type("HOST"),mzId(${mz.id})`);
                let url = `${HOST}/api/config/v1/managementZones/${mz.id}?Api-Token=${TOKEN}`;

                if (!mz.hasOwnProperty('rules') || !Array.isArray(mz.rules) || !mz.rules.length) {
                    const response = await fetch(url)
                    const res = await response.json();
                    mz.rules = res.rules;
                    xhrCount++;
                }
                if (i && i % 100 === 0)
                    $status.html(`${i} API calls complete`);
            }

            $status.html(`all API calls complete.<br>`);
            return await xhrCount;
        } else {
            $infobox.append(`All ${MZLIST.length} MZs have a list of rules, skipping...<br>`);
        }
    }

    async function getSelfHealthUsagePerMZ() {
        $infobox.append(`Firing ${MZLIST.length} API calls against self-health to get usage... Please be patient.<br>`);
        let $status = $(`<span>`).appendTo($infobox);
        let xhrCount = 0;

        for (let i = 0; i < MZLIST.length; i++) {
            let mz = MZLIST[i];
            let ms = new Date().getTime() - (1000 * 60 * 60 * 24 * 30); //-30d
            let url = `${SELFHEALTHHOST}/api/v1/userSessionQueryLanguage/table?query=select%20count%28%2A%29%20from%20useraction%20where%20stringProperties.mz%20%3D%20%22${mz.name}%22%20&startTimestamp=${ms}&addDeepLinkFields=false&explain=false&Api-Token=${SELFHEALTHTOKEN}`;

            if (!mz.hasOwnProperty('count') || !mz.count) {
                const response = await fetch(url)
                const res = await response.json();
                mz.actions = res.values[0][0];
                xhrCount++;
            }
            if (i && i % 100 === 0)
                $status.html(`${i} API calls complete`);
        }

        $status.html(`all API calls complete.<br>`);
        return await xhrCount;
    }

    function listOfEmptyMZs() {
        $(`#MZ-tabs`).children().removeClass('active');
        $(`#MZ-tab-empty`).parent().addClass('active');

        let list = MZLIST.filter(x => x.hosts === 0)
            .sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);

        $resultbox.html(`<h2>Empty MZs (${list.length}):</h2>`);
        let $ul = $(`<ul>`).appendTo($resultbox);
        list.forEach(mz => {
            $(`<li>`)
                .text(mz.name)
                .appendTo($ul);
        })
    }

    function listDupMZs() {
        $(`#MZ-tabs`).children().removeClass('active');
        $(`#MZ-tab-dup`).parent().addClass('active');

        let mznames = MZLIST.map(x => ({ name: x.name, count: 1 }))
            .reduce((a, b) => { a[b.name] = (a[b.name] || 0) + b.count; return a; }, {});
        var dups = Object.keys(mznames).filter(a => mznames[a] > 1);
        var duplicateMZs = MZLIST.filter(x => dups.includes(x.name)).sort((a, b) => a.name > b.name ? -1 : 1);

        $resultbox.html(`<h2>Duplicate MZs (${duplicateMZs.length}):</h2>`);
        let $ul = $(`<ul>`).appendTo($resultbox);
        duplicateMZs.forEach(mz => {
            $(`<li>`)
                .text(mz.name)
                .appendTo($ul);
        })
    }

    function listFrequentRules() {
        $(`#MZ-tabs`).children().removeClass('active');
        $(`#MZ-tab-rules`).parent().addClass('active');
        
        let counts = [];
        MZLIST.map(x => x.rules).flat()
            .forEach(rule => {
                let str = JSON.stringify(rule);
                counts.push({ rule: str, count: 1 })
            });

        //aggregate rules
        let countsobj = counts
            .reduce((a, b) => { a[b.rule] = (a[b.rule] || 0) + b.count; return a; }, {});
        counts = Object.keys(countsobj)
            .map(x => ({ rule: x, count: countsobj[x] }))
            .filter(x => x.count > 1)
            .sort((a, b) => b.count - a.count);

            $resultbox.html(`<h2>Frequent Rules (${counts.length}):</h2>`);
        $resultbox.append(`<pre>`
            + JSON.stringify(counts, null, 3)
            + `</pre>`);
    }

    function listUnusedMZs() {
        $(`#MZ-tabs`).children().removeClass('active');
        $(`#MZ-tab-unused`).parent().addClass('active');

        let list = MZLIST
            .filter(x => !x.actions)
            .map(x => x.name)
            .sort((a,b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);

        $resultbox.html(`<h2>Unused MZs (${list.length}):</h2>`);
        let $ul = $(`<ul>`).appendTo($resultbox);
        list.forEach(mz => {
                $(`<li>`).text(mz).appendTo($ul);
            })
    }

    function listDisabled() {
        $(`#MZ-tabs`).children().removeClass('active');
        $(`#MZ-tab-disabled`).parent().addClass('active');

        //let disabledRules = MZLIST.map(x => x.rules).flat()
        //    .filter(rule => rule.enabled == false);
        let mzWithDisabledRule = MZLIST
            .filter(x => x.rules.findIndex(rule => rule.enabled == false) > -1)
            .sort((a,b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);

        $resultbox.html(`<h2>Disabled rules (${mzWithDisabledRule.length}):</h2>`);
        let $ul = $(`<ul>`).appendTo($resultbox);
        mzWithDisabledRule.forEach(mz => {
                let $li = $(`<li>`)
                    .text(`${mz.name}:`)
                    .appendTo($ul);
                let $rules = $(`<ul>`)
                    .appendTo($li);
                mz.rules.filter(x => x.enabled == false).forEach(rule => {
                    let $rule = $(`<li>`)
                        .text(JSON.stringify(rule))
                        .addClass(`mz-rule-disabled`)
                        .appendTo($rules);
                });
            });
    }

    function showJSON() {
        $(`#MZ-tabs`).children().removeClass('active');
        $(`#MZ-tab-JSON`).parent().addClass('active');
        $resultbox.html(`<h2>Full JSON Result:</h2>`);
        $resultbox.append(`<pre>`
            + JSON.stringify(MZLIST, null, 3)
            + `</pre>`);
    }

    function getURL(selector) {
        url = $(selector).val().toLowerCase();
        if (url.length > 1 && url.charAt(url.length - 1) == "/")
            url = url.substring(0, url.length - 1);
        if (url.length > 1 && !url.startsWith("https://"))
            url = "https://" + url;
        $(selector).val(url);
        return url;
    }

}

function MZcleanupHandler() {
    $(`#runMZcleanupReport`).click(runMZcleanupReport);
}
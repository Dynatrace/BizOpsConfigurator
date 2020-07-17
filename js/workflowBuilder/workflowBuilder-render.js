/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function renderWorkflow(el) {
    let p = new $.Deferred();

    let $el = $(el);
    let clonedEl = $el.clone();

    if (typeof selection == "undefined") selection = {};
    if (typeof selection.config == "undefined") selection.config = {};

    //copy markdown values
    let fromMarkdowns = $el.find(".workflowMarkdown textarea");
    let toMarkdowns = clonedEl.find(".workflowMarkdown textarea");
    for (let i = 0; i < fromMarkdowns.length; i++) {
        let val = $(fromMarkdowns[i]).val();
        $(toMarkdowns[i]).text(val);
    }

    //copy input values
    let fromInputs = $el.find("input");
    let toInputs = clonedEl.find("input");
    for (let i = 0; i < fromInputs.length; i++) {
        let val = $(fromInputs[i]).val();
        $(toInputs[i]).attr("value", val);
    }

    //cleanup clone
    clonedEl.find(".chosen-select").chosen("destroy"); //in case we're already rendered for some reason
    clonedEl.find(".chosen-container").remove();
    clonedEl.find(".workflowInputPopup").remove();
    clonedEl.find(".workflowSectionPopup").remove();
    clonedEl.find("input[type=text]:disabled, input:not([type]):disabled").removeAttr("disabled");
    clonedEl.find("[contenteditable]").removeAttr("contenteditable");
    clonedEl.find(".transform").hide();
    let config = clonedEl.find("#workflowConfigJSON").val();
    if (config.length > 0) selection['config'] = JSON.parse(config);

    let html = sanitizer.sanitize(clonedEl.wrap("<div></div>").parent().html());
    p.resolve(html);

    return p;
}

function renderWorkflowPage(el) {
    let p = new $.Deferred();
    let promises = [];

    let $el = $(el);

    //execute API queries here, then enable
    $el.find(".apiQuery").each(function () {
        let p1 = loadApiQuery($(this));
        promises.push(p1);
    });
    $el.find(".usqlQuery").each(function () {
        let p1 = loadUsqlQuery($(this));
        promises.push(p1);
    });

    //Journey Pickers
    $el.find(".journeyPicker").each(function () {
        let $target = $(this);
        let appTransform = $target.siblings(".appTransform").val();
        let app = {
            name: '${' + appTransform + '.name}',
            id: '${' + appTransform + '.id}',
            xapp: false
        };
        if (typeof selection.swaps !== "undefined") {
            if (selection.swaps.find(x => x.from === '${' + appTransform + '.count}')) app.xapp = true;
            if (app.xapp) {
                app.names = selection.swaps
                    .filter(x => x.from.startsWith('${' + appTransform + '-') &&
                        x.from.endsWith('.name}'))
                    .map(x => x.to);
            } else {
                let swap = selection.swaps.find(x => x.from == app.name);
                app.name = swap ? swap.to : app.name;
                swap = selection.swaps.find(x => x.from == app.id);
                app.id = swap ? swap.to : app.id;
            }
        }
        let p1 = JourneyPickerFactory($target, app);
        promises.push(p1);
    });

    //render markdowns
    $el.find(".workflowMarkdown").each(function () {
        let $ta = $(this).find("textarea");
        let md = $ta.val();
        let style = $ta.attr("style");
        var converter = new showdown.Converter();
        html = converter.makeHtml(md) || "Markdown failed to render";
        $(this).html(html);
        $(this).addClass("markdownTransformed");
        $(this).attr("style", style);
    });

    //render conditional swaps
    $el.find(".conditionalSwap").each(function () {
        let $input = $(this);
        $input.find("input:not([type=hidden])").attr("type", "hidden"); //hide everything
    })

    //render config overrides
    $el.find(".configOverride").each(function () {
        let $input = $(this);
        $input.find("input:not([type=hidden])").attr("type", "hidden"); //hide everything
    })

    //render Config pushers
    $el.find(".configPusher").each(function () {
        let $input = $(this);
        let configPushType = $input.find(".configPushType").val();
        let configPushFile = $input.find(".configPushFile").val();
        let customServiceTech = $input.find(".customServiceTech").val();
        let customMetricType = $input.find(".customMetricType").val();
        $input.find("input:not([type=hidden])").attr("type", "hidden"); //hide everything
        let transform = $input.parent().siblings(".transform").find("span").text();

        let p = ConfigPusherFactory($input, transform, configPushType, configPushFile, customServiceTech, customMetricType);
        $.when(p).done(function (cp) {
            ConfigPushers.push(cp);
        });
    })

    //render static selects
    $el.find(".staticSelect").each(function () {
        let $input = $(this);
        let optionS = $input.attr("data-options");

        if (optionS.length) {
            let options = JSON.parse(optionS);

            options.forEach(function (i) {
                let $opt = $("<option>")
                    .text(i.key)
                    .val(i.val)
                    .appendTo($input);
            })

            $input.removeAttr("disabled");
        }
    });

    //render tile replicators
    $el.find(".tileReplication").each(function () {
        let $input = $(this);
        $input.find(".replicationTileName").attr("type", "hidden");
    });

    //make sure any XHRs are finished before we return the html
    $.when.apply($, promises).done(function () {
        let html = sanitizer.sanitize($el.html());
        $el.find("select.chosen-select")
            //.chosen("destroy") //in case we're already rendered for some reason
            .chosen();
        p.resolve(html);
    })

    return p;
}

function syncMarkdowns(el) {
    let $el = $(el);
    let $markdowns = $el.find(".workflowMarkdown textarea");
    for (let i = 0; i < $markdowns.length; i++) {
        let val = $($markdowns[i]).val();
        $($markdowns[i]).text(val);
    }
}

function syncInputs(el) {
    let $el = $(el);
    let $inputs = $el.find("input");
    for (let i = 0; i < $inputs.length; i++) {
        let val = $($inputs[i]).val();
        $($inputs[i]).attr("value", val);
    }
}

function workflowTest() {
    selection = {};
    let p0 = getConnectInfo();

    $.when(p0).done(function () {
        selection.swaps = [
            { from: '${url}', to: url }
        ];
        let p = renderWorkflow($("#workflow"));
        $("#workflow").attr("id", "workflowInactive");
        $.when(p).done(function (renderedHTML) {
            selection.testMode = true;
            let p1 = popupHTMLDeferred("Testing Workflow", renderedHTML);
            $(".doneBar").hide();
            workflowSetFirstPageActive();
            let activePage = $("#workflow .workflowPage.activePage");
            renderWorkflowPage(activePage);
            drawWorkflowPagerButton();
            $.when(p1).done(function () {
                delete selection.testMode;
                delete selection.swaps;
                $("#workflowInactive").attr("id", "workflow");
                updatePageListing();
            });
        });
    });
}

/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function JourneyPickerFactory(target, app, data = null) { //JourneyPicker factory, usage: var jp = JourneyPickerFactory("#viewport",{name:"www.angular.easytravel.com",id:"APPLICATION-726A108B51CB78E2"});
	let mainP = $.Deferred();

	//public data
	let $html;

	//private data
	let journeyData, selectors, chart,
		$funnel, $labelForm,
		$whereClause, $funnelClause,
		$goalList,
		$pencil, $plus, $minus, $updateLabel, $clearFunnel;
	let $target = $(target);

	var options = {
		chart: {
			curve: {
				enabled: true,
				height: 40
			},
			animate: 50,
			bottomPinch: 1
		},
		block: {
			minHeight: 15,
			fill: {
				type: 'gradient'
			},
			highlight: true
		},
		label: {
			fill: "#fff"
		},
		events: {
			click: {
				block: funnelClickHandler
			}
		}
	};

	//private methods
	function funnelClickHandler(e) {
		if ($whereClause.attr('readonly')) { //do nothing if in pencil mode
			$labelForm.find("input.labelInput").val(e.label.raw);
			$labelForm.find("input[type=hidden]").val(e.index);
			let fw = $funnel.parent();
			let lf = $labelForm;
			let rects = e.node.getClientRects();
			let x = fw.position().left + fw.width() / 2 - lf.width() / 2;
			//let y = rects[0].y + rects[0].height / 2 - lf.height() / 2;
			let y = rects[0].y; //don't know why the change, but seems to work...
			console.log([fw.position().left, fw.width() / 2, lf.width() / 2]);
			console.log([rects[0].y, rects[0].height / 2, lf.height() / 2]);
			let fill = e.fill.raw;
			$labelForm.css({ top: y, left: x, position: 'absolute', background: fill });
			$labelForm.show();
		}
	}

	function updateWhere() {
		let whereA = [];
		let FunnelStep = "";
		let funnelSteps = [];
		journeyData.forEach(function (d) {
			let clauseString = d.clauses.join(" OR ");
			whereA.push("(" + clauseString + ")");

			funnelSteps.push("(" + clauseString + ") AS \"" + d.label + "\"");
		});

		let whereS = whereA.join(" AND ");
		$whereClause.val(whereS);

		FunnelStep = funnelSteps.join(", ");
		$funnelClause.val(FunnelStep);
		$funnelClause.attr("data-journeyData", JSON.stringify(journeyData));
	}

	function funnelDrop(event, ui) {
		ui.draggable.hide();
		let mx = event.clientX;
		let my = event.clientY;
		let id = ui.draggable[0].childNodes[0].id;
		//let colname = ui.draggable[0].childNodes[0].dataset.colname;
		//let appname = ui.draggable[0].childNodes[0].dataset.appname;
		let $li = $(ui.draggable[0]);
		let $li_input = $li.children("input[type=hidden]");
		let actionData = $li_input.data("json") || {};
		let appname = actionData.appname;
		let colname = actionData.colname;
		let clause = colname + '="' + id + '"';
		if (app.xapp)
			clause = '(useraction.application="' + appname + '" and ' + clause + ')';
		//console.log("mouse drop at " + mx + "," + my);
		$funnel.find("g").each(function (i) {
			let rect = this.getClientRects();
			if (typeof (rect[0]) != "undefined") {
				let gx = rect[0].x;
				let gy = rect[0].y;
				let gw = rect[0].width;
				let gh = rect[0].height;
				if (mx > gx &&
					mx < gx + gw &&
					my > gy &&
					my < gy + gh) {
					//console.log("hit: ");
					//console.log({mx,my, gx,gy,gw,gh});
					if (journeyData[i].value.length == 0) {
						journeyData[i].value = id;
					}
					else if (journeyData[i].value.length > 0) {
						journeyData[i].value += " OR " + id;
					}
					journeyData[i].clauses.push(clause);
					if (appname) journeyData[i].appname = appname;
					if(actionData) {
						if(! ("stepData" in journeyData[i])) journeyData[i].stepData = [];
						journeyData[i].stepData.push(actionData);
					}
					chart.draw(journeyData, options);
					updateWhere(journeyData);
				}
				else {
					//console.log("miss: ");
					//console.log({mx,my, gx,gy,gw,gh});
				}
			}
		});
	}

	function loadHTML() {
		let p = $.get("html/personaFlow/journeyPicker.html");
		let newSelectors = {};

		return $.when(p).done(function (data) {
			$widget = $(data);
			$widget.each(function () {
				let $el = $(this);
				if ($el.attr("id")) {
					let id = $el.attr("id");
					newSelectors[id] = $el;
					$el.attr("id", id + uniqId());
				}
			})
			$widget.find("[id]").each(function () {
				let $el = $(this);
				let id = $el.attr("id");
				newSelectors[id] = $el;
				$el.attr("id", id + uniqId());
			})
			selectors = newSelectors;
			popuplateSelectors();
			$html = $widget;
		});
	}

	function popuplateSelectors() {
		$funnel = selectors.funnel;
		$labelForm = selectors.labelForm;
		$whereClause = selectors.whereClause;
		$goalList = selectors.goalList;
		$pencil = selectors.pencil;
		$plus = selectors.plus;
		$minus = selectors.minus;
		$updateLabel = selectors.updateLabel;
		$clearFunnel = selectors.clearFunnel;
		$funnelClause = selectors.funnelClause;
	}

	function updateLabel() {
		let i = $labelForm.find("input:hidden").val();
		let label = $labelForm.find("input.labelInput").val();
		journeyData[i].label = label;
		$labelForm.hide();
		chart.draw(journeyData, options);
		updateWhere();
	}

	function addTier() {
		if ($whereClause.attr('readonly') &&
			journeyData.length < 10) { //do nothing if in pencil mode
			journeyData.push({ label: 'name', value: '', clauses: [] });
			chart.draw(journeyData, options);
			updateWhere(journeyData);
			$minus.prop("disabled", false);
		} else {
			$plus.prop("disabled", true);
		}
	}

	function removeTier() {
		if ($whereClause.attr('readonly') &&
			journeyData.length > 2) { //do nothing if in pencil mode
			journeyData.pop();
			chart.draw(journeyData, options);
			updateWhere(journeyData);
			$plus.prop("disabled", false);
		} else {
			$minus.prop("disabled", true);
		}
	}

	function clearFunnel() {
		journeyData.forEach(function (f, i, a) {
			a[i].value = "";
			a[i].clauses = [];
		});
		updateWhere(journeyData);
		chart.draw(journeyData, options);
		populateGoalList();
	}

	function attachHandlers() {
		$updateLabel.on("click", updateLabel);
		$plus.on("click", addTier);
		$minus.on("click", removeTier);
		$clearFunnel.on("click", clearFunnel);
		$pencil.on("click", pencilToggle);
	}

	function populateMethodList() {
		let promises = [];
		let anyResults = false;
		let kuas = [];
		$goalList.find("li").remove();

		//get KUAs from metrics V2, no selector to get by App so just get everything 
		let query = "/api/v2/metrics/query?pageSize=5000&metricSelector=builtin%3Aapps.web.action.apdex%3Amerge%281%29&resolution=Inf&from=now-1d%2Fd";
		let p0 = dtAPIquery(query);
		promises.push(p0);
		$.when(p0).done(function(data) {
			kuas=data.result[0].data.map(x=>x.dimensions[0])

			if (app.xapp) {
				for (let i = 0; i < app.count; i++) {
					if(! app.ids[i].startsWith("APPLICATION-")) {
						console.log("/baseline isn't supported on Mobile etc");
						continue;
					}
					query = `/api/v1/entity/applications/${app.ids[i]}/baseline`;
					let p1 = dtAPIquery(query);
					promises.push(p1);
	
					$.when(p0,p1).done(function (d0,d1) {
						let results = sliceAPIdata("ApplicationMethods", d1[0]);
						if (results.length > 0) anyResults = true;
						drawMethods(parseMethods(results,kuas), $goalList, app.xapp);
					})
				}
				$.when.apply($, promises).then(function (d) {
					if (!anyResults) {
						let popheader = "No Key User Actions";
						let desc = "Please configure some Key User Actions";
						desc += `<a href="${url}/#uemapplications/performanceanalysis;uemapplicationId=${app.ids[0]}"`
							+ ' class="newTab" target="_blank">here <img src="images/link.svg"></a>';
						popup([], popheader, desc);
					} 
				});
			} else {
				if(! app.id.startsWith("APPLICATION-")) {
					console.log("/baseline isn't supported on Mobile etc");
				}
				query = `/api/v1/entity/applications/${app.id}/baseline`;
				let p1 = dtAPIquery(query);
				promises.push(p1);
	
				$.when(p0,p1).done(function (d0,d1) {
					let results = sliceAPIdata("ApplicationMethods", d1[0]);
	
					if (results.length > 0) {
						anyResults = true;
					} else {
						let popheader = "No Key User Actions";
						let desc = "Please configure some Key User Actions";
						desc += `<a href="${url}/#uemapplications/performanceanalysis;uemapplicationId=${app.id}"`
							+ ' class="newTab" target="_blank">here <img src="images/link.svg"></a>';
						popup([], popheader, desc);
					}
					drawMethods(parseMethods(results,kuas), $goalList, app.xapp);
				});
			}
			$.when.apply($, promises).then(function (d) {
				$goalList.find("li").draggable();
			});
		});

		
	}

	function parseMethods(results, kuas=[]) {
		var keys = [];
		var steps = [];
		var type = 'useraction.name';
		//parse keyActions
		results.forEach(function (result) {
			result.step = result.key.replace(/([^"])"([^"])?/g, "$1\"\"$2"); //escape janky doublequotes
			if(kuas.indexOf(result.value)) result.kua=true;
			else result.kua=false;
		});
		results.sort((a, b) => (a.step.toLowerCase() > b.step.toLowerCase()) ? 1 : -1);
		return results;
	}

	function drawMethods(results, goallist = "#goallist", xapp = false) {
		let list = "";
		results.forEach(function (step) {
			list += `<li class='ui-corner-all ui-widget-content tooltip'>
				<input id='${step.step}' data-json='${JSON.stringify(step)}' type='hidden'>
				<span class='steptype'>${step.kua?"kua ":""}${step.type}</span>:
				${step.step}
				${xapp ? "<span class='tooltiptext'>" + step.appname + "</span>" : ""}
				</li>`;
		});
		$(goallist).append(list);
	}



	//public methods
	function updateData(data) {
		journeyData = data;
		updateWhere();
	}

	function getSelectors() {
		return { funnel: $funnel, whereClause: $whereClause, $labelForm }
	}

	function getData() {
		return journeyData;
	}

	function pencilToggle(on) {
		if (on === true || $whereClause.attr('readonly')) {
			$whereClause.attr('readonly', false);
			$funnelClause.attr('readonly', false);
			$whereClause.addClass("pencilMode");
			$funnelClause.addClass("pencilMode");
			$goalList.find("li").draggable({ disabled: true });
			$goalList.find("li").addClass("pencilMode");
			//disable funnel
			options.block.fill.scale = d3.schemeGreys[9];
			options.label.fill = "#000";
			chart.draw(journeyData, options);
			$pencil.addClass("pencilMode");
			$plus.prop("disabled", true);
			$minus.prop("disabled", true);

		} else if (on === false || confirm("Revert where clause to funnel?")) {
			$whereClause.attr('readonly', true);
			$funnelClause.attr('readonly', true);
			$whereClause.removeClass("pencilMode");
			$funnelClause.removeClass("pencilMode");
			$goalList.find("li").draggable({ disabled: false });
			$goalList.find("li").removeClass("pencilMode");
			options.block.fill.scale = d3.schemeCategory10;
			options.label.fill = "#fff";
			chart.draw(journeyData, options);
			$pencil.removeClass("pencilMode");

			updateWhere(journeyData);
			if (journeyData.length <= 10) $plus.prop("disabled", false);
			if (journeyData.length >= 2) $minus.prop("disabled", false);

		}
	}

	function populateGoalList() {
		let mobileHack = (!app.xapp && app.id.split('-')[0] != "APPLICATION" ? true : false);
		let p1 = getGoals(app.xapp ? app.names : app.name);
		let p2 = getKeyActions(app.xapp ? app.names : app.name, mobileHack);
		$.when(p1, p2).done(function (data1, data2) {
			if (data1[0].values.length == 0 && data2[0].values.length == 0) {
				let popheader = "No Key User Actions or Conversion Goals";
				let desc = "Please configure some Key User Actions and/or Conversion Goals ";
				desc += `<a href="${url}/#uemapplications/performanceanalysis;uemapplicationId=${app.id}"`
					+ ' class="newTab" target="_blank">here <img src="images/link.svg"></a>';
				popup([], popheader, desc);
			}
			$goalList.find("li").remove();
			drawSteps(parseSteps(data2[0]), $goalList, app.xapp);
			drawSteps(parseSteps(data1[0]), $goalList, app.xapp);
			$goalList.find("li").draggable();
		});
	}


	//constructor
	let p0 = loadHTML();

	$.when(p0).done(function (data0) {
		$target.parents(".workflowSection").addClass("flex");
		$target.parent(".userInput").removeClass("userInput").addClass("journeyPicker");
		$target.replaceWith($html);

		//populateGoalList();
		populateMethodList();
		//jsonviewer([data1[0], data2[0]]);

		if (data != null) journeyData = data;
		else journeyData = [
			{ label: 'Awareness', value: '', clauses: [] },
			{ label: 'Interest', value: '', clauses: [] },
			{ label: 'Evaluation', value: '', clauses: [] },
			{ label: 'Decision', value: '', clauses: [] }
		];
		chart = new D3Funnel(`#${$funnel.attr("id")}`);
		chart.draw(journeyData, options);
		updateWhere();
		if (selection.config && "whereClause" in selection.config &&
			$whereClause.val() != selection.config.whereClause) {
			pencilToggle(true);
			$("whereClause").val(selection.config.whereClause);
		}
		$funnel.droppable({
			tolerance: "pointer",
			drop: funnelDrop
		});
		attachHandlers();

		mainP.resolve({ html: $html, updateData, getSelectors, getData, pencilToggle, populateGoalList });
	});
	return mainP;
}
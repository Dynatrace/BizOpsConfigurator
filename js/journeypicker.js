/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function JourneyPickerFactory(target, app, data = null) { //JourneyPicker factory, usage: var jp = JourneyPickerFactory("#viewport",{name:"www.angular.easytravel.com",id:"APPLICATION-726A108B51CB78E2"});
	let masterP = $.Deferred();

	//public data
	let $html;

	//private data
	let journeyData, selectors, chart,
		$funnel, $labelFrom,
		$whereClause,
		$goalList,
		$pencil, $plus, $minus;
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
			$labelForm.find("input:text").val(e.label.raw);
			$labelForm.find("input#i").val(e.index);
			let fw = $funnel.parent();
			let lf = $labelForm;
			let rects = e.node.getClientRects();
			let x = fw.position().left + fw.width() / 2 - lf.width() / 2;
			let y = rects[0].y + rects[0].height / 2 - lf.height() / 2;
			console.log([fw.position().left, fw.width() / 2, lf.width() / 2]);
			console.log([rects[0].y, rects[0].height / 2, lf.height() / 2]);
			let fill = e.fill.raw;
			$labelForm.css({ top: y, left: x, position: 'absolute', background: fill });
			$labelForm.show();
		}
	}

	function updateWhere() {
		let whereA = [];
		journeyData.forEach(function (d) {
			let clauseString = d.clauses.join(" OR ");
			whereA.push("(" + clauseString + ")");
		});
		let whereS = whereA.join(" AND ");

		$whereClause.val(whereS);
	}

	function funnelDrop(event, ui) {
		ui.draggable.hide();
		let mx = event.clientX;
		let my = event.clientY;
		let id = ui.draggable[0].childNodes[0].id;
		let colname = ui.draggable[0].childNodes[0].dataset.colname;
		let appname = ui.draggable[0].childNodes[0].dataset.appname;
		let clause = colname + '="' + id + '"';
		if ("xapp" in selection.config && selection.config.xapp)
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
			$widget.find("[id]").each(function () {
				let $el = $(this);
				let id = $el.attr("id");
				newSelectors[id] = $el;
				$el.attr("id", `id${uniqId()}`);
			})
			selectors = newSelectors;
			popuplateSelectors();
			$html = $widget;
		});
	}

	function popuplateSelectors() {
		$funnel = selectors.funnel;
		$labelFrom = selectors.labelFrom;
		$whereClause = selectors.whereClause;
		$goalList = selectors.goalList;
		$pencil = selectors.pencil;
		$plus = selectors.plus;
		$minus = selectors.minus;
	}

	//public methods
	function updateData(data) {
		journeyData = data;
		updateWhere();
	}

	function getSelectors() {
		return { funnel: $funnel, whereClause: $whereClause, $labelFrom }
	}

	function getData() {
		return journeyData;
	}

	function pencilToggle(on) {
		if (on === true || $whereClause.attr('readonly')) {
			$whereClause.attr('readonly', false);
			$whereClause.addClass("pencilMode");
			$goalList.find("li").draggable({ disabled: true });
			$goalList.find("li").addClass("pencilMode");
			//disable funnel
			//handled in funnelClickHandler
			options.block.fill.scale = d3.schemeGreys[9];
			options.label.fill = "#000";
			chart.draw(journeyData, options);
			$pencil.addClass("pencilMode");
			$plus.prop("disabled", true);
			$minus.prop("disabled", true);

		} else if (on === false || confirm("Revert where clause to funnel?")) {
			$whereClause.attr('readonly', true);
			$whereClause.removeClass("pencilMode");
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

	function updateLabel() {
		let i = $labelForm.find("input#i").val();
		let label = $labelForm.find("#labelInput").val();
		journeylData[i].label = label;
		$labelForm.hide();
		chart.draw(journeyData, options);
		updateWhere();
	}

	//constructor
	let p0 = loadHTML();
	let p1 = getGoals(app.name);
	let p2 = getKeyActions(app.name);
	$.when(p0, p1, p2).done(function (data0, data1, data2) {
		$target.html($html);
		if (data1[0].values.length == 0 && data2[0].values.length == 0) {
			let popheader = "No Key User Actions or Conversion Goals";
			let desc = "Please configure some Key User Actions and/or Conversion Goals ";
			desc += `<a href="${url}/#uemapplications/performanceanalysis;uemapplicationId=${app.id}"`
				+ ' class="newTab" target="_blank">here <img src="images/link.svg"></a>';
			popup([], popheader, desc);
		}
		drawSteps(parseSteps(data2[0]),$goalList);
		drawSteps(parseSteps(data1[0]),$goalList);
		$goalList.find("li").draggable();
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
		if ("whereClause" in selection.config &&
			$whereClause.val() != selection.config.whereClause) {
			pencilToggle(true);
			$("whereClause").val(selection.config.whereClause);
		}
		$funnel.droppable({
			tolerance: "pointer",
			drop: funnelDrop
		});

		masterP.resolve({ html:$html, updateData, getSelectors, getData, pencilToggle, updateLabel });
	});
	return masterP;
}
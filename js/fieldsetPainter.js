function fieldsetPainter() {
    let id = $(this).find("fieldset").attr("id");
    $("#bcwrapper").show();
    $("#bcwrapper").empty();
    $("div.bc").prependTo($("#bcwrapper"));
    switch(id) {
    case "config":
        $("#default_repo_owner").val(repoList[1].owner);
        $("#default_repo_repo").val(repoList[1].repo);
        $("#old_repo_owner").val(repoList[0].owner);
        $("#old_repo_repo").val(repoList[0].repo);
        $("#oldVersion").val(oldVersion);
        $("#dbTagsVersion").val(dbTagsVersion);
        $("#dbTO").val(dbTO);
        $("#dbAO").val(dbAO);
        $("#dbFunnelTrue").val(dbFunnelTrue);
        $("#dbFunnelFalse").val(dbFunnelFalse);

        for(let i=2; i<repoList.length; i++) {
            let html = `<tr><td>Repo #${i}:</td><td class='right'><input type='text' class='repo_owner' data-index='${i}' value='${repoList[i].owner}'> / <input type='text' class='repo_repo' data-index='${i}' value='${repoList[i].repo}${repoList[i].path.length > 0 ? "/" + repoList[i].path : ''}'><input type='button' class='removeRepo' data-index='${i}' value='-'></td></tr>`;
            $("#additionalRepos").after(html);
        }
        $("input.removeRepo").on("click", function() { 
            let i = $(this)[0].dataset['index'];
            repoList.splice(i,1);
            $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        });
        
        for(let i=0; i<tenantOverviews.length; i++) {
            let html = `<tr><td>TenantOverview #${i}:</td><td class='right'><input type='text' class='tenantOverview_name' data-index='${i}' value='${tenantOverviews[i].name}'>: <input type='text' class='tenantOverview_filename' data-index='${i}' value='${tenantOverviews[i].filename}'><input type='button' class='removeTenantOverview' data-index='${i}' value='-'></td></tr>`;
            $("#tenantOverviews").after(html);
        }
        $("input.removeTenantOverview").on("click", function() { 
            let i = $(this)[0].dataset['index'];
            tenantOverviews.splice(i,1);
            $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        });
        
        for(let i=0; i<appOverviews.length; i++) {
            let html = `<tr><td>AppOverview #${i}:</td><td class='right'><input type='text' class='appOverview_name' data-index='${i}' value='${appOverviews[i].name}'>: <input type='text' class='appOverview_filename' data-index='${i}' value='${appOverviews[i].filename}'><input type='button' class='removeAppOverview' data-index='${i}' value='-'></td></tr>`;
            $("#appOverviews").after(html);
        }
        $("input.removeAppOverview").on("click", function() { 
            let i = $(this)[0].dataset['index'];
            appOverviews.splice(i,1);
            $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        });
        
        for(let i=0; i<journeyOverviews.length; i++) {
            let html = `<tr><td>JourneyOverview #${i}:</td><td class='right'><input type='text' class='journeyOverview_name' data-index='${i}' value='${journeyOverviews[i].name}'>: <input type='text' class='journeyOverview_filename' data-index='${i}' value='${journeyOverviews[i].filename}'><input type='button' class='removeJourneyOverview' data-index='${i}' value='-'></td></tr>`;
            $("#journeyOverviews").after(html);
        }
        $("input.removeJourneyOverview").on("click", function() { 
            let i = $(this)[0].dataset['index'];
            journeyOverviews.splice(i,1);
            $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        });
        
        break;
	case "connect":
	   $("#url").val(url);
	   $("#token").val(token);
        $("div.bc").hide();
	   break;
	case "main":
	   $("#owner").text(owner);
	   let p_DBA = getAllDashboards();
	   $("#bc-connect").text(tenantID);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     $("#numDBADashboards").text(DBAdashboards.length);
	     jsonviewer(data);
	   });
	   break;
	case "deployApp": {
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
       $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);

	   let p0 = loadDashboard(configID("AOid" in selection?selection.AOid:selection.TOid));
	   $.when(p0).done(function(d1) {
            selection.config = parseConfigDashboard(d1);
            drawTimeInterval( ("MyTime" in selection.config)?selection.config.MyTime:"Last 2 hours" );
            appOverviews.forEach(function(ov) {
                $("#appOverview").append("<option value='"+ov.filename+"'>"+ov.name+"</option>");
            });
            if("appOverview" in selection.config) $("#appOverview").val(selection.config.appOverview);
	        let p1 = getApps(selection.config.mz);
	        let p2 = getApps();
	        $.when(p1,p2).done(function(d1,d2) {
                let appList = d1[0];
                let compareAppList = d2[0];
                jsonviewer([appList,compareAppList]);
                drawApps(appList,selection.config);
                appOverviewChangeHandler();
                drawCompareApps(compareAppList,selection.config);
                MyTimeChangeHandler();
                if("AOname" in selection.config)$("#appName").val(selection.config.AOname);
                if("MyCompareApp" in selection.config)$("#MyCompareApp").val(selection.config.MyCompareApp);
                if("rfc1918" in selection.config && selection.config.rfc1918)$("#rfc1918").prop("checked","checked");
                if("ipClause" in selection.config) $("#ipClause").val(selection.config.ipClause);
                if("ipName" in selection.config) $("#ipName").val(selection.config.ipName);
                if("comparerfc1918" in selection.config && selection.config.comparerfc1918)$("#comparerfc1918").prop("checked","checked");
                if("compareipClause" in selection.config) $("#compareipClause").val(selection.config.compareipClause);
                if("ipCompareName" in selection.config) $("#ipCompareName").val(selection.config.ipCompareName);
                if("comparerfc19182" in selection.config && selection.config.comparerfc19182)$("#comparerfc19182").prop("checked","checked");
                if("compareipClause2" in selection.config) $("#compareipClause2").val(selection.config.compareipClause2);
                if("ipCompareName2" in selection.config) $("#ipCompareName2").val(selection.config.ipCompareName2);
                appOverviewChangeHandler();
	        });
	   });
        $("#applist").on("change",function(){ //autofill with app name
            if($("#appName").val()=="")
                $("#appName").val($("#appList option:selected").text());
        });
        $("#compareAppList").on("change",function(){ //autofil with compare app name
            if($("#MyCompareApp").val()=="")
                $("#MyCompareApp").val($("#compareAppList option:selected").text());
        });

	   break;
	}
	case "deployFunnel-name": {
	   let p1 = (!selection.funnelLoaded ? loadDashboard(configID(selection.AOid)) : null);
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);

	   $.when(p1).done(function(data) {
	     jsonviewer(data);
	     if(!selection.funnelLoaded)
	       selection.config = parseConfigDashboard(data);
	     $("#appName").text(selection.config.appName);
	     $("#appID").text(selection.config.appID);
         journeyOverviews.forEach(function(ov) {
                $("#journeyOverview").append("<option value='"+ov.filename+"'>"+ov.name+"</option>");
         });
          if("journeyOverview" in selection.config) $("#journeyOverview").val(selection.config.journeyOverview);
         if("xapp" in selection.config)$("#xapp").prop('checked',selection.config.xapp);
         let p2 = xappChangeHandler();
         $.when(p2).done(function() {
            if("xapps" in selection.config)$("#xapp_apps").val(selection.config.xapps);
         });

	     if('funnelName' in selection.config) $("#funnelName").val(selection.config.funnelName);
	   });
	   break;
	}
	case "deployFunnel-kpi": {
	   let p1 = getKPIs(selection.config.xapp?selection.config.xapps:selection.config.appName);
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);

	   $.when(p1).done(function(data) {
		jsonviewer(data);
		let kpis = parseKPIs(data);
		drawKPIs(kpis);

	     if('kpi' in selection.config) $("#usplist").val(selection.config.kpi);
	     if('kpiName' in selection.config) $("#kpiName").val(selection.config.kpiName);
	     uspListChangeHandler();
	   });
	   break;
	}
    case "deployFunnel-filters": {
        let p1 = getUSPs(selection.config.xapp?selection.config.xapps:selection.config.appName);
        let p2 = getRegions(selection.config.xapp?selection.config.xapps:selection.config.appName);
        
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);
        $("#TOid").text(selection.TOid);
        $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
        $("#AOid").text(selection.AOid);
        $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
        $("#appName").text(selection.config.appName);
        $("#appID").text(selection.config.appID);
        $("#kpi").text(selection.config.kpiName);
        
        $.when(p1,p2).done(function(d1,d2) {
            let usps = d1[0];
            let regions = d2[0];
            jsonviewer([usps,regions]);
            parseUSPFilter(usps);
            parseRegions(regions);
            regionsChangeHandler();
            uspFilterChangeHandler();
            if("filterClause" in selection.config)
                $("#filterClause").val(selection.config.filterClause);
        });
        break;
    }
	case "deployFunnel-compare": {
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);
       drawTimeInterval( ("MyTime" in selection.config)?selection.config.MyTime:"Last 2 hours" );

        if("xapp" in selection.config && selection.config.xapp) {
            $("#xapp_compare").show();
            $("#compareApp").hide();
        }

	   let p1 = getApps();
	   $.when(p1).done(function(data) {
	     jsonviewer(data);
	     drawCompareApps(data,selection.config);

	     if('compareFunnel' in selection.config) $("#compareFunnel").val(selection.config.compareFunnel);
         if('compareAppID' in selection.config) $("#compareAppList").val(selection.config.compareAppID);
         if('campaignActive' in selection.config) $("#campaignActive").prop('checked',selection.config.campaignActive);
         if('featureAdded' in selection.config) $("#featureAdded").prop('checked',selection.config.featureAdded);

         if('xapp' in selection.config && selection.config.xapp) {
            if('xapp_compareAppID1' in selection.config) $("#compareAppList1").val(selection.config.xapp_compareAppID1);
            if('xapp_compareAppID2' in selection.config) $("#compareAppList2").val(selection.config.xapp_compareAppID2);
         }

	     let p2 = compareAppChangeHandler(); 
	     $.when(p2).done(function() {
               if('compareFirstStep' in selection.config) $("#compareFirstStep").val(selection.config.compareFirstStep.name);
               if('compareLastStep' in selection.config) $("#compareLastStep").val(selection.config.compareLastStep.name);
               if('compareRevenue' in selection.config) $("#compareRevenue").val(selection.config.compareRevenue);
	     });
         let p3 = campaignChangeHandler();
         $.when(p3).done(function() {
               if('campaignStep1' in selection.config) $("#campaignStep1").val(selection.config.campaignStep1.name);
               if('promHeaderStep' in selection.config) $("#promHeaderStep").val(selection.config.promHeaderStep);
         });
         let p4 = featureChangeHandler();
         $.when(p4).done(function() {
               if('StepNewFeature1' in selection.config) $("#StepNewFeature1").val(selection.config.StepNewFeature1.name);
               if('FeatureHeaderStep' in selection.config) $("#FeatureHeaderStep").val(selection.config.FeatureHeaderStep);
         });
	   });
	   break;
	}
	case "deployFunnel-funnel": {
       let mobileHack = (selection.config.appID.split('-')[0]=="APPLICATION"?false:true);
	   let p1 = getGoals(selection.config.xapp?selection.config.xapps:selection.config.appName);
	   let p2 = getKeyActions(selection.config.xapp?selection.config.xapps:selection.config.appName,mobileHack);
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);

	   //paint info we already have
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);
	   $("#goallist").html("");

	   //load the funnel and whereClause
           if("funnelData" in selection.config) funnelData=selection.config.funnelData;
	   else funnelData = [
	        { label: 'Awareness', value: '', clauses: [] },
	        { label: 'Interest', value: '', clauses: [] },
	        { label: 'Evaluation', value: '', clauses: [] },
	        { label: 'Decision', value: '', clauses: [] }
	    ];
	    chart.draw(funnelData, options);
	    updateWhere(funnelData);
	    if("whereClause" in selection.config &&
	       $("#whereClause").val() != selection.config.whereClause) {
		pencilToggle(true);
		$("whereClause").val(selection.config.whereClause);
	    }

	   //once XHRs are finished, do some stuff
	   $.when(p1,p2).done(function(data1,data2) {
		drawSteps(parseSteps(data2[0]));
		drawSteps(parseSteps(data1[0]));
	        $( "#goallist li" ).draggable();
		jsonviewer([data1[0],data2[0]]);
	   });
	   break;
	}
	case "deployFunnel-finish":
	   $("#bc-connect").text(tenantID);
	   $("#bc-deployFunnel-name").text(selection.config.funnelName);

	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);
	   $("#appName").text(selection.config.appName);
	   $("#appID").text(selection.config.appID);
	   $("#kpi").text(selection.config.kpiName);
	   $("#finalWhereClause").text(selection.config.whereClause);

	   $("#deployFunnel-finish").append("Uploaded: <a target='_blank' href='"+url+"/#dashboard;id="+selection.config.FOid+"' class='newTab'>"+
	      selection.config.dashboardName+" <img src='images/link.svg'></a>");
	   break;
	case "deployTenant":
	   $("#bc-connect").text(tenantID);
	   drawMZs();

        tenantOverviews.forEach(function(ov) {
            $("#tenantOverview").append("<option value='"+ov.filename+"'>"+ov.name+"</option>");
        });
        if("tenantOverview" in selection.config){
            $("#tenantOverview").val(selection.config.tenantOverview);
            tenantOverviewChangeHandler();
        } 
	   break;
	case "listApp": {
	   let p_DBA = getAllDashboards();
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawAppOverviewList(selection.TOid);
	     jsonviewer(DBAdashboards); //do NOT display raw dashboard list
         if(version < 183) $("#updateAppForecast").hide();
         else $("#updateAppForecast").show();
	   });
	   break;
	}
	case "listFunnel": {
	   let p_DBA = getAllDashboards();
	   $("#bc-connect").text(tenantID);
	   $("#TOid").text(selection.TOid);
	   $("#AOid").text(selection.AOid);
	   $("#TOname").text(DBAdashboards.find(x => x.id === selection.TOid).name);
	   $("#AOid").text(selection.AOid);
	   $("#AOname").text(DBAdashboards.find(x => x.id === selection.AOid).name);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawFunnelList(selection.AOid);
	     jsonviewer(DBAdashboards); //do NOT display raw dashboard list
         if(version < 183) $("#updateFunnelForecast").hide();
         else $("#updateFunnelForecast").show();
	   });
	   break;
	}
	case "listTenant": {
	   let p_DBA = getAllDashboards();
	   $("#bc-connect").text(tenantID);

	   $.when(p_DBA).done(function(data) {
	     processDBADashboards(data);
	     drawTenantOverviewList();
	     jsonviewer(DBAdashboards); //do NOT display raw dashboard list
	   });
	   break;
	}
    case "dashboardList": {
      let html = "";
      let list = [].concat(tenantOverviews, appOverviews, journeyOverviews);
      let topLevelIDs = [];
      let usedIndexes = [];
      //get list of topLevelIDs
      list.forEach(function(overview) {
        let i = dbList.findIndex( ({ name }) => name === overview.filename );
        if(i > -1) topLevelIDs.push(dbList[i].file.id);
      });
      //traverse the list building sub dashboard list
      list.forEach(function(overview) {
        let i = dbList.findIndex( ({ name }) => name === overview.filename );
        usedIndexes.push(i);
        if(i < 0) {
            html += "<li>"+overview.name+" ("+overview.filename+")</li>";
        } else {
            html += "<li>"+overview.name+" - (<a class='dashboardList' href='#json' data-index='"+i+"'>"+overview.filename+"</a>):<br><ul>"
            let subs = getStaticSubDBs(dbList[i].file,topLevelIDs);
            subs.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
            subs.forEach(function(s) {
                let j = dbList.findIndex( ({ name }) => name === s.name );
                usedIndexes.push(j);
                html += "<li><a class='dashboardList' href='#json' data-index='"+j+"'>"+s.name+"</a></li>"
            });
            html += "</ul></li>";
        }
      });
      //find a list of orphans
      let orphanIndexes = [];
      for(let i of dbList.keys()) {
        if(!usedIndexes.includes(i)) orphanIndexes.push(i);
      }
      if(orphanIndexes.length > 0) {
        html += "<li>Orphan Dashboards::<br><ul>";
        orphanIndexes.forEach(function(i) {
                html += "<li><a class='dashboardList' href='#json' data-index='"+i+"'>"+dbList[i].name+"</a></li>"
        });
        html += "</ul></li>";
      }
      $("#dashboardList ul").html(html);
      $("#dashboardList ul").on("click", "a", function() { 
        let i = $(this)[0].dataset['index'];
        jsonviewer(dbList[i].file,true,dbList[i].name,"#popupjsonviewer"); 
      });
      break;
    }
    case "dashboardCleanup": {
        $("#bc-connect").text(tenantID);
        let p1 = getAllDashboards();

        $.when(p1).done(function(data) {
            let allDBs = data["dashboards"];
            
            //get owners and number of dashboards
            let owners = new Map();
            for(const x of allDBs) {
                if(!owners.has(x.owner)){
                    let data = {count:1,
                        dbids:[x.id]}
                    owners.set(x.owner, data);
                }
                else {
                    let data = owners.get(x.owner);
                    data.count++;
                    data.dbids.push(x.id);
                    owners.set(x.owner, data);
                }
            } 

            //sort
            owners = new Map(Array
                .from(owners)
                .sort((a,b) => b[1].count - a[1].count));
            allDBs.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
            

            //sum 
            let total = [...owners].reduce((acc,val) => acc + val[1].count, 0);

            //print out the list of owners and counts
            let html = "";
            for(let [owner,data] of owners) {
                html += `<li><input type="checkbox" data-owner="${owner}" data-dbids='${JSON.stringify(data.dbids)}'>
                    <a href="#dashboardCleanup-owner" class="dashboardCleanup-owner" data-owner="${owner}">${owner==""?"<no owner>":owner}: ${data.count}</a></li>`;
            }
            $("#ownerlist ul").html(html);
            $("#total").text(total);
            $("#owners").text(owners.size);

            //listener
            $("#ownerlist ul").on("click", "a", function() { 
                let owner = $(this)[0].dataset['owner'];
                $("#dashboardlist h3").text(owner);
                let dbhtml = ``;
                for(let i=0; i < allDBs.length; i++) {
                    if(allDBs[i].owner == owner){
                        dbhtml += `<li><input type="checkbox" data-dbid="${allDBs[i].id}">
                        <a href="#dashboardCleanup-db" class="dashboardCleanup-db" data-owner="${owner}" data-index="${i}">${allDBs[i].name}</a></li>`
                    }
                }
                $("#dashboardlist ul").html(dbhtml);
            });

            //listener
            $("#dashboardlist ul").on("click", "a", function() { 
                let index = $(this)[0].dataset['index'];
                let p1 = loadDashboard(allDBs[index].id);

                $.when(p1).done(function(data){
                    jsonviewer(data,true,allDBs[index].name,"#cleanupjsonviewer");
                });
            });
            
        });
        break;
    }
	/*case "upgradeTenant":
	   break;*/
	default:
	   alert("Unknown Fieldset: " + id);
   }
}
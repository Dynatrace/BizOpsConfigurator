function generateFunnelForecast(config) {
    var master = $.Deferred();
    var revs = [];
    var date = new Date();
    var revenue = config.kpi;
    var firststep = config.whereClause.match(/^\(?(\([^()]+\))/)[1];
    var laststep = config.whereClause.match(/(\([^()]+\))\)?$/)[1];
    var appname = config.appName;
    var deferreds = [];
    var deferred = {};
    var dateTemp = new Date();
    var startdate = "";
    var enddate = "";
    var filterClause = ("filterClause" in config)?config.filterClause:"";
    const week = 1000*60*60*24*7;
 
    for(let i=1; i<=5; i++) {
        let queries=[];
        dateTemp.setTime(date.getTime() - i*week);
        startdate = dateTemp.getTime();

        dateTemp.setTime(date.getTime() - (i-1)*week)
        enddate = dateTemp.getTime();

        if(revenue!="n/a"){
            //Revenue
            queries.push('select sum('+revenue+') as "rev'+i+'", avg('+revenue+') as "acv'+i+'" from usersession where useraction.application="'+appname+'" and '+laststep+filterClause+' and startTime between '+startdate+' and '+enddate);

            //Risk Revenue
            queries.push('select sum('+revenue+') as "riskrev'+i+'", avg('+revenue+') as "arcv'+i+'" from usersession where useraction.application="'+appname+'" and userExperienceScore!="SATISFIED" and '+laststep+filterClause+' and startTime between '+startdate+' and '+enddate);

            //Lost Revenue
            queries.push('select sum('+revenue+') as "lostrev'+i+'", avg('+revenue+') as "alcv'+i+'" from usersession where useraction.application="'+appname+'" and not '+laststep+filterClause+' and startTime between '+startdate+' and '+enddate);
        }
        
        //Funnel Forecasting
        //Conversions
        queries.push('select count(usersessionid) as "funconv'+i+'" from usersession where useraction.application="'+appname+'" and '+laststep+filterClause+' and startTime between '+startdate+' and '+enddate);
        //Abandons
        queries.push('select count(usersessionid) as "funaban'+i+'" from usersession where useraction.application="'+appname+'" and not '+laststep+filterClause+' and startTime between '+startdate+' and '+enddate);
        //Funnel Visits
        queries.push('select count(usersessionid) as "funvisit'+i+'" from usersession where useraction.application="'+appname+'" and '+firststep+filterClause+' and startTime between '+startdate+' and '+enddate);
        //Number of Satisfied Users
        queries.push('select count(usersessionid) as "fnosu'+i+'" from usersession where useraction.application="'+appname+'" and userExperienceScore="SATISFIED" and '+firststep+filterClause+' and startTime between '+startdate+' and '+enddate);
        //Session Duration
        queries.push('select avg(duration) as "fundur'+i+'" from usersession where useraction.application="'+appname+'" and '+firststep+filterClause+' and startTime between '+startdate+' and '+enddate);

        queries.forEach(function(usql) {
            var query="/api/v1/userSessionQueryLanguage/table?query="+encodeURIComponent(usql)+"&startTimestamp=1000000000000&explain=false";
            deferred = dtAPIquery(query,{})
                $.when(deferred).done(function(d) {
                    d.columnNames.forEach(function(c,i,a) {
                        revs.push({from:c, to:d.values[0][i]});
                    });
                });
            deferreds.push(deferred);
        });
    }
    $.when.apply($, deferreds).then(function(d) {
       revs.sort((a, b) => (a.from.length < b.from.length) ? 1 : -1); 
       console.log(revs); 
       master.resolve(revs);
    });
    return master;
}

function updateFunnelForecast(config,ov,revs) {
    let swaps = generateFunnelSwapList(config);
    swaps=swaps.concat(revs);
    swaps.push({from:'tfactor', to:config.tfactor});
    swaps.push({from:'tdate', to:new Date().toDateString()});
    let deferreds = [];
    let subs = [];
    let re = new RegExp(ov.substring(0,24));

    dbList.forEach(function(d) { 
        if(d.name.includes("Forecast")) {
            if(d.name.includes("Revenue") && !("kpi" in config) || (config.kpi=='n/a')) return;

            config.subids.forEach(function(i) {
                if(d.file.id == i.from) {
                    subs.push(JSON.parse(JSON.stringify(d)));
                    swaps.push(i);
                }
            });
        }
    });

    subs.forEach(function(s,i,arr) {
        s.file["dashboardMetadata"]["owner"]=owner;
        s.file["dashboardMetadata"]["shared"]="true";
        s.file["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
        s.file["dashboardMetadata"]["sharingDetails"]["published"]="false";
        if("costControlUserSessionPercentage" in config) addCostControlTile(s.file,config);
        addReplaceButton(s.file,config.FOid,"![BackButton]()","⇦",findTopRight);
        let swapped = doSwaps(JSON.stringify(s.file), swaps);
        arr[i].file = JSON.parse(swapped);
    });
    return uploadSubs(subs);
}

function updateAppForecast(config,ov,revs) {
    let swaps = generateAppSwapList(config);
    swaps=swaps.concat(revs);
    swaps.push({from:'tfactor', to:config.tfactor});
    swaps.push({from:'tdate', to:new Date().toDateString()});
    let deferreds = [];
    let subs = [];
    let re = new RegExp(ov.substring(0,24));

    dbList.forEach(function(d) { 
        if(d.name.includes("Forecast")) {
            config.subids.forEach(function(i) {
                if(d.file.id == i.from) {
                    subs.push(JSON.parse(JSON.stringify(d)));
                    swaps.push(i);
                }
            });
        }
    });

    subs.forEach(function(s,i,arr) {
        s.file["dashboardMetadata"]["owner"]=owner;
        s.file["dashboardMetadata"]["shared"]="true";
        s.file["dashboardMetadata"]["sharingDetails"]["linkShared"]="true";
        s.file["dashboardMetadata"]["sharingDetails"]["published"]="false";
        if("costControlUserSessionPercentage" in config) addCostControlTile(s.file,config);
        addReplaceButton(s.file,config.AOid,"![BackButton]()","⇦",findTopRight);
        let swapped = doSwaps(JSON.stringify(s.file), swaps);
        arr[i].file = JSON.parse(swapped);
    });
    return uploadSubs(subs);
}

function generateAppForecast(config) {
    var master = $.Deferred();
    var revs = [];
    var date = new Date();
    var appname = config.appName;
    var deferreds = [];
    var deferred = {};
    var dateTemp = new Date();
    var startdate = "";
    var enddate = "";
    const week = 1000*60*60*24*7;
 
    for(let i=1; i<=5; i++) {
        let queries=[];
        dateTemp.setTime(date.getTime() - i*week);
        startdate = dateTemp.getTime();
//console.log("startdate: "+dateTemp.toDateString());
        dateTemp.setTime(date.getTime() - (i-1)*week)
        enddate = dateTemp.getTime();
//console.log("endDate: " + dateTemp.toDateString());
        // Application Forecasting
        // Number of Satisfied Users
        queries.push('select count(usersessionid) as "anosu'+i+'" from usersession where useraction.application="'+appname+'" and userExperienceScore="SATISFIED" and startTime between '+startdate+' and '+enddate);
        // Number of Tolerated Users
        queries.push('select count(usersessionid) as "anotu'+i+'" from usersession where useraction.application="'+appname+'" and userExperienceScore="TOLERATED" and startTime between '+startdate+' and '+enddate);
        // Number of Frustrated Users
        queries.push('select count(usersessionid) as "anofu'+i+'" from usersession where useraction.application="'+appname+'" and userExperienceScore="FRUSTRATED" and startTime between '+startdate+' and '+enddate);
        // Action Duration
        queries.push('select avg(useraction.duration) as "appdur'+i+'", count(useraction.errorCount) as "apperr'+i+'" from usersession where useraction.application="'+appname+'" and startTime between '+startdate+' and '+enddate);
        // Action Errors
        //queries.push('select count(useraction.errorCount) as "apperr'+i+'" from usersession where useraction.application="'+appname+'" and startTime between '+startdate+' and '+enddate);

        queries.forEach(function(usql) {
//console.log(usql);
            var query="/api/v1/userSessionQueryLanguage/table?query="+encodeURIComponent(usql)+"&startTimestamp=1000000000000&explain=false";
            deferred = dtAPIquery(query,{})
                $.when(deferred).done(function(d) {
                    d.columnNames.forEach(function(c,i,a) {
                        revs.push({from:c, to:d.values[0][i]});
                    });
                });
            deferreds.push(deferred);
        });
    }
    $.when.apply($, deferreds).then(function(d) {
       revs.sort((a, b) => (a.from.length < b.from.length) ? 1 : -1); 
       console.log(revs); 
       master.resolve(revs);
    });
    return master;
}

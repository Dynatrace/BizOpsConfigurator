
function dbFindBottom(db) {
  let bottom = 0;

  db.tiles.forEach(function(tile) {
    bottom = Math.max(bottom, tile.bounds.top + tile.bounds.height);
  });

  return(bottom);
}

function findBottomRight(db,bounds) {
    let rightedge=0;
    let bottomedge=0;

    db.tiles.forEach(function(t) {
        rightedge=Math.max(rightedge,
            t.bounds.left + t.bounds.width);
        bottomedge=Math.max(bottomedge,
            t.bounds.top + t.bounds.height);
    });

    bounds.top = bottomedge; //leave a little space
    bounds.left = rightedge - bounds.width;

    return bounds;
}

function findTopRight(db,bounds) {
    let rightedge=0;

    db.tiles.forEach(function(t) {
        rightedge=Math.max(rightedge,
            t.bounds.left + t.bounds.width);
    });

    bounds.top = 0;
    bounds.left = rightedge; //leave a little space

    return bounds;
}

function listFunnelDB(config,subs) {
  let list = [];
  let re1= /[fF]unnel([0-9]{1,2})/;
  let re2= /[fF]unnelAnalysisStep(Action)?([0-9]{1,2})/;
  let steps = config.funnelData.length;

  subs.forEach(function(file) {
    let db = file.path;
  //skip unneeded dbs
    if(config.kpi=="n/a" && (db.includes("True") || db.includes("Revenue")))
	    return;
    if(config.kpi!="n/a" && db.includes("False"))
	    return;
    if(db in [dbTO,dbAO,dbFunnelTrue,dbFunnelFalse])
        return;

  //figure out if the funnel db is needed
    let res1 = re1.exec(db);
    let res2 = re2.exec(db);
    if(res1 !==null && parseInt(res1[1]) != steps)
    {
	    return;
    }
    if(res2 !==null && parseInt(res2[2]) > steps)
    {
	    return;
    }

  //if we're still going, it should be good, add it to the list
    list.push(file);
  });
  return list;
}

function getStaticSubDBs(db,parentids=[""],subs=[]) {
    console.log("getStaticSubDBs from: "+db.id+" (oldid:"+parentids+")");
    db.tiles.forEach(function(t) {
        if(t.tileType=="MARKDOWN") {
            let matches = t.markdown.matchAll(/\(#dashboard(\/dashboard)?;id=([^) ]+)/g);
            for( let m of matches) { 
                let id = m[2];
                if(id != db.id && !parentids.includes(id)) for( let d of dbList) { //skip self and parent links
                    if(d.file.id === id &&
                       typeof(subs.find( x => x.name === d.name)) == "undefined" ) { //ensure it's not already in the array, note: ids are not unique
                        console.log("getStaticSubDBs: "+id+" => "+d.file.dashboardMetadata.name);
                        subs.push( JSON.parse(JSON.stringify(d))); 
                        getStaticSubDBs(d.file,parentids,subs);
                    }
                }
            }
        }
    });
    return subs;
}

function validateDB(input) {
  let db = {};
  if(typeof input == "string")
    db = JSON.parse(input);
  else if(typeof input == "object")
    db = input;
  let e = "";
  var t = {};

  //trunc any MARKDOWNs that are too long
  db.tiles.forEach(function(t,index,arr) {
    if(t.tileType=='MARKDOWN' && t.markdown.length > 1000) {
        t.markdown = t.markdown.substring(0,1000);
        e += ` Trunc MARKDOWN tile[${index}]\n`;
    }
  });

  //validate DT is new enough to support tags
  if("tags" in db.dashboardMetadata && version < dbTagsVersion){
    delete db.dashboardMetadata.tags;
    e += " Tenant too old, removing tags\n";
  }
    

  //check that bounds are divisible by 38 and < 5016
  for(let i = db.tiles.length - 1; i >= 0; i--){
    t = db.tiles[i];
    
    if(t.bounds.left % 38 != 0){
      e += ` tile[${i}] left bound not divisible by 38\n`;
    } 
    if(t.bounds.top % 38 != 0){
      e += ` tile[${i}] top bound not divisible by 38\n`;
    } 
    if(t.bounds.width % 38 != 0){
      e += ` tile[${i}] width bound not divisible by 38\n`;
    } 
    if(t.bounds.height % 38 != 0){
      e += ` tile[${i}] height bound not divisible by 38\n`;
    }

    if(t.bounds.left + t.bounds.width > 5016){
        arr.splice(i,1); //remove tile out of bounds
        e += ` tile[${i}] horizontal out of bounds (5016)\n`;
    }
    if(t.bounds.top + t.bounds.height > 5016){
        arr.splice(i,1); //remove tile out of bounds
        e += ` tile[${i}] vertical out of bounds (5016)\n`;
    }
  }

  //remove any CTS_PLUGIN_ruxit, which are deprecated
  for(let i = db.tiles.length - 1; i >= 0; i--){
    t = db.tiles[i];
    if(t.tileType=="CUSTOM_CHARTING"){
      t.filterConfig.chartConfig.series.forEach(function(s){
        if(s.metric.startsWith("CTS")){
          db.tiles.splice(i,1);
          e += ` Deprecated CTS metric detected tile[${i}]\n`;
        }
        if(s.metric=="builtin:synthetic.browser.duration"){
          db.tiles.splice(i,1);
          e += ` Deprecated synthetic metric detected tile[${i}]\n`;
        }
      });
    }
  }

  //temporarily remove visualizationConfig due to bugs in 189/190
  db.tiles.forEach(function(t,index,arr) {
    if("visualizationConfig" in t){
      delete t.visualizationConfig;
      e += ` Removed visualizationConfig tile[${index}]\n`;
    }
  });

  //check for untransformed dashboard
  var re = /^bbbbbbbb-/;
  if(!re.test(db.id)) e += ` Untransformed dashboard\n`;


  //alert and return the DB
  if(e.length>0){
    e = `validateDB: (${db.dashboardMetadata.name})\n${e}`;
    console.log(e);
    if(typeof dtrum !== "undefined") dtrum.reportCustomError("Dashboard Validation",e,db.dashboardMetadata.name,true);
  }
  if(typeof input == "string")
    return(JSON.stringify(db));
  else if(typeof input == "object")
    return(db);
}

function addCostControlTile(db,config) {
    if(config.costControlUserSessionPercentage<100) {
        let bounds = {
            "height": 38,
            "width": 152
        }
        bounds = findBottomRight(db,bounds);
        let tile = {
            "name": "Markdown",
            "tileType": "MARKDOWN",
            "configured": true,
            "bounds": bounds,
            "tileFilter": {
                "timeframe": null,
                "managementZone": null
            },
            "markdown": "Sampling rate: [" +
                config.costControlUserSessionPercentage + "%]" +
                "(#applicationconfiguration;uemapplicationId=" + config.appID +
                ")"
        };
        db.tiles.push(tile);
    }
}

function buildConfigDashboard(dashboard,id,config) {
  //transform
  dashboard["id"]=id;
    //break each 999 characters into a markdown tile 
  let markdownTemplate = JSON.stringify(dashboard["tiles"][0]);
  dashboard["tiles"].pop();
  let configS = JSON.stringify(config);
  let tiles = Math.ceil(configS.length / 999);
  for(i=0; i <= tiles; i++) {
    let markdown = JSON.parse(markdownTemplate);
    markdown["markdown"]=configS.substring(i*999,(i+1)*999);
    //put tiles horizontally 3px apart
    markdown["bounds"]["left"] = i * markdown["bounds"]["width"]; //must snap to grid in 188
    dashboard["tiles"].push(markdown);
  }

  return dashboard;
}

function columnList(db,index,list){
  if(index<0)return;

  let bounds = db.tiles[index].bounds;
  let tileJSON = JSON.stringify(db.tiles[index]);

  db.tiles.splice(index,1);
  list.forEach(function(i){
    let t = JSON.parse(tileJSON);
    t.name = i.displayName;
    t.assignedEntities[0] = i.entityId;
    t.bounds = JSON.parse(JSON.stringify(bounds));
    db.tiles.push(t);

    bounds.top = bounds.top + bounds.height;
  });
}

function twoColumnList(db,leftIndex,rightIndex,list){
  columnList(db,leftIndex,list.filter((a,i) => i%2===0));
  columnList(db,rightIndex,list.filter((a,i) => i%2===1));
}

function findTileByName(db,findName){
  return db.tiles.map(e => e.name).indexOf(findName);
}

function SAPappList(db,apps){
  let leftIndex = findTileByName(db,"SAP App Left");
  let rightIndex = findTileByName(db,"SAP APP Right");

  twoColumnList(db,leftIndex,rightIndex,apps);
}
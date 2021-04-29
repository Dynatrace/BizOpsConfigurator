/*Copyright 2019 Dynatrace LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

function dbFindBottom(db) {
  let bottom = 0;

  db.tiles.forEach(function (tile) {
    bottom = Math.max(bottom, tile.bounds.top + tile.bounds.height);
  });

  return (bottom);
}

function findBottomRight(db, bounds) {
  let rightedge = 0;
  let bottomedge = 0;

  db.tiles.forEach(function (t) {
    rightedge = Math.max(rightedge,
      t.bounds.left + t.bounds.width);
    bottomedge = Math.max(bottomedge,
      t.bounds.top + t.bounds.height);
  });

  bounds.top = bottomedge; //leave a little space
  bounds.left = rightedge - bounds.width;

  return bounds;
}

function findTopRight(db, bounds) {
  let rightedge = 0;

  db.tiles.forEach(function (t) {
    rightedge = Math.max(rightedge,
      t.bounds.left + t.bounds.width);
  });

  bounds.top = 0;
  bounds.left = rightedge;
  return bounds;
}

function listFunnelDB(config, subs) {
  let list = [];
  let re1 = /[fF]unnel([0-9]{1,2})/;
  let re2 = /[fF]unnelAnalysisStep(Action)?([0-9]{1,2})/;
  let steps = config.funnelData.length;

  subs.forEach(function (file) {
    let db = file.path;
    //skip unneeded dbs
    if ((typeof config.kpi == "undefined" || config.kpi == "n/a") && (db.includes("True") || db.includes("Revenue")))
      return;
    if ((typeof config.kpi != "undefined" && config.kpi != "n/a") && db.includes("False"))
      return;
    if (db in [dbTO, dbAO, dbFunnelTrue, dbFunnelFalse])
      return;

    //figure out if the funnel db is needed
    let res1 = re1.exec(db);
    let res2 = re2.exec(db);
    if (res1 !== null && parseInt(res1[1]) != steps) {
      return;
    }
    if (res2 !== null && parseInt(res2[2]) > steps) {
      return;
    }

    //if we're still going, it should be good, add it to the list
    list.push(file);
  });
  return list;
}

function getStaticSubDBs(db, parentids = [""], subs = []) {
  console.log("getStaticSubDBs from: " + db.id + " (oldid:" + parentids + ")");
  db.tiles.forEach(function (t) {
    if (t.tileType == "MARKDOWN") {
      let matches = t.markdown.matchAll(/\(#dashboard(\/dashboard)?;(gt?f=[^;]+;)*id=([^) ;]+)/g);
      for (let m of matches) {
        let id = m[3];
        inner(id);
      }
      matches = t.markdown.matchAll(/!PU[^!\n]+url=[^ ]+id=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g);
      for (let m of matches) {
        let id = m[1];
        inner(id);
      }
    }
  });
  return subs;

  function inner(id) {
    if (id != db.id && !parentids.includes(id)) {
      let found = false;
      for (let d of dbList) { //skip self and parent links
        if ("file" in d && d.file.id === id) {
          found = true;
          if (typeof (subs.find(x => x.name === d.name)) == "undefined") { //ensure it's not already in the array, note: ids are not unique
            console.log("getStaticSubDBs: " + id + " => " + d.file.dashboardMetadata.name);
            if ("contents" in d.repo) delete d.repo.contents; //prevent circular structure
            subs.push(JSON.parse(JSON.stringify(d)));
            getStaticSubDBs(d.file, parentids, subs);
          }
        }
      }
      if (!found) {
        console.warn("getStaticSubDBs: " + id + " was NOT found in dbList. Please check your links.");
        if (typeof dtrum !== "undefined") dtrum.reportCustomError("getStaticSubDBs broken link.", id, db.dashboardMetadata.name, true);
      }
    }
  }
}

function validateDB(input) {
  let db = {};
  if (typeof input == "string")
    db = JSON.parse(input);
  else if (typeof input == "object")
    db = input;
  let e = "";
  var t = {};

  //check for empty db, e.g. if JSON failed to parse after swaps
  if (!Object.keys(db)) {
    e += ` Empty dashboard, see previous errors.`;
  }
  if (typeof (db.tiles) == "undefined") {
    e += ` Dashboard missing 'tiles' section`;
  }
  if (typeof (db.dashboardMetadata) == "undefined") {
    e += ` Dashboard missing 'dashboardMetadata' section`;
  }

  //trunc any MARKDOWNs that are too long
  if (!e.length) {
    db.tiles.forEach(function (t, index, arr) {
      if (t.tileType == 'MARKDOWN' && t.markdown.length > 1000) {
        t.markdown = t.markdown.substring(0, 1000);
        e += ` Trunc MARKDOWN tile[${index}]\n`;
      }
    });
  }


  //validate DT is new enough to support tags
  if (!e.length) {
    if (version < dbTagsVersion) {
      if ("tags" in db.dashboardMetadata) {
        delete db.dashboardMetadata.tags;
        e += " Tenant too old, removing tags\n";
      }
    } else if ("tags" in db.dashboardMetadata) {
      if (!("Configurator" in db.dashboardMetadata.tags))
        db.dashboardMetadata.tags.push("Configurator");
    } else {
      db.dashboardMetadata.tags = ["Configurator"];
    }
  }

  //check that bounds are divisible by 38 and < 5016
  if (!e.length) {
    for (let i = db.tiles.length - 1; i >= 0; i--) {
      let t = db.tiles[i];
      let arr = db.tiles;

      if (t.bounds.left % 38 != 0) {
        e += ` tile[${i}] left bound not divisible by 38\n`;
      }
      if (t.bounds.top % 38 != 0) {
        e += ` tile[${i}] top bound not divisible by 38\n`;
      }
      if (t.bounds.width % 38 != 0) {
        e += ` tile[${i}] width bound not divisible by 38\n`;
      }
      if (t.bounds.height % 38 != 0) {
        e += ` tile[${i}] height bound not divisible by 38\n`;
      }

      if (t.bounds.left + t.bounds.width > 5016) {
        arr.splice(i, 1); //remove tile out of bounds
        e += ` tile[${i}] horizontal out of bounds (5016)\n`;
      }
      if (t.bounds.top + t.bounds.height > 5016) {
        arr.splice(i, 1); //remove tile out of bounds
        e += ` tile[${i}] vertical out of bounds (5016)\n`;
      }
    }
  }

  //remove any CTS_PLUGIN_ruxit, which are deprecated
  if (!e.length) {
    for (let i = db.tiles.length - 1; i >= 0; i--) {
      t = db.tiles[i];
      if (t.tileType == "CUSTOM_CHARTING") {
        t.filterConfig.chartConfig.series.forEach(function (s) {
          if (s.metric.startsWith("CTS")) {
            db.tiles.splice(i, 1);
            e += ` Deprecated CTS metric detected tile[${i}]\n`;
          }
          if (s.metric == "builtin:synthetic.browser.duration") {
            db.tiles.splice(i, 1);
            e += ` Deprecated synthetic metric detected tile[${i}]\n`;
          }
        });
      }
    }
  }

  //temporarily remove visualizationConfig due to bugs in 189/190
  /*db.tiles.forEach(function(t,index,arr) {
    if("visualizationConfig" in t){
      delete t.visualizationConfig;
      e += ` Removed visualizationConfig tile[${index}]\n`;
    }
  });*/

  //check for untransformed dashboard
  if (!e.length) {
    var re = /^bbbbbbbb-/;
    if (!re.test(db.id)) e += ` Untransformed dashboard\n`;
  }

  //alert and return the DB
  if (e.length > 0) {
    e = `validateDB: (${db.dashboardMetadata.name})\n${e}`;
    console.log(e);
    if (typeof dtrum !== "undefined") dtrum.reportCustomError("Dashboard Validation", e, db.dashboardMetadata.name, true);
  }
  if (typeof input == "string")
    return (JSON.stringify(db));
  else if (typeof input == "object")
    return (db);
}

function addCostControlTile(db, config) {
  if (config.costControlUserSessionPercentage < 100) {
    let bounds = {
      "height": 38,
      "width": 152
    }
    bounds = findBottomRight(db, bounds);
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

function buildConfigDashboard(dashboard, id, config) {
  //transform
  dashboard["id"] = id;
  //break each 999 characters into a markdown tile 
  let markdownTemplate = JSON.stringify(dashboard["tiles"][0]);
  dashboard["tiles"].pop();
  let configS = JSON.stringify(config);
  let tiles = Math.ceil(configS.length / 999);
  let left = 0, top = 0;
  for (i = 0; i <= tiles; i++) {
    let markdown = JSON.parse(markdownTemplate);
    markdown["markdown"] = configS.substring(i * 999, (i + 1) * 999);
    left += 152;
    if (left > 4500) {
      left = 0;
      top += 152;
    }
    markdown["bounds"]["left"] = left; //must snap to grid in 152
    markdown["bounds"]["top"] = top;

    dashboard["tiles"].push(markdown);
  }

  return dashboard;
}

function columnList(db, index, list) {
  if (index < 0) return;

  let bounds = db.tiles[index].bounds;
  let tileJSON = JSON.stringify(db.tiles[index]);

  list.forEach(function (e, i) {
    let t = JSON.parse(tileJSON);
    t.name = e.displayName;
    t.assignedEntities[0] = e.entityId;
    t.bounds = JSON.parse(JSON.stringify(bounds));
    if (i === 0)
      db.tiles[index] = t;
    else
      db.tiles.push(t);

    bounds.top = bounds.top + bounds.height;
  });
}

function twoColumnList(db, leftIndex, rightIndex, list) {
  columnList(db, leftIndex, list.filter((a, i) => i % 2 === 1));
  columnList(db, rightIndex, list.filter((a, i) => i % 2 === 0));
}

function findTileByName(db, findName) {
  return db.tiles.map(e => e.name).indexOf(findName);
}

function SAPappList(db, apps) {
  let leftIndex = findTileByName(db, "SAP APP Right");//Joe has his Left & Right flipped
  let rightIndex = findTileByName(db, "SAP App Left");
  if (apps.length === 1) {
    columnList(db, leftIndex, apps);
    db.tiles.splice(rightIndex, 1);
  } else if (apps.length > 1) {
    twoColumnList(db, leftIndex, rightIndex, apps);
  }
}

function applyTileReplicators(db, replicators) {
  replicators.forEach(function (rep) {
    db.tiles
      .filter(x => x.name === rep.tilename)
      .forEach(function (t) {
        for (let i = 0; i < rep.count; i++) {
          let j = i + 1; //swaps are base 1 instead of 0
          let newTile = JSON.parse(JSON.stringify(t));
          let colnum = i % rep.columns;
          let rownum = Math.floor(i / rep.columns);
          newTile.bounds.left = t.bounds.left + t.bounds.width * colnum;
          newTile.bounds.top = t.bounds.top + t.bounds.height * rownum;

          if (rep.vals[j]) newTile.name = rep.vals[j];
          let tmp = JSON.stringify(newTile);
          let from = '\\${' + rep.transform + '\\.([^}]+)}';
          let to = '${' + rep.transform + '-' + j.toString() + '.$1}';
          tmp = tmp.replace(new RegExp(from, 'g'), to);
          newTile = JSON.parse(tmp);

          //Perhaps do a bounds check?
          db.tiles.push(newTile);
        }
      });
    db.tiles = db.tiles
      .filter(x => x.name !== rep.tilename); //remove placeholders
  });

}

function addPowerupDisclaimer(db) {
  const disclaimer = {
    "name": "Markdown",
    "tileType": "MARKDOWN",
    "configured": true,
    "bounds": {
      "top": 0,
      "left": 0,
      "width": 1254,
      "height": 76
    },
    "tileFilter": {},
    "markdown": "##\uD83D\uDC8E Powerup Enabled Dashboard \uD83D\uDC8E\n\n##  [Install Chrome Extension](https://chrome.google.com/webstore/detail/dynatrace-dashboard-power/dmpgdhbpdodhddciokonbahhbpaalmco)"
  }

  //move everything down by disclaimer height
  const h = disclaimer.bounds.height;
  db.tiles.forEach((t, i, a) => {
    t.bounds.top = t.bounds.top + h;
  });

  //inject disclaimer
  db.tiles.push(disclaimer);

  //add tag
  if (!('tags' in db.dashboardMetadata))
    db.dashboardMetadata.tags = [];
  let tags = db.dashboardMetadata.tags;
  if (!tags.includes("Powerup"))
    tags.push("Powerup");

  return (db);
}
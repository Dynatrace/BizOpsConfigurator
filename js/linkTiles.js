function findLinkTile(db, marker) {
  let t = {};
  for(let i=0; i<db.tiles.length; i++) {
    t = db.tiles[i];
    if(t.tileType=="MARKDOWN" && t.markdown.includes(marker)) {
        return(i);
    }
  }
  return(db.tiles.length);  //We need to push a new tile
}

function createLinkTile(bounds,re,myID,marker) {
  //generate a Markdown tile with links to all dashboards that match a re at certain spot
  let json =    " { \"name\": \"Markdown\", \"tileType\": \"MARKDOWN\", \"configured\": true, \"bounds\": { \"top\": 760, \"left\": 0, \"width\": 266, \"height\": 38 }, \"tileFilter\": { \"timeframe\": null, \"managementZone\": null }, \"markdown\": \"\" }";
  let tile = JSON.parse(json);
  let minHeight = 0;

  tile.bounds = bounds;

  if(marker.length>0) {
    tile.markdown = marker;
    minHeight = 38;
  }

  DBAdashboards.forEach(function(db) {
    let name = db.name.replace(/^[^ \w]* /, ''); //strip emojis in small links
    if(re.test(db.id) && db.id != myID) {
      if(tile.markdown.length > 0) tile.markdown += "\n";
      tile.markdown += "## ["+name+"](#dashboard;id="+db.id+")\n![]()\n";
      minHeight += 38;
    }
  });

  tile.bounds.height = Math.max(tile.bounds.height,minHeight);
 return tile;
}

function updateLinkTile(db,config,re,marker) {
    if( typeof(config.linkTile) === 'undefined' || typeof(config.linkTile.index) === 'undefined') { //linkTile not in config
      let i = findLinkTile(db,marker);
      if(i < db.tiles.length) { //tile already exists
        config.linkTile = { //template found, retain it's bounding box
            bounds: db.tiles[i].bounds
        };
        db["tiles"][i] = createLinkTile(config.linkTile.bounds,re,db.id,marker);
      } else {  //no template tile
        config.linkTile = { //put it at the bottom-left
            bounds:  {
                top:  dbFindBottom(db),
                left: 0,
                width: 342,
                height: 38
            }
        };
      db["tiles"].push(createLinkTile(config.linkTile.bounds,re,db.id,marker));
      }
    } else { //linkTile already known
     let i = config.linkTile.index;
     db["tiles"][i] = createLinkTile(config.linkTile.bounds,re,db.id,marker);
    }
}

function addReplaceButton(db,targetID,marker,button,locator) {
    let bounds = {};
    let i = findLinkTile(db,marker);
    
    if(i >= db.tiles.length) {
        bounds= {
            top:  0,
            left: 0,
            width: 38,
            height: 38
        }
        bounds = locator(db,bounds);
    } else {
        bounds = db.tiles[i].bounds;
    }
    
    let tile = { 
        "name": "Markdown", 
        "tileType": "MARKDOWN", 
        "configured": true, 
        "bounds": bounds,
        "tileFilter": { "timeframe": null, "managementZone": null }, 
        "markdown": "## ["+button+"](#dashboard;id="+targetID+")\n"+marker
    };
    db.tiles[i]=tile;
}

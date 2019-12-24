
function dbFindBottom(db) {
  let bottom = 0;

  db.tiles.forEach(function(tile) {
    bottom = Math.max(bottom, tile.bounds.top + tile.bounds.height);
  });

  return(bottom);
}

function createLinkTile(bounds,re,myID) {
  //generate a Markdown tile with links to all dashboards that match a re at certain spot
  let json =    " { \"name\": \"Markdown\", \"tileType\": \"MARKDOWN\", \"configured\": true, \"bounds\": { \"top\": 760, \"left\": 0, \"width\": 266, \"height\": 38 }, \"tileFilter\": { \"timeframe\": null, \"managementZone\": null }, \"markdown\": \"\" }";
  let tile = JSON.parse(json);
  let minHeight = 0;

  tile.bounds = bounds;

  DBAdashboards.forEach(function(db) {
    if(re.test(db.id) && db.id != myID) {
      if(tile.markdown.length > 0) tile.markdown += "\n";
      tile.markdown += "## ["+db.name+"](#dashboard;id="+db.id+")";
      minHeight += 38;
    }
  });

  tile.bounds.height = Math.max(tile.bounds.height,minHeight);
 return tile;
}

// funnel logic here
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

    var chart = new D3Funnel('#funnel');

   function funnelClickHandler(e) {
     if( $("input#whereClause").attr('readonly') ) { //do nothing if in pencil mode
	$( "#labelForm input:text").val(e.label.raw);
	$( "#labelForm input#i").val(e.index);
    let fw = $("#funnelwrapper");
    let lf = $("#labelForm");
	let rects = e.node.getClientRects();
	let x =  fw.position().left + fw.width()/2 - lf.width()/2;
	let y = rects[0].y + rects[0].height/2 - lf.height()/2;
	console.log( [ fw.position().left, fw.width()/2, lf.width()/2]);
	console.log([ rects[0].y,  rects[0].height/2, lf.height()/2]);
	let fill = e.fill.raw;
	$( "#labelForm" ).css({top: y, left: x, position:'absolute', background:fill});
	$( "#labelForm" ).show();
     } 
   };

   function updateWhere(data) {
	let whereA = [];
	data.forEach(function(d) {
	    let clauseString = d.clauses.join(" OR ");
        whereA.push("(" + clauseString + ")" );
	});
	let whereS = whereA.join(" AND ");

	$( "#whereClause").val(whereS);
   }

$( "#funnel" ).droppable({
  tolerance: "pointer",
  drop: function(event, ui) {
    ui.draggable.hide();
    let mx = event.clientX;
    let my = event.clientY;
    let id = ui.draggable[0].childNodes[0].id;
    let colname = ui.draggable[0].childNodes[0].dataset.colname;
    let appname = ui.draggable[0].childNodes[0].dataset.appname;
    let clause = colname + '="' + id + '"';
    if("xapp" in selection.config && selection.config.xapp) 
        clause = '(useraction.application="' + appname + '" and ' + clause + ')';
    //console.log("mouse drop at " + mx + "," + my);
    $("#funnel g").each(function(i) {
      let rect = this.getClientRects();
      if(typeof(rect[0]) != "undefined") {
	let gx = rect[0].x;
	let gy = rect[0].y;
	let gw = rect[0].width;
	let gh = rect[0].height;
	if(	mx>gx &&
		mx<gx+gw &&
		my>gy &&
		my<gy+gh ) {
		//console.log("hit: ");
		//console.log({mx,my, gx,gy,gw,gh});
		if(funnelData[i].value.length==0) {
		  funnelData[i].value = id;
		}
		else if(funnelData[i].value.length>0) {
		  funnelData[i].value += " OR " +id;
		}
		funnelData[i].clauses.push(clause);
    		chart.draw(funnelData, options);
		updateWhere(funnelData);
	}
	else {
		//console.log("miss: ");
		//console.log({mx,my, gx,gy,gw,gh});
        }
     }
    });
  }
});

// funnel logic here
    var data = [
        { label: 'Home', value: '/easytravel/home', clauses: ['useraction.name="/easytravel/home"'] },
        { label: 'Product', value: '/easytravel/product_detail', clauses: ['useraction.name="/easytravel/product_detail"'] },
        { label: 'Cart', value: '/easytravel/add_to_cart', clauses: ['useraction.name="/easytravel/add_to_cart"'] },
        { label: 'Order', value: '/easytravel/place_order', clauses: ['useraction.name="/easytravel/place_order"'] }
    ];
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

    chart.draw(data, options);
    updateWhere();

    $("#plus").click(function() {
     if( $("input#whereClause").attr('readonly') ) { //do nothing if in pencil mode
	data.push({ label: 'name', value: '', clauses: [] });
	chart.draw(data, options);
	updateWhere();
     }
   });
    $("#minus").click(function() {
     if( $("input#whereClause").attr('readonly') ) { //do nothing if in pencil mode
	data.pop();
	chart.draw(data, options);
	updateWhere();
     }
   });

   function funnelClickHandler(e) {
     if( $("input#whereClause").attr('readonly') ) { //do nothing if in pencil mode
	$( "#labelForm input:text").val(e.label.raw);
	$( "#labelForm input#i").val(e.index);
	//console.log("event:");
	//console.log(e);
	let rects = e.node.getClientRects();
	let y = rects[0].y - 2; //don't know why -2, but seems to work
	rects = e.node.parentNode.parentNode.getClientRects();
	let x = rects[0].x;
	let fill = e.fill.raw;
	$( "#labelForm" ).css({top: y, left: x, position:'absolute', background:fill});
	$( "#labelForm" ).show();
     } 
   };

   $( "#labelForm input:button" ).click(function() {
	let i = $( "#labelForm input#i").val();
	let label = $( "#labelForm #labelInput").val();
	data[i].label=label;
	$( "#labelForm" ).hide();
    	chart.draw(data, options);
	updateWhere();
   });

   function updateWhere() {
	let whereA = [];
	data.forEach(function(d) {
	   let clauseString = d.clauses.join(" OR ");
	   whereA.push("(" + clauseString + ") AS " + d.label);
	});
	let whereS = whereA.join(" AND ");

	$( "#whereClause").val(whereS);
   }

// Dragable logic here
$( "li" ).draggable();
$( "#funnel" ).droppable({
  tolerance: "pointer",
  drop: function(event, ui) {
    //alert( "dropped " + ui.draggable[0].childNodes[0].id );
    //console.log(event);
    //console.log(ui);
    ui.draggable.hide();
    let mx = event.clientX;
    let my = event.clientY;
    let id = ui.draggable[0].childNodes[0].id;
    let colname = ui.draggable[0].childNodes[0].dataset.colname;
    let clause = colname + '="' + id + '"';
    //let val = ui.draggable[0].childNodes[0].value;
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
		if(data[i].value.length==0) {
		  data[i].value = id;
		}
		else if(data[i].value.length>0) {
		  data[i].value += " OR " +id;
		}
		data[i].clauses.push(clause);
    		chart.draw(data, options);
		updateWhere();
	}
	else {
		//console.log("miss: ");
		//console.log({mx,my, gx,gy,gw,gh});
        }
     }
    });
  }
});

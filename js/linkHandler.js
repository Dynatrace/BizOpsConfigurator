function linkHandler(e) {
    if ($(this)[0].nodeName == 'A') {
      let a = $(this)[0];
      let id = a.id;
      if(typeof dtrum !== "undefined") dtrum.actionName("linkHandler("+id+")");
      if(a.classList.contains("newTab"))return e; //don't handle new tabs with jQuery
      if(a.classList.contains("dashboardList"))return e; //handled by custom listener
      if(a.classList.contains("dashboardCleanup-owner"))return e; //handled by custom listener
      if(a.classList.contains("dashboardCleanup-db"))return e; //handled by custom listener
      switch(id) {
      case "bc-connect":
        selection.config={};
        $("#viewport").load("html/configurator/main.html",fieldsetPainter);
        break;
      case "bc-deployApp":
        $("#viewport").load("html/configurator/deployApp.html",fieldsetPainter);
        break;
      case "bc-deployFunnel-name":
        $("#viewport").load("html/configurator/deployFunnel-name.html",fieldsetPainter);
        break;
      case "bc-deployFunnel-kpi":
        $("#viewport").load("html/configurator/deployFunnel-kpi.html",fieldsetPainter);
        break;
      case "bc-deployFunnel-compare":
        $("#viewport").load("html/configurator/deployFunnel-compare.html",fieldsetPainter);
        break;
      case "bc-deployFunnel-filters":
        $("#viewport").load("html/configurator/deployFunnel-filters.html",fieldsetPainter);
        break;
      case "bc-deployFunnel-funnel":
        $("#viewport").load("html/configurator/deployFunnel-funnel.html",fieldsetPainter);
        break;
      case "bc-deployTenant":
        $("#viewport").load("html/configurator/deployTenant.html",fieldsetPainter);
        break;
      case "bc-listApp":
        selection.config={};
        $("#viewport").load("html/configurator/listApp.html",fieldsetPainter);
        break;
      case "bc-listFunnel":
        selection.config={};
        $("#viewport").load("html/configurator/listFunnel.html",fieldsetPainter);
        break;
      case "bc-listTenant":
        selection.config={};
        $("#viewport").load("html/configurator/listTenant.html",fieldsetPainter);
        break;
      case "bc-dashboardCleanup":
        selection.config={};
        $("#viewport").load("html/dashboardCleanup.html",fieldsetPainter);
        break;
      case "pencil":
        pencilToggle();
        break;
      case "folder":
        $("#loadConfigDiv").toggle();
        break;
      case "x_a":
        $(this).parent().parent().hide();
        break;
      case "revealToken":
        if($("#revealToken").hasClass("revealed")){
          $("#revealToken").removeClass("revealed");
          $("#token").prop('type','password');
        } else {
          $("#revealToken").addClass("revealed");
          $("#token").prop('type','text');
        }
        break;
      default:
        alert("Unknown Link: " + id);
      }
    }
  }
  
  
  
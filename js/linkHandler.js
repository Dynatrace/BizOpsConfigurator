function loadStaticHandlers() {
  $("a#prerequisites").click(function() {
     $("#viewport").load("html/prerequisites-1.html");
     staticCleanup();
  });

  $("a#begin").click(function() {
     $("#viewport").load("html/configurator/connect.html",fieldsetPainter);
  });

  $("a#overview").click(function() {
     $("#viewport").load("html/overview.html");
     staticCleanup();
  });

  $("a#home").click(function() {
     $("#viewport").load("html/home.html");
     staticCleanup();
  });

  $("a#logo").click(function() {
     $("#viewport").load("html/home.html");
     staticCleanup();
  });

  $("a#funneltest").click(function() {
     $("#viewport").load("html/funnel-v2.html");
     staticCleanup();
  });

  //$("#v5test").click(v5handler);

  /*$("#githubtest").click(function() {
    testRepo(0);      
     staticCleanup();
  });*/

  $("#faq").click(function() {
     $("#viewport").load("html/faq.html");
     staticCleanup();
  });
  $("#arrow").click(function() {
        $("#lhs").hide();
        $("#hamburger").css('display', 'inline-flex');
  });
  $("#hamburger").click(function() {
        $("#lhs").show();
        $("#hamburger").hide();
  });
  $("#gear").click(function() {
        $("#repo_config").load("html/repo_config.html",fieldsetPainter);
        $("#repo_config").show();
        $("#repo_config").css('z-index',++popupZindex);
  });
  $("#dbbutton").click(function() {
        $("#dashboard_list").load("html/dashboard_list.html",fieldsetPainter);
        $("#dashboard_list").show();
        $("#dashboard_list").css('z-index',++popupZindex);
  });
  $("#miscTools").click(function(){
    $("#viewport").load("html/miscTools/toolsList.html");
    staticCleanup();
  });
  $("#devguide").click(function(){
    $("#viewport").load("html/devguide.html");
    staticCleanup();
  });
}

function staticCleanup() {
    $("#bcwrapper").hide();
    $("#errorbox").hide();
}

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
        popupZindex--;
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
      case "HUreport": {
        $("#viewport").load("html/miscTools/HUreport.html",HUreportChangeHandler);
        break;
      }
      case "MassEdit": {
        $("#viewport").load("html/miscTools/MassEdit.html",massEditInit);
        break;
      }
      case "devguide": {
        $("#viewport").load("html/devguide.html");
        break;
      }
      case "downloadExcel": {
        let selector = $(this).data("tableid");
        let filename = `${$(this).data("filename")}-${Date.now()}.xlsx`;
        let worksheet = 'worksheet';

        downloadExcel(filename,worksheet,selector);
        break;
      }
      default:
        //alert("Unknown Link: " + id);
        if(typeof dtrum !== "undefined") dtrum.reportCustomError("Unknown Link",e,id,true);
      }
    }
  }
  
  
function hashHandler(hash){
  switch(hash){
    case "#MassEdit":
      $("#viewport").load("html/miscTools/MassEdit.html",massEditInit);
      break;
    case "#faq":
      $("#viewport").load("html/faq.html");
      break;
    case "#overview":
      $("#viewport").load("html/overview.html");
      break;
    case "#begin":
      $("#viewport").load("html/configurator/connect.html",fieldsetPainter);
      break;
    case "#prerequisites":
      $("#viewport").load("html/prerequisites-1.html");
      break;
    case "#miscTools":
      $("#viewport").load("html/miscTools/toolsList.html");
      break;
    case "#HUreport":
      $("#viewport").load("html/miscTools/HUreport.html",HUreportChangeHandler);
      break;
    case "#devguide": {
      $("#viewport").load("html/devguide.html");
      break;
    }
    case "#home":
    default:
      $("#viewport").load("html/home.html");
  }
}
  
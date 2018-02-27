/**
 *
 * Principal View .js
 *
 *
 */
$(document).ready(function () {

  /**
   * Called to synchronize all instances. Show a loader wheel while the instances
   * are updating.
   */
  $("#sync-instances").click(function(){
    $("#dimmer").css("display", "inline");
    $("#loader").css("display", "inline");
    $("#loader-text").css("display", "inline");
    if (typeof user !== "undefined"){
      $.ajax({
        url: 'service/synchronize/',
        type: 'PUT',
        success: function(result){
          localStorage.setItem("message", "All instances were updated successfully.");
          window.location = window.location.pathname;
        },
        beforeSend: function(xhr){
          xhr.setRequestHeader("Authorization", "Basic " + btoa(user.user + ":" + user.password));
        }
      });
    }
  });

  // Title text changes
  // $("#list-tab").click(function(){
  //   $("#view-type").text("Instances List View");
  // });
  $("#grid-tab").click(function(){
    //$("#view-type").text("Instances Grid View");
    getInstances($("#search-instance").val());
  });
  // $("#world-tab").click(function(){
  //   $("#view-type").text("Instances World View");
  // });

  // Search instance functionality
  $("#search-instance").on('keyup', function(){
    $("#list-table-body").empty();
    getInstances($(this).val());
  });

  var globalInstances = [];

  // When loaded, all instances are loaded
  getInstances("all");

});

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

/**
 * Get instances from the registry and fill the list and grid view.
 * @search Search query text to search among instances
 */
function getInstances(search){
  console.log("inside getInstances");
  if(search=="all")
    {var query_api = "mines=";}
  else {
    var query_api = "q=";
  }

  $.get("http://registry.intermine.org/service/instances?"+ query_api + search, function(response){
    $("#list-table-body").empty();
    $("#og-grid").empty();
    var response = response.instances;
    globalInstances = response;
    var highlightFlag = 0;

    for (var i = 0; i < response.length; i++){
      var instance = response[i];
      var imageURL = "";

      // Get Instance Image
      if (typeof instance.images !== "undefined" && typeof instance.images.logo !== "undefined"){
        if (instance.images.logo.startsWith("http")){
          imageURL = instance.images.logo;
        } else {
          imageURL = instance.url + "/" + instance.images.logo;
        }
      } else {
        imageURL = "https://cdn.rawgit.com/intermine/design-materials/78a13db5/logos/intermine/squareish/45x45.png"
      }



      /*
      * ============= List View Content ===============
      */


      var organisms = "";
      for (var z = 0; z < instance.organisms.length; z++){
        instance.organisms[z] = instance.organisms[z].trim();
      }
      instance.organisms = instance.organisms.sort();
      for (var j = 0; j < instance.organisms.length; j++){
        if (j === instance.organisms.length - 1){
          organisms += instance.organisms[j];
        } else {
          organisms += instance.organisms[j] + ", ";
        }
      }

      var mineColor = "";
      if (typeof instance.colors !== "undefined"){
        if (typeof instance.colors.header !== "undefined"){
            mineColor = instance.colors.header.main;
            colorForPanel = instance.colors.header.main;
        } else {
            mineColor = "#595455";
            colorForPanel = "#595455"
        }
      } else {
        colorForPanel = "#595455"
        mineColor = "#595455";
      }
      mineColor = mineColor.replace(";", "");
      colorForPanel = colorForPanel.replace(";", "");

      var highlightAddClass = "";
      highlightFlag = highlightFlag? 0 : 1 ;
      highlightAddClass = highlightFlag? "highlight" : "" ;

      // Fill the list view instances list content
      $("#list-table-body").append(
        "<tr class='registry-item " + highlightAddClass + "' id='item-"+ instance.id +"'>" +
          "<td> <img style='width: 25px; height: 21px;' src='" + imageURL + "' alt='Icon'></td>" +
          "<td class='bold mine-name'>" + instance.name + "</td>" +
          "<td class='truncate mine-desc'>" + instance.description + "</td>" +
          "<td class='mine-url' style='display:none'>" + instance.url + "</td>" +
          "<td class='truncate org-col'>" + organisms + "</td>" +
        "</tr>"
      );

      // Mine Hover functionality in list view
      $("#item-" + instance.id).hover(function(){
        hoveredMineName = $(this).children("td[class='bold mine-name']").text();
        var mineColor = "";
        for (var i = 0; i < globalInstances.length; i++){
          if(hoveredMineName == globalInstances[i].name){
            if (typeof globalInstances[i].colors !== "undefined"){
              if (typeof globalInstances[i].colors.header !== "undefined"){
                  mineColor = globalInstances[i].colors.header.main;
              } else {
                  mineColor = "#595455";
              }

              break;
            }
          }
        }
        var mineColor = mineColor.replace(";", "");
        if (mineColor !== ""){
          $(this).css({"background-color": mineColor, "color": "white"});
        } else {
          $(this).css({"background-color": mineColor, "color": "black"});
        }

      }, function(){
        $(this).css({"background-color": "", "color": "black"});
      });



      /*
      * ============= Grid View Content ===============
      */


      // If false, then mineColor are used for the Grid View
      var usePanels = false;

      panelColorNumber = Math.floor((Math.random() * 9) + 1).toString();
      imgSrc = "/images/thumbs/" + panelColorNumber + ".png";
      gridTextFill = instance.description.length > 120 ? "..." : "";
      if (usePanels){
        var imgHTMLtoRender = '<img class="grid-image" src="'+ imgSrc + '" alt="img02"/>';
      } else {
        var canvas = document.createElement("canvas");
        canvas.width = 225;
        canvas.height = 200;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = colorForPanel;
        R = hexToR(colorForPanel);
        G = hexToG(colorForPanel);
        B = hexToB(colorForPanel);
        ctx.fillRect(0, 0, 225, 200);
        var img = $(document.createElement("img"));
        img.attr("src", canvas.toDataURL("image/png"));
        img.attr("class", "grid-image");
        var imgHTMLtoRender = img.prop('outerHTML');

        if ((R*0.299 + G*0.587 + B*0.114) > 150){
          fontColorToUse = '#000000'
        } else {
          fontColorToUse = '#FFFFFF'
        }

      }



      // Fill grid view content
      $("#og-grid").append(
        '<li class="grid-box" style="transition: height 350ms ease; height: 200px;">' +
          '<a href="#" data-largesrc="" data-title="Azuki bean" data-description="'+instance.id+'">' +
            '<div class="grid-panel card-1 hvr-float-shadow hvr-bounce-to-bottom">' +
              imgHTMLtoRender +
              '<h2 class="ml-15 mt-5 align-left grid-panel-title" style="color: ' + fontColorToUse + '"> '+ instance.name + ' </h2>' +
              '<p class="ml-15 align-left grid-panel-description" style="color: ' + fontColorToUse + '">' + instance.description.substring(0, 130) + gridTextFill + '</p>' +
              '<i class="panel-icons fa fa-caret-down" aria-hidden="true" style="display: none; color: ' + fontColorToUse + '"></i>' +
            '</div>' +
          '</a>' +
        '</li>'
      );
    }

    $(".grid-panel").hover(function(){
      $($(this).children()[3]).css('display', 'inline');
    }, function(){
      $($(this).children()[3]).css('display', 'none');
    });

    /**
     * This scripts must be loaded here. After og-grid content has been loaded.
     * Otherwhise, grid view functionality doesnt work.
     */
    $.getScript("/javascripts/modernizr.custom.js", function(data, txtStatus, jqxhr){
      $.getScript("/javascripts/grid.js", function(data, txtStatus, jqxhr){
        jQuery_1_9_1(function() {
          Grid.init();
        });
      });
    });


    /*
    * ========== Loading content of List View Modal when Clicked ============
    */


    $(".deletemineb").click(function(){
      $('#delete-modal').modal({show:true});
    });


    $(".registry-item").click(function(){
      var selectedMine = $(this).children("td[class='bold mine-name']").text();

      $.get("service/instances/" + selectedMine, function(response){
        var instance = response.instance;

        $("#update-mine-list").attr('href', 'instance/?update=' + instance.id);
        $("#modal-delete-mine-title").text("Delete "+ instance.name);
        $("#mine-delete-modal-body").text("Are you sure deleting " + instance.name + " from the Registry?")
        // Delete Instance
        $(".confirmdeleteb").click(function(){
          if (typeof user !== "undefined"){
            $('#mine-modals').modal('hide');
            $.ajax({
              url: 'service/instances/' + instance.id,
              type: 'DELETE',
              success: function(result){
                localStorage.setItem("message", "Instance " + instance.name + " was deleted successfully.");
                window.location = window.location.pathname;
              },
              beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + btoa(user.user + ":" + user.password));
              }
            });
          }
        });

        // Synchronize Instance
        $("#sync-mine-list").click(function(){
          if (typeof user !== "undefined"){
            $.ajax({
              url: 'service/synchronize/' + instance.id,
              type: 'PUT',
              success: function(result){
                localStorage.setItem("message", "Instance " + instance.name + " was updated successfully.");
                window.location = window.location.pathname;
              },
              beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + btoa(user.user + ":" + user.password));
              }
            });
          }
        });

        if (typeof instance.images !== "undefined" && typeof instance.images.logo !== "undefined"){
          if (instance.images.logo.startsWith("http")){
            imageURL = instance.images.logo;
          } else {
            imageURL = instance.url + "/" + instance.images.logo;
          }
        } else {
          imageURL = "https://cdn.rawgit.com/intermine/design-materials/78a13db5/logos/intermine/squareish/45x45.png"
        }
        $("#modal-mine-img").attr("src", imageURL);

        // Fill out modal body with fields of the instance
        $("#mine-modal-body").empty();
        $("#modal-mine-title").text(instance.name);



        $("#list-api-version").text(instance.api_version);
        $("#list-url").text(instance.url);
        $("#list-url").attr("href", instance.url);
        $("#mine-modal-body").append('<div class="bold"> Description </div><p id="list-description">'+ instance.description+' </p>');
        $("#mine-modal-body").append('<span class="bold"> URL: </span><a target="_blank" id="list-url" href="'+instance.url+'">'+instance.url+'</a><br>');
        if(instance.maintainerOrgName !== undefined){
          $("#mine-modal-body").append('<span class="bold"> Maintainer Name: </span><span id="list-maintainerOrgName">'+ instance.maintainerOrgName+' </span><br>');
        }
        if(instance.maintainerUrl !== undefined){
          $("#mine-modal-body").append('<span class="bold"> Maintainer URL: </span><a target="_blank" id="list-maintainerUrl" href="'+instance.maintainerUrl+'">'+instance.maintainerUrl+'</a><br>');
        }
        $("#mine-modal-body").append('<span class="bold"> API Version: </span><span id="list-api-version">'+instance.api_version+'</span>')
        if (instance.release_version !== ""){
          $("#mine-modal-body").append(
            '<br><span class="bold"> Release Version: </span>' +
            '<span id="list-release-version"> '+ instance.release_version + '</span>'
          );
        }
        if (instance.intermine_version !== ""){
          $("#mine-modal-body").append(
            '<br><span class="bold"> Intermine Version: </span>' +
            '<span id="list-intermine-version"> '+ instance.intermine_version + '</span>'
          );
        }
        for (var z = 0; z < instance.organisms.length; z++){
          instance.organisms[z] = instance.organisms[z].trim();
        }
        instance.organisms = instance.organisms.sort();

        if (instance.organisms.length != 0){
          var organismsString = "";
          for (var j = 0; j < instance.organisms.length; j++){
            if (j === instance.organisms.length-1){
              organismsString += instance.organisms[j];
            } else {
              organismsString += instance.organisms[j] + ", ";
            }
          }
          $("#mine-modal-body").append(
            '<br><br>'+
            '<span class="bold"> Organisms: </span>' +
            '<span id="list-mine-organisms"> '+ organismsString + '</span>'
          );
        }


        if (instance.neighbours.length != 0){
          var neighboursString = "";
          for (var j = 0; j < instance.neighbours.length; j++){
            if (j === instance.neighbours.length-1){
              neighboursString += instance.neighbours[j];
            } else {
              neighboursString += instance.neighbours[j] + ", ";
            }
          }
          $("#mine-modal-body").append(
            '<br><br>'+
            '<span class="bold"> Neighbours: </span>' +
            '<span id="list-mine-neighbours"> '+ neighboursString + '</span>'
          );
        }

        if (instance.twitter !== ""){
          $("#mine-modal-body").append(
            '<br>' +
            '<div class="align-right">' +
            '<i class="fa fa-twitter" aria-hidden="true" style="font-size: 30px;"></i>' +
            '<a id="list-release-version" target="_blank" href="https://twitter.com/'+instance.twitter+'"> '+ instance.twitter + '</a>' +
            '</div>'
          );
        }
      });
      $('#mine-modals').modal({show:true});
    });
  });
}

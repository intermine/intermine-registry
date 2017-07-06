$(document).ready(function () {

  $("#list-tab").click(function(){
    $("#view-type").text("List View");
  });

  $("#grid-tab").click(function(){
    $("#view-type").text("Grid View");
  });

  $("#world-tab").click(function(){
    $("#view-type").text("World View");
  });

  var globalInstances = [];

  $.get("service/instances", function(response){
    var response = response.instances;
    globalInstances = response;
    for (var i = 0; i < response.length; i++){
      var instance = response[i];
      var imageURL = "";
      if (typeof instance.images !== "undefined"){
        if (instance.images.small.startsWith("http")){
          imageURL = instance.images.small;
        } else {
          imageURL = instance.url + "/" + instance.images.small;
        }
      } else {
        imageURL = "http://intermine.readthedocs.org/en/latest/_static/img/logo.png"
      }

      /*
      * ========== List View ==========
      */
      $("#list-table-body").append(
        "<tr class='registry-item' id='item-"+ instance.id +"'>" +
          "<td> <img style='width: 25px; height: 21px;' src='" + imageURL + "' alt='Icon'></td>" +
          "<td class='bold mine-name'>" + instance.name + "</td>" +
          "<td class='truncate'>" + instance.description + "</td>" +
          "<td>" + instance.api_version + "</td>" +
        "</tr>");

      panelColorNumber = Math.floor((Math.random() * 9) + 1).toString();
      imgSrc = "/images/thumbs/" + panelColorNumber + ".png";

      $("#og-grid").append(
        '<li style="transition: height 350ms ease; height: 250px;">' +
          '<a href="#" data-largesrc="" data-title="Azuki bean" data-description="'+instance.id+'">' +
            '<div class="grid-panel hvr-float-shadow hvr-bounce-to-bottom">' +
              '<img class="grid-image" src="'+ imgSrc + '" alt="img02"/>' +
              '<h2 class="ml-15 mt-5 align-left grid-panel-title"> '+ instance.name + ' </h2>' +
              '<p class="ml-15 align-left grid-panel-description">' + instance.description.substring(0, 150) + '...' + '</p>' +
              '<i class="panel-icons glyphicon glyphicon-option-horizontal"> </i>' +
            '</div>' +
          '</a>' +
        '</li>'
      );

      $("#item-" + instance.id).hover(function(){
        hoveredMineName = $(this).children("td[class='bold mine-name']").text();
        var mineColor = "";
        for (var i = 0; i < globalInstances.length; i++){
          if(hoveredMineName == globalInstances[i].name){
            if (typeof globalInstances[i].colors !== "undefined"){
              mineColor = globalInstances[i].colors.focus.bg;
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
    }

    $.getScript("/javascripts/modernizr.custom.js", function(data, txtStatus, jqxhr){
      $.getScript("/javascripts/grid.js", function(data, txtStatus, jqxhr){
        jQuery_1_9_1(function() {
          Grid.init();
        });
      });
    });



    $(".registry-item").click(function(){
      var selectedMine = $(this).children("td[class='bold mine-name']").text();

      $.get("service/instances/" + selectedMine, function(response){
        var instance = response.instance;
        $("#mine-modal-body").empty();
        $("#modal-mine-title").text(instance.name);
        $("#list-api-version").text(instance.api_version);
        $("#list-url").text(instance.url);
        $("#list-url").attr("href", instance.url);

        $("#mine-modal-body").append('<div class="bold"> Description </div><p id="list-description">'+ instance.description+' </p>');
        $("#mine-modal-body").append('<span class="bold"> URL: </span><a target="_blank" id="list-url" href="'+instance.url+'">'+instance.url+'</a><br>');

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

        if (instance.organisms.length != 0){
          var list = "";
          for (var j = 0; j < instance.organisms.length; j++){
              list += "<li>" + instance.organisms[j] + "</li>";
          }
          $("#mine-modal-body").append(
            '<br><br>'+
            '<div style="display: inline-block;">' +
            '<div class="col-lg-12">' +
            '<span class="bold"> Organisms: </span>' +
            '<ul>'+
              list +
            '</ul>' +
            '</div>' +
            '</div>'
          );
        }

        if (instance.neighbours.length != 0){
          var list = "";
          for (var j = 0; j < instance.neighbours.length; j++){
              list += "<li>" + instance.neighbours[j] + "</li>";
          }
          $("#mine-modal-body").append(
            '<div style="display: inline-block; vertical-align:top;">' +
            '<div class="col-lg-12">' +
            '<span class="bold"> Neighbours: </span>' +
            '<ul>'+
              list +
            '</ul>' +
            '</div>' +
            '</div>'
          );
        }

        if (instance.twitter !== ""){
          $("#mine-modal-body").append(
            '<br>' +
            '<div class="align-right">' +
            '<img src="http://icons.iconarchive.com/icons/limav/flat-gradient-social/256/Twitter-icon.png" style="width:30px; height:30px;">' +
            '<a id="list-release-version" target="_blank" href="https://twitter.com/'+instance.twitter+'"> '+ instance.twitter + '</a>' +
            '</div>'
          );
        }
      });
    	$('#mine-modals').modal({show:true})
    });
  });
});

$(document).ready(function () {

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

      /*
      * ========== Grid View ==========
      */

    }

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

        if (instance.twitter !== ""){
          $("#mine-modal-body").append(
            '<br><br>' +
            '<img src="http://icons.iconarchive.com/icons/limav/flat-gradient-social/256/Twitter-icon.png" style="width:30px; height:30px;">' +
            '<a id="list-release-version" target="_blank" href="https://twitter.com/'+instance.twitter+'"> '+ instance.twitter + '</a>'
          );
        }

      });


    	$('#mine-modals').modal({show:true})

    });

  });





  $(".closeb").click(function () {

    $("#pinside").text("You've Selected: ");

  });

});

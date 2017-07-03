$(document).ready(function () {

  /*
  * ========== List View ==========
  */


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
        console.log(mineColor);
        if (mineColor !== ""){
          $(this).css({"background-color": mineColor, "color": "white"});
        } else {
          $(this).css({"background-color": mineColor, "color": "black"});
        }

      }, function(){
        $(this).css({"background-color": "", "color": "black"});
      });

    }

    $(".registry-item").click(function(){
      var selectedMine = $(this).children("td[class='bold mine-name']").text();

      $.get("service/instances/" + selectedMine, function(response){
        var instance = response.instance;
        $("#modal-mine-title").text(instance.name);
        $("#pinside").text(instance.description);

      });


    	$('#mine-modals').modal({show:true})

    });

  });





  $(".closeb").click(function () {

    $("#pinside").text("You've Selected: ");

  });

});

function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

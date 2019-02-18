/**
 *
 * Map View Functionality .js
 *
 *
 */
// All mines object
var mines = {};

/**
 * Load mines from Registry
 */
function loadMines(){
  $.get("service/instances", function(response){
    var response = response.instances;
    for (var i = 0; i < response.length; i++){
      var mine = response[i];
      if (mine.location.latitude != ""){
        var name = mine.name;
        var url = mine.url;
        var lat = mine.location.latitude;
        var lon = mine.location.longitude;
        mines[name.toLowerCase()] = {
          name: name,
          location: {
            lat: lat,
            lon: lon,
            string: ""
          },
          url: url
        }
      }
    }
    if (mines.length > 0) {
      mineMiner().init();
    }
  });
}

var mineMiner = function() {
  var map;
  function init() {
    map = L.map('map').setView([mines.flymine.location.lat, mines.flymine.location.lon], 3);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'sk.eyJ1IjoieW9jaGFubmFoIiwiYSI6ImNpazEzdHZscTAyemR4NG01cWE2enZlcDQifQ.khbJ9AQiNTIdrniQRN8gEg'
    }).addTo(map);
    L.Icon.Default.imagePath = 'images/leaflet'
    addMines();
  }

  $("#map").on( "click", function() {
      map.invalidateSize(false);
  });

  $("#map").mouseover(function() {
      map.invalidateSize(false);
  });


  /**
   * Adds all mines in the JSON to the map and make nice popups for them
   */
  function addMines(){
    var mineKeys = Object.keys(mines), mine;
    var mineNameLayer = [];
    for (var i = 0; i < mineKeys.length; i++) {
      var minesToAdd = [];
      mine = mines[mineKeys[i]];
      // Check for mines with same location
      for (var j = 0; j < mineKeys.length; j++){
        var mineToCheck = mines[mineKeys[j]];
        if (mineToCheck.location.lat == mine.location.lat && mineToCheck.location.lon == mine.location.lon){
          minesToAdd.push(mineToCheck);
        }
      }

      //location and popup are re-used by the markers
      //and by the show all popups "mine labels" layerGroup
      var location = new L.LatLng(mine.location.lat, mine.location.lon),
          popUp = new L.Popup({closeButton:false}).setLatLng(location).setContent( makeMinePopup(minesToAdd));

      //storing the popups in a layer allows us to enable or disable all at once
      mineNameLayer.push(popUp);

      //make marker
      L.marker(location)
      //push to map
      .addTo(map)
      //add the popup for it so users can click and learn things
      .bindPopup(popUp);
    }
   var mineLayer = L.layerGroup(mineNameLayer);
   L.control.layers(null,{"Mine Labels": mineLayer}).addTo(map);
  }

  /**
   * Format HTML for the map mine popup
   **/
  function makeMinePopup(minesToAdd){
    var mineHtml = "";
    for (var j = 0; j < minesToAdd.length; j++){
      mine = minesToAdd[j];
      if(j>0){
        mineHtml += "<br />";
      }
      mineHtml += "<a href='" + mine.url + "' target='_blank'>" + mine.name + "</a>";
    }
    return mineHtml;
  }

  return {
    init: init
  }
};

document.addEventListener("DOMContentLoaded", function() {
    loadMines();
});

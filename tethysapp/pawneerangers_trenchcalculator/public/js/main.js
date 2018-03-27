init_map = function(){
        require([
      "esri/Map",
      "esri/views/MapView",
      "esri/widgets/Sketch/SketchViewModel",
      "esri/Graphic",
      "esri/layers/GraphicsLayer",
      "esri/tasks/Geoprocessor",
      "esri/tasks/support/FeatureSet",
      "esri/geometry/Point",
      "esri/geometry/Polyline",
      "dojo/domReady!"
    ], function(Map, MapView, SketchViewModel, Graphic, GraphicsLayer, Geoprocessor, FeatureSet, Point, Polyline) {

        var tempGraphicsLayer = new GraphicsLayer();

        var map = new Map({
          basemap: "gray",
          layers: [tempGraphicsLayer],
        });

        var view = new MapView({
          container: "map",
          map: map,
          center: [-111.7,40.25],
          zoom: 13
        });

        var markerSymbol = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [255, 0, 0],
          outline: { // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: .001
          }
        };

        var slopeUrl = "http://geoserver2.byu.edu/arcgis/rest/services/PawneeRangers/PawneeRangers_SlopeCalc/GPServer/SlopeCalc2";

        var splitUrl = "http://geoserver2.byu.edu/arcgis/rest/services/PawneeRangers/generateprofile/GPServer/generateprofile";

        // create a new Geoprocessor
        var slopeGp = new Geoprocessor(slopeUrl);
        // define output spatial reference
        slopeGp.outSpatialReference = { // autocasts as new SpatialReference()
              wkid: 4326 //EPSG3857
            };

        // create a new Geoprocessor
        var splitGp = new Geoprocessor(splitUrl);
        // define output spatial reference
        splitGp.outSpatialReference = { // autocasts as new SpatialReference()
              wkid: 4326 //EPSG3857
            };

        view.when(function() {
        // create a new sketch view model
        var sketchViewModel = new SketchViewModel({
          view: view,
          layer: tempGraphicsLayer,
          polylineSymbol: { // symbol used for polylines
            type: "simple-line", // autocasts as new SimpleMarkerSymbol()
            color: "#8A2BE2",
            width: "3",
            style: "solid"
          }
        });




        // ************************************************************
        // Get the completed graphic from the event and add it to view.
        // This event fires when user presses
        //  * "C" key to finish sketching point, polygon or polyline.
        //  * Double-clicks to finish sketching polyline or polygon.
        //  * Clicks to finish sketching a point geometry.
        // ***********************************************************
        sketchViewModel.on("draw-complete", function(evt) {
          document.getElementsByClassName("slopereturn")[0].innerHTML = "Slope = (CALCULATING)";
          tempGraphicsLayer.add(evt.graphic);
          setActiveButton();
          var inputGraphicContainer = [];
          inputGraphicContainer.push(evt.graphic);
          var featureSet = new FeatureSet();
          featureSet.features = inputGraphicContainer;
          var splitpercent = $("#percentinput").val();

          // input parameters
          var params = {
            "Input_Features": featureSet,
            "line": featureSet,
            "Percentage": splitpercent,
          };

          slopeGp.submitJob(params).then(completeCallback, errBack, statusCallback);
          splitGp.submitJob(params).then(completeCallback, errBack, statusCallback);
          waiting_output();

        });



        function completeCallback(result){
            slopeGp.getResultData(result.jobId, "Line_With_Slope_Output").then(slopeResult, drawResultErrBack);
            splitGp.getResultData(result.jobId, "ptswithelevations").then(splitResult, drawResultErrBack);
            document.getElementById("waiting_output").innerHTML = '';
        }


        function slopeResult(data){
            var slope = data.value.features[0].attributes.slope;
            document.getElementsByClassName("slopereturn")[0].innerHTML = "Slope = " + slope;
//            var polyline = data.value.features[0]
//
//            var polylineSymbol = {
//              type: "simple-line",  // autocasts as SimpleLineSymbol()
//              color: [226, 119, 40],
//              width: 4
//            };
//
//            var polylineGraphic = new Graphic({
//              geometry: polyline,
//              symbol: polylineSymbol
//           });
//
//            tempGraphicsLayer.add(polylineGraphic);
        }

        function splitResult(data){
            var pt_feature = data.value.features;
            var i;
            for (i = 0; i < pt_feature.length; i++) {

                var point = new Point({
                    longitude: longitude= pt_feature[i]['geometry']['longitude'],
                    latitude: latitude= pt_feature[i]['geometry']['latitude']
                });
                var ptGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol
                });
                tempGraphicsLayer.add(ptGraphic);
            }
        }

        function drawResultErrBack(err) {
            console.log("draw result error: ", err);
            document.getElementById("waiting_output").innerHTML = '';
        }

        function statusCallback(data) {
            console.log(data.jobStatus);
        }
        function errBack(err) {
            console.log("gp error: ", err);
            document.getElementById("waiting_output").innerHTML = '';
        }

        var drawLineButton = document.getElementById("polylineButton");
        drawLineButton.onclick = function() {
          // set the sketch to create a polyline geometry
          sketchViewModel.create("polyline");
          setActiveButton(this);
        };


        document.getElementById("resetBtn").onclick = function() {
          tempGraphicsLayer.removeAll();
          sketchViewModel.reset();
          setActiveButton();
        };

        function setActiveButton(selectedButton) {
          // focus the view to activate keyboard shortcuts for sketching
          view.focus();
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }
      });
    }

)};

function resultmodal() {
    $("#resultmod").modal('show')
}

function dimensionmodal() {
    $("#dimensionmod").modal('show')
}

function calcmes() {
    $("#slopereturn").html = "Line Slope = (CALCULATING)";
}

function waiting_output() {
    var wait_text = "<strong>Loading...</strong><br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='/static/pawneerangers_trenchcalculator/images/seal.gif'>";
    document.getElementById('waiting_output').innerHTML = wait_text;
}

$(function() {
    init_map();
});

/**********************************************
************** QUERY SELECTORS ****************
**********************************************/

var $slopeDisplay = $('#slope-display');
var $percentInput = $('#percent-input');
var $loadingAnimation = $('#loading-animation');
var $resetButton = $('#reset-button');
var $helpModal = $('#help-modal');
var $offhaulVolume = $('#offhaul-volume');
var $beddingVolume = $('#bedding-volume');
var $backfillVolume = $('#backfill-volume');

var trenchLength

/**********************************************
****************** FUNCTIONS ******************
**********************************************/


init_map = function() {
        require([
      "esri/Map",
      "esri/views/MapView",
      "esri/views/2d/draw/Draw",
      "esri/Graphic",
      "esri/layers/GraphicsLayer",
      "esri/tasks/Geoprocessor",
      "esri/tasks/support/FeatureSet",
      "esri/geometry/Polyline",
      "esri/geometry/geometryEngine",
      "dojo/dom",
      "dojo/on",
      "dojo/domReady!"
    ], function(Map, MapView, Draw, Graphic, GraphicsLayer, Geoprocessor, FeatureSet, Polyline, geometryEngine, dom, on) {

        var tempGraphicsLayer = new GraphicsLayer();

        var basemap = 'streets'

        var radios = document.forms["map-toggle"].elements["mapradio"];
        for(var i = 0, max = radios.length; i < max; i++) {
            radios[i].onclick = function() {
                map.basemap = this.value;
            }
        }

        var map = new Map({
          basemap: basemap,
          layers: [tempGraphicsLayer],
        });

        var view = new MapView({
          container: "map",
          map: map,
          center: [-111.7,40.25],
          zoom: 13
        });

        view.ui.add("line-button", "top-left");

        view.ui.add("search", "top-right");

        view.when(function(evt) {
          var draw = new Draw({
            view: view
          });

          var drawLineButton = document.getElementById("line-button");
          drawLineButton.onclick = function() {
            view.graphics.removeAll();
            enableCreateLine(draw, view);
          }
        });

        function enableCreateLine(draw, view) {
          // creates and returns an instance of PolyLineDrawAction 
          var action = draw.create("polyline");

          // focus the view to activate keyboard shortcuts for sketching
          view.focus();

          // listen to vertex-add event on the polyline draw action
          action.on("vertex-add", updateVertices);

          // listen to vertex-remove event on the polyline draw action
          action.on("vertex-remove", updateVertices);

          // listen to cursor-update event on the polyline draw action
          action.on("cursor-update", createGraphic);

          // listen to draw-complete event on the polyline draw action
          action.on("draw-complete", updateVertices);

        }

        // This function is called from the "vertex-add" and "vertex-remove"
        // events. Checks if the last vertex is making the line intersect itself.
        function updateVertices(evt) {
          // create a polyline from returned vertices
          var result = createGraphic(evt);
          // if the last vertex is making the line intersects itself,
          // prevent "vertex-add" or "vertex-remove" from firing
          if (result.selfIntersects) {
            evt.preventDefault();
          }
        }

        // create a new graphic presenting the polyline that is being drawn on the view
        function createGraphic(evt) {
          var vertices = evt.vertices;
          view.graphics.removeAll();

          // a graphic representing the polyline that is being drawn
          var graphic = new Graphic({
            geometry: new Polyline({
              paths: vertices,
              spatialReference: view.spatialReference
            }),
            symbol: {
              type: "simple-line", // autocasts as new SimpleFillSymbol
              color: [4, 90, 141],
              width: 4,
              cap: "round",
              join: "round"
            }
          });

          // check the polyline intersects itself.
          var intersectingFeature = getIntersectingFeature(graphic.geometry);

          // Add a new graphic for the intersecting segment.
          if (intersectingFeature) {
            view.graphics.addMany([graphic, intersectingFeature]);
          }
          // Just add the graphic representing the polyline if no intersection
          else {
            view.graphics.add(graphic);
          }

          // return the graphic and intersectingSegment
          return {
            graphic: graphic,
            selfIntersects: intersectingFeature
          }
        }

        // function that checks if the line intersects itself
        function isSelfIntersecting(polyline) {
          if (polyline.paths[0].length < 3) {
            return false
          }
          var line = polyline.clone();

          //get the last segment from the polyline that is being drawn
          var lastSegment = getLastSegment(polyline);
          line.removePoint(0, line.paths[0].length - 1);

          // returns true if the line intersects itself, false otherwise
          return geometryEngine.crosses(lastSegment, line);
        }

        // Checks if the line intersects itself. If yes, changes the last 
        // segment's symbol giving a visual feedback to the user.
        function getIntersectingFeature(polyline) {
          if (isSelfIntersecting(polyline)) {
            return new Graphic({
              geometry: getLastSegment(polyline),
              symbol: {
                type: "simple-line", // autocasts as new SimpleLineSymbol
                style: "short-dot",
                width: 3.5,
                color: "yellow"
              }
            });
          }
          return null;
        }

        // Get the last segment of the polyline that is being drawn
        function getLastSegment(polyline) {
          var line = polyline.clone();
          var lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
          var existingLineFinalPoint = line.getPoint(0, line.paths[0].length -
            1);
          return new Polyline({
            spatialReference: view.spatialReference,
            hasZ: false,
            paths: [
              [
                [existingLineFinalPoint.x, existingLineFinalPoint.y],
                [lastXYPoint.x, lastXYPoint.y]
              ]
            ]
          });
        }



        $('#build-trench-button').on('click', function() {
          $('#swanson').show()
          $('#result-table').hide()
          $('#result-plot').hide()
          $('#result-modal').modal('show');
          console.log(view.graphics.items[0])

          var inputGraphicContainer = [];
          inputGraphicContainer.push(view.graphics.items[0]);
          var featureSet = new FeatureSet();
          featureSet.features = inputGraphicContainer;

          var params = {
            "Input_Features": featureSet,
            "line": featureSet,
            "Percentage": 20,
          };
          console.log("TEST")
          slopeGp.submitJob(params).then(slopeCallback, errBack, statusCallback);

        })


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


        function slopeCallback(result){
            slopeGp.getResultData(result.jobId, "Line_With_Slope_Output").then(slopeResult, drawResultErrBack);
        }


        function splitCallback(result){
            splitGp.getResultData(result.jobId, "ptswithelevations").then(splitResult, drawResultErrBack);
        }


        function slopeResult(data){
            var slope = data.value.features[0].attributes.slope;
            trenchLength = data.value.features[0].attributes.length;
            console.log(slope)
            var inputGraphicContainer = [];
            inputGraphicContainer.push(view.graphics.items[0]);
            var featureSet = new FeatureSet();
            featureSet.features = inputGraphicContainer;

            var params = {
              "Input_Features": featureSet,
              "line": featureSet,
              "Percentage": 20,
            };
            splitGp.submitJob(params).then(splitCallback, errBack, statusCallback);
        }


        function splitResult(data){
            var pt_feature = data.value.features;
            var ptelev = [];
            var i;

            for (i = 0; i < pt_feature.length; i++) {

                ptelev.push(pt_feature[i]['attributes']['RASTERVALU'])

            }
            console.log(ptelev)
            console.log(trenchLength)
            section_length = trenchLength / 100
            console.log($('#pipe-diameter'))
            json_data = {
              'ptelev': ptelev.toString(),
              'pipe_diameter': $('#pipe-diameter').val(),
              'base_width': $('#base-width').val(),
              'min_depth': $('#min-depth').val(),
              'back_depth': $('#back-depth').val(),
              'base_slope': $('#base-slope').val(),
              'side_slope': $('#side-slope').val(),
              'section_length': section_length
            }
            console.log("TESTING123")
            $.ajax({
                headers: {'X-CSRFToken': getCookie('csrftoken')},
                type: 'POST',
                datatype: 'json',
                public: false,
                data: json_data,
                url: '/apps/pawneerangers-trenchcalculator/plot-elevations/',
                success: function (response) {
                  if (response.success === true) {
                    document.getElementById("results-button").disabled = false
                    console.log(response.results["offhaul_volume"])
                    console.log(response.results["backfill_volume"])
                    console.log(response.results["bedding_volume"])
                    console.log(response.results["plot_data"])

                    Highcharts.chart('result-plot', {

                        title: {
                            text: 'Profile of Pipe Installation'
                        },

                        yAxis: {
                            title: {
                                text: 'Elevation (ft)'
                            }
                        },

                        xAxis: {
                            title: {
                                text: 'Distance (ft)'
                            }
                        },

                        plotOptions: {
                            series: {
                                label: {
                                    connectorAllowed: false
                                },
                                pointStart: 0
                            }
                        },

                        series: [{
                            name: 'Elevation Profile',
                            data: response.results["plot_data"]
                        }],

                        responsive: {
                            rules: [{
                                condition: {
                                    maxWidth: 500
                                },
                                chartOptions: {
                                    legend: {
                                        layout: 'horizontal',
                                        align: 'center',
                                        verticalAlign: 'bottom'
                                    }
                                }
                            }]
                        }

                    });

                    $('#offhaul-result').text(response.results["offhaul_volume"])
                    $('#backfill-result').text(response.results["backfill_volume"])
                    $('#bedding-result').text(response.results["bedding_volume"])
                    $('#swanson').hide()
                    $('#result-table').show()
                    $('#result-plot').show()
                  };
                },
                error: function (status) {
                    //alert("FAIL")
                }
            });


            Highcharts.chart('resultgraph', {

                title: {
                    text: 'Profile of Pipe Installation'
                },

                yAxis: {
                    title: {
                        text: 'Elevation (ft)'
                    }
                },

                plotOptions: {
                    series: {
                        label: {
                            connectorAllowed: false
                        },
                        pointStart: 0
                    }
                },

                series: [{
                    name: 'Elevation',
                    data: ptelev
                }],

                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            legend: {
                                layout: 'horizontal',
                                align: 'center',
                                verticalAlign: 'bottom'
                            }
                        }
                    }]
                }

            });


        }

        function drawResultErrBack(err) {
            console.log("draw result error: ", err);
        }

        function statusCallback(data) {
            console.log(data.jobStatus);
        }
        function errBack(err) {
            console.log("gp error: ", err);
        }

        var featureLayer = map.layers.getItemAt(0);

      });
    }



getCookie = function(name) {
    /**
     * Gets CSRF Token.
     *
     * @parameter name
     * @returns cookieValue
     */

    // Gets cookie value.
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
};

function resultmodal() {
    $("#resultmod").modal('show')
}

function dimensionmodal() {
    $("#dimensionmod").modal('show')
}

function calcmes() {
    //$slopeDisplay.text("Line Slope = (CALCULATING)");
}
function waiting_output() {
    var wait_html = 
      "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='/static/pawneerangers_trenchcalculator/images/swansonhead.gif' style='width:70%'>";
    $loadingAnimation.html(wait_html);
}

$(function() {
    init_map();
    $helpModal.modal('show')
});

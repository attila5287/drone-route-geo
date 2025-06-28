import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import "bootswatch/dist/slate/bootstrap.min.css";
import { testpoly } from "./testdata";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import geometricRoute from "./logic/geometricRoute";

const paragraphStyle = {
  fontFamily: "Open Sans",
  margin: 0,
  fontSize: 13,
};

const Map = ({ token, baseHeight, topHeight, stepCount, toleranceWidth }) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [roundedArea, setRoundedArea] = useState();
  const drawRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [-104.98897, 39.73955], // civic
      zoom: 18.5,
      pitch: 45,
      bearing: 155,
      attributionControl: false,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
    });
    mapRef.current.addControl(draw);
    drawRef.current = draw; 
    mapRef.current.on("draw.create", updateArea);
    mapRef.current.on("draw.delete", updateArea);
    mapRef.current.on("draw.update", updateArea);

    function updateArea(e) {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const area = turf.area(data);
        setRoundedArea(Math.round(area * 100) / 100);
        mapRef.current.getSource( "user-extrude-src" ).setData( data );
        mapRef.current.getSource( "line-src" ).setData( geometricRoute( data, { inBaseHi: baseHeight, inTopHi: topHeight, inStepCount: stepCount, inToleranceWidth: toleranceWidth } ) );
      } else {
        setRoundedArea();
        if (e.type !== "draw.delete") alert("Click the map to draw a polygon.");
      }
    }

    mapRef.current.on("style.load", () => {
      console.log("map Style loaded");
      mapRef.current.addSource("user-extrude-src", {
        type: "geojson",
        data: testpoly,
      });

      // Render id: "user-extrude-layer",
      mapRef.current.addLayer({
        id: "user-extrude-layer",
        type: "fill-extrusion",
        source: "user-extrude-src",
        layout: {
          "fill-extrusion-edge-radius": 0.0,
        },
        paint: {
          "fill-extrusion-height": topHeight,
          "fill-extrusion-base": baseHeight,
          "fill-extrusion-emissive-strength": 0.9,
          "fill-extrusion-color": "SkyBlue",
          "fill-extrusion-flood-light-color": "DarkTurquoise",
          "fill-extrusion-opacity": 0.5,
          "fill-extrusion-ambient-occlusion-wall-radius": 0,
          "fill-extrusion-ambient-occlusion-radius": 6.0,
          "fill-extrusion-ambient-occlusion-intensity": 0.9,
          "fill-extrusion-ambient-occlusion-ground-attenuation": 0.9,
          "fill-extrusion-vertical-gradient": false,
          "fill-extrusion-line-width": 0, //outwards like a wall
          "fill-extrusion-flood-light-wall-radius": 20,
          "fill-extrusion-flood-light-intensity": 0.9,
          "fill-extrusion-flood-light-ground-radius": 20,
          "fill-extrusion-cutoff-fade-range": 0,
          "fill-extrusion-rounded-roof": true,
          "fill-extrusion-cast-shadows": false,
          // "":,
        },
      });
      mapRef.current.addSource("line-src", {
        type: "geojson",
        lineMetrics: true,
        data: geometricRoute(testpoly, { inBaseHi: baseHeight, inTopHi: topHeight, inStepCount: stepCount, inToleranceWidth: toleranceWidth } ),
      });
      // base config for 2 line layers hrz/vert
      const paintLine = {
        "line-emissive-strength": 1.0,
        "line-blur": 0.2,
        "line-width": 1.25,
        "line-color": "limegreen",
      };
      let layoutLine = {
        // shared layout between two layers
        "line-z-offset": [
          "at-interpolated",
          ["*", ["line-progress"], ["-", ["length", ["get", "elevation"]], 1]],
          ["get", "elevation"],
        ],
        "line-elevation-reference": "sea",
        "line-cap": "round",
      };

      // id: "elevated-line-horizontal",
      layoutLine["line-cross-slope"] = 0;
      mapRef.current.addLayer({
        id: "elevated-line-horizontal",
        type: "line",
        source: "line-src",
        layout: layoutLine,
        paint: paintLine,
      });

      // elevated-line-vert
      layoutLine["line-cross-slope"] = 1;
      mapRef.current.addLayer({
        id: "elevated-line-vertical",
        type: "line",
        source: "line-src",
        layout: layoutLine,
        paint: paintLine,
      });
    });
    // cleanup function: remove the map when the component unmounts
    return () => {
      mapRef.current.remove();
    };
  }, []);
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (mapRef.current.getLayer("user-extrude-layer")) {
      mapRef.current.setPaintProperty(
        "user-extrude-layer",
        "fill-extrusion-base",
        +baseHeight
      );
      mapRef.current.setPaintProperty(
        "user-extrude-layer",
        "fill-extrusion-height",
          +topHeight
      );
    }
    
    // Check if sources exist before trying to use them
    const lineSource = mapRef.current.getSource("line-src");
    const userExtrudeSource = mapRef.current.getSource("user-extrude-src");
    
    if (!lineSource) return; // Sources not loaded yet
    
    if (
      drawRef.current &&
      typeof drawRef.current.getAll === "function" &&
      drawRef.current.getAll().features.length
    ) {
      const drawData = drawRef.current.getAll();
      console.log('drawData', drawData);
      lineSource.setData(
        geometricRoute(drawData.length > 0 ? drawData : testpoly, {
          inBaseHi: baseHeight,
          inTopHi: topHeight,
          inStepCount: stepCount,
          inToleranceWidth: toleranceWidth,
        })
      );
      if (userExtrudeSource) {
        userExtrudeSource.setData(drawData.length > 0 ? drawData : testpoly);
      }
      mapRef.current.triggerRepaint();
    } else {
      // TEST RUN WITH NO DRAW DATA
      console.log('test run with no draw data');
      lineSource.setData(
        geometricRoute(testpoly, {
          inBaseHi: baseHeight,
          inTopHi: topHeight,
          inStepCount: stepCount,
          inToleranceWidth: toleranceWidth,
        })
      );
      if (userExtrudeSource) {
        userExtrudeSource.setData(testpoly);
      }
      mapRef.current.triggerRepaint();
    }
  }, [baseHeight, topHeight, stepCount, toleranceWidth]);

  return (
    <>
      <div ref={mapContainerRef} id="map" style={{ height: "100%" }}></div>
      <div
        className="calculation-box"
        style={{
          borderRadius: 10,
          height: 60,
          width: 150,
          position: "absolute",
          bottom: 20,
          left: 135,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 5,
          textAlign: "center",
          fontSize: 10,
        }}
      >
        <p style={paragraphStyle}>Draw a polygon.</p>
        <div id="calculated-area">
          {roundedArea && (
            <>
              <p style={paragraphStyle}>
                <strong>{roundedArea}</strong>
              </p>
              <p style={paragraphStyle}>square meters</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Map;

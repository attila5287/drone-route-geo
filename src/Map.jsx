import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import "bootswatch/dist/slate/bootstrap.min.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { testpoly } from "./testdata";
import { blankpoly } from "./blankpoly";
import geometricRoute from "./logic/GeometricRoute";
import InputPanel from "./components/InputPanel";

const Map = ({ token }) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const drawRef = useRef(null);
  const [roundedArea, setRoundedArea] = useState();
  const [baseHeight, setBaseHeight] = useState(0);
  const [topHeight, setTopHeight] = useState(20);
  const [stepCount, setStepCount] = useState(4);
  const [toleranceWidth, setToleranceWidth] = useState(6);
  const [lightPreset, setLightPreset] = useState("dusk");
  const [stylePreset, setStylePreset] = useState("standard");
  const [styleLoaded, setStyleLoaded] = useState(false);
  // Helper for user input
  const fetchUserInput = () => ({
    inBaseHi: baseHeight * 1,
    inTopHi: topHeight * 1,
    inStepCount: stepCount * 1,
    inToleranceWidth: toleranceWidth * 1,
  });
  useEffect(() => {
    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/" + stylePreset,
      // center: [-104.98897, 39.73955], // civic
      center: [27.17684, 38.454461], // bornova
      zoom: 15.5,
      pitch: 75,
      bearing: -55,
      attributionControl: false,
      //dusk
      config: {
        basemap: {
          lightPreset: lightPreset,
        },
      },
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
        mapRef.current.getSource("user-extrude-src").setData(data);
        mapRef.current
          .getSource("line-src")
          .setData(geometricRoute(data, fetchUserInput()));
        if (mapRef.current.getLayer("user-extrude-layer")) {
          mapRef.current.setPaintProperty(
            "user-extrude-layer",
            "fill-extrusion-base",
            fetchUserInput().inBaseHi
          );
          mapRef.current.setPaintProperty(
            "user-extrude-layer",
            "fill-extrusion-height",
            fetchUserInput().inTopHi
          );
        }
        mapRef.current.triggerRepaint();
      } else {
        setRoundedArea();
        if (e.type !== "draw.delete") alert("Click the map to draw a polygon.");
      }
    }

    mapRef.current.on("style.load", () => {
      console.log("map style loaded: ", styleLoaded);
      setStyleLoaded(true);
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
          "fill-extrusion-height": 200,
          "fill-extrusion-base": 40,
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
        data: geometricRoute(testpoly, {
          inBaseHi: 40,
          inTopHi: 200,
          inStepCount: 10,
          inToleranceWidth: 12,
        }),
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
        fetchUserInput().inBaseHi
      );
      mapRef.current.setPaintProperty(
        "user-extrude-layer",
        "fill-extrusion-height",
        fetchUserInput().inTopHi
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
      console.log("drawData", drawData);
      lineSource.setData(geometricRoute(drawData, fetchUserInput()));
      if (userExtrudeSource) {
        userExtrudeSource.setData(drawData);
      }
      mapRef.current.triggerRepaint();
    } else {
      // TEST RUN WITH NO DRAW DATA
      console.log("test run with no draw data");
      // lineSource.setData(
      //   geometricRoute(testpoly, {
      //     inBaseHi: baseHeight,
      //     inTopHi: topHeight,
      //     inStepCount: stepCount,
      //     inToleranceWidth: toleranceWidth,
      //   })
      // );
      // if (userExtrudeSource) {
      //   userExtrudeSource.setData(testpoly);
      // }
      // mapRef.current.triggerRepaint();
    }
  }, [baseHeight, topHeight, stepCount, toleranceWidth]);

  useEffect(() => {
    if (!styleLoaded) return;
    mapRef.current.setConfigProperty("basemap", "lightPreset", lightPreset);
    mapRef.current.setConfigProperty("basemap", "lightPreset", lightPreset);
  }, [lightPreset]);
  useEffect(() => {
    if (!styleLoaded) return;
    mapRef.current.setStyle("mapbox://styles/mapbox/" + stylePreset);
  }, [stylePreset]);

  // Calculation helpers
  function roundByN(floatNum, numDecimals) {
    const tenExp = 10 ** numDecimals;
    return Math.round(floatNum * tenExp) / tenExp;
  }

  function getLoopLength(poly) {
    return roundByN(
      geometricRoute(poly, fetchUserInput())
        .features.map((d) => d.properties.LOOPLENGTH)
        .reduce((acc, val) => acc + val, 0),
      0
    );
  }
  function getAreaDraw(poly) {
    return roundByN(turf.area(poly), 0);
  }
  function getPerimeter(poly) {
    return roundByN(turf.length(poly, { units: "meters" }), 0);
  }
  function getRouteDistance(poly) {
    return roundByN(
      geometricRoute(poly, fetchUserInput())
        .features.map((d) => d.properties.LOOPLENGTH + d.properties.STEPHEIGHT)
        .reduce((acc, val) => acc + val, 0),
      0
    );
  }
  const lightMapping = {
    dusk: "adjust",
    light: "sun",
  };
  const styleMapping = {
    standard: "map",
    "standard-satellite": "satellite",
  };
  return (
    <>
      <nav className="navbar navbar-expand navbar-dark-dark py-0">
        <div className="container-fluid py-0">
          <a className="navbar-brand py-0" href="https://www.droneqube.com">
            <img
              src="https://droneqube.com/wp-content/uploads/2025/01/DRONEQUBE_LOGO.svg"
              alt="logo"
              style={{ width: 120, height: 30 }}
            />
            <i className="fas fa-building mx-2 text-lg text-secondary"></i>
            <span className="text-secondary mx-2 mt-2 text-monospace">
              Geometric Route
            </span>
          </a>
          <ul className="navbar-nav">
            <li className="nav-item">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  console.log("style button clicked");
                  console.log("stylePreset: ", stylePreset);
                  const newStylePreset =
                    stylePreset === "standard"
                      ? "standard-satellite"
                      : "standard";
                  console.log("newStylePreset: ", newStylePreset);
                  setStylePreset(newStylePreset);
                  mapRef.current.setStyle(
                    "mapbox://styles/mapbox/" + newStylePreset
                  );
                  setLightPreset("light");
                }}
              >
                <i className={`fas fa-${styleMapping[stylePreset]}`}></i>
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  console.log("light button clicked");
                  console.log("lightPreset: ", lightPreset);
                  const newLightPreset =
                    lightPreset === "dusk" ? "light" : "dusk";
                  setLightPreset(newLightPreset);
                  mapRef.current.setConfigProperty(
                    "basemap",
                    "lightPreset",
                    newLightPreset
                  );
                }}
              >
                <i className={`fas fa-${lightMapping[lightPreset]}`}></i>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div
        ref={mapContainerRef}
        id="map"
        style={{ height: "calc(100vh - 60px)" }}
      ></div>
      <div className="calculation-box">
        {!roundedArea && (
          <p className="bg-dark p-2 round-lg text-light paragraph-style">
            <i className="fas fa-info-circle mx-2 text-lg"></i>
            Please draw a polygon.
          </p>
        )}
        <div id="calculated-area">
          {roundedArea && (
            <ul className="list-group list-group-horizontal text-monospace">
              <li className="list-group-item">
                <i className="fas fa-pull-left fa-square text-info"></i>
                {getAreaDraw(drawRef.current.getAll())} sq-mt
              </li>
              <li className="list-group-item">
                <i className="fas fa-pull-left fa-ruler-horizontal text-info"></i>
                {getPerimeter(drawRef.current.getAll())} mt
              </li>
              <li className="list-group-item">
                <i className="fas fa-pull-left fa-circle-notch text-success"></i>
                {getLoopLength(drawRef.current.getAll())} mt
              </li>
              <li className="list-group-item">
                <i className="fas fa-pull-left fa-route text-success"></i>
                {getRouteDistance(drawRef.current.getAll())} m
              </li>
            </ul>
          )}
        </div>
      </div>
      {roundedArea && (
        <InputPanel
          baseHeight={baseHeight}
          setBaseHeight={setBaseHeight}
          topHeight={topHeight}
          setTopHeight={setTopHeight}
          stepCount={stepCount}
          setStepCount={setStepCount}
          toleranceWidth={toleranceWidth}
          setToleranceWidth={setToleranceWidth}
        />
      )}
    </>
  );
};

export default Map;

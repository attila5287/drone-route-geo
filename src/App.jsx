import { useState } from "react";
import "./App.css";
import Map from "./Map";
import "./assets/style.css";
import InputPanel from "./components/InputPanel";
const MAPBOX_TOKEN = "pk.eyJ1IjoiYXR0aWxhNTIiLCJhIjoiY2thOTE3N3l0MDZmczJxcjl6dzZoNDJsbiJ9.bzXjw1xzQcsIhjB_YoAuEw";

function App() {
  const [baseHeight, setBaseHeight] = useState(0);
  const [topHeight, setTopHeight] = useState(20);
  const [stepCount, setStepCount] = useState(4);
  const [toleranceWidth, setToleranceWidth] = useState( 6 );
  
  return (
    <>
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
      <Map
        token={MAPBOX_TOKEN}
        baseHeight={baseHeight}
        topHeight={topHeight}
        stepCount={stepCount}
        toleranceWidth={toleranceWidth}
      />
    </>
  );
}

export default App

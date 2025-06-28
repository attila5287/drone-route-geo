import './App.css'
import Map from './Map'
import 'bootswatch/dist/slate/bootstrap.min.css'
const MAPBOX_TOKEN = "pk.eyJ1IjoiYXR0aWxhNTIiLCJhIjoiY2thOTE3N3l0MDZmczJxcjl6dzZoNDJsbiJ9.bzXjw1xzQcsIhjB_YoAuEw";

function App() {

  return (
    <>
      <Map token={MAPBOX_TOKEN}/>
    </>
  )
}

export default App

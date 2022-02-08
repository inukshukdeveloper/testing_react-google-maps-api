import React, { useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  LoadScript,
  GoogleMap,
  Polygon,
  Rectangle,
  LatLngBounds
} from "@react-google-maps/api";

import "./styles.css";

// This example presents a way to handle editing a Polygon
// The objective is to get the new path on every editing event :
// - on dragging the whole Polygon
// - on moving one of the existing points (vertex)
// - on adding a new point by dragging an edge point (midway between two vertices)

// We achieve it by defining refs for the google maps API Polygon instances and listeners with `useRef`
// Then we bind those refs to the currents instances with the help of `onLoad`
// Then we get the new path value with the `onEdit` `useCallback` and pass it to `setPath`
// Finally we clean up the refs with `onUnmount`

function App() {
  // Store Polygon path in state
  const [path, setPath] = useState([
    { lat: 52.52549080781086, lng: 13.398118538856465 },
    { lat: 52.48578559055679, lng: 13.36653284549709 },
    { lat: 52.48871246221608, lng: 13.44618372440334 }
  ]);

  const center = {
    lat: 38.685,
    lng: -115.234
  };

  const ne = {
    lat: 38.685,
    lng: -115.234
  };

  const sw = {
    lat: 33.671,
    lng: -118.251
  };

  const bnds = { sw, ne };
  // LatLngBoundsLiteral
  const bounds2 = {
    north: 38.685,
    south: 33.671,
    east: -115.234,
    west: -118.251
  };

  // Store Rectangle path in state.  UseState returns two values: current state and
  // update function.  It takes in the initial state.  So, bounds needs the
  // two corners of the box: NE and SW
  // const [bounds, setBounds] = useState([
  //   // { lat: 33.671, lng: -118.251 }, // sw
  //   // { lat: 38.685, lng: -115.234 }  // ne
  //   { north: 38.685, south: 33.671, east: -115.234, west: -118.251 }
  // ]);

  // Define refs for Polygon instance and listeners
  const polygonRef = useRef(null);
  const rectangleRef = useRef(null);
  const listenersRef = useRef([]);
  const rectListenersRef = useRef([]);

  // Call setPath with new edited path
  const onEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef.current
        .getPath()
        .getArray()
        .map((latLng) => {
          console.log("lat long is", latLng.lat(), latLng.lng());
          return { lat: latLng.lat(), lng: latLng.lng() };
        });
      setPath(nextPath);
    }
  }, [setPath]);

  // Call setBounds with new edited rectangle bounds
  const onRectEdit = useCallback(() => {
    console.log("editing rectangle");
    // if (rectangleRef.current) {
    // const nextBounds = rectangleRef.current
    // .getBounds()  // returns LatLngBounds
    //   .getArray()
    //   .map(latLng => {
    //     console.log("lat long is for rect", latLng.lat(), latLng.lng())
    //     return { lat: latLng.lat(), lng: latLng.lng() };
    // });
    // setBounds(nextBounds);
    // }
  }, []);

  // Bind refs to current Polygon and listeners
  const onLoad = useCallback(
    (polygon) => {
      console.log("loading polygon");
      polygonRef.current = polygon;
      const path = polygon.getPath();
      listenersRef.current.push(
        path.addListener("set_at", onEdit),
        path.addListener("insert_at", onEdit),
        path.addListener("remove_at", onEdit)
      );
    },
    [onEdit]
  );

  // Bind refs to current Polygon and listeners
  const onRectLoad = useCallback(
    (rectangle) => {
      rectangleRef.current = rectangle;
      const bounds = rectangle.getBounds();
      console.log("bounds on rect load", bounds);
      console.log(
        "bound components on rect load",
        bounds.Ab.g,
        bounds.Ab.h,
        bounds.Ra.g,
        bounds.Ra.h
      );
      rectListenersRef.current.push(
        rectangle.addListener("bounds_changed", onRectEdit)
        // bounds.addListener("insert_at", onRectEdit)
        // bounds.addListener("remove_at", onRectEdit)
      );
    },
    [onRectEdit]
  );

  // const onRectLoad = rectangle => {
  //   console.log('rectangle: ', rectangle)
  // }
  // Clean up refs
  const onUnmount = useCallback(() => {
    listenersRef.current.forEach((lis) => lis.remove());
    rectListenersRef.current.forEach((lis) => lis.remove());
    polygonRef.current = null;
    rectangleRef.current = null;
  }, []);

  console.log("The path state is", path);

  return (
    <div className="App">
      <LoadScript
        id="script-loader"
        googleMapsApiKey=""
        language="en"
        region="us"
      >
        <GoogleMap
          mapContainerClassName="App-map"
          // center={{ lat: 52.52047739093263, lng: 13.36653284549709 }}
          center={center}
          zoom={12}
          version="weekly"
          on
        >
          <Polygon
            // Make the Polygon editable / draggable
            editable
            draggable
            path={path}
            // Event used when manipulating and adding points
            onMouseUp={onEdit}
            // Event used when dragging the whole Polygon
            onDragEnd={onEdit}
            onLoad={onLoad}
            onUnmount={onUnmount}
          />
          <Rectangle
            // Make the Rectangle editable / draggeable
            editable
            draggable
            bounds={bounds2}
            onDragEnd={onRectEdit}
            onMouseUp={onRectEdit}
            onLoad={onRectLoad}
            onBoundsChanged={onRectEdit}
            // onUnmount={onUnmount}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

"use client";

import L, { Icon } from 'leaflet'

// START: Preserve spaces to avoid auto-sorting
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
// END: Preserve spaces to avoid auto-sorting


// Map Range  [-0.12, 0.53]

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";



export default function Map() {
  return (
    <MapContainer
      crs={L.CRS.Simple}
      center={[-0.0765, 0.3]}
      maxBounds={[[0, 0], [-0.12, 0.53]]}
      maxBoundsViscosity={0.68}
      zoom={13}
      minZoom={13}
      maxZoom={15}
      scrollWheelZoom={true}
      style={{ height: "100vh", background: "rgb(8,23,37)" }}
    >
      <TileLayer url="https://ninesolsmap.s3.amazonaws.com/map/{z}/{x}/{y}.png" />
    </MapContainer>
  );
}

"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, LayersControl, LayerGroup } from "react-leaflet";
import * as i from './Icons';

// START: Preserve spaces to avoid auto-sorting
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
// END: Preserve spaces to avoid auto-sorting


// Map Range  [-0.12, 0.53]

//Type definitions
interface DataItem {
  id: string;
  created_at: string;
  x: number;
  y: number;
  type: string;
  description: string;
}
interface MarkersGroupProps {
  type: string;
  markers: DataItem[];
}


const eventHandlers = {
  // Add your event handlers here
};

const markerRef = React.createRef<L.Marker<any>>();

function DraggableMarker() {
  const markerRef = useRef(null)
  const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) console.log(marker);
      },
    }), [],)
  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[-0.0765, 0.3]}
      ref={markerRef}>
      <Popup minWidth={90}><span>{`Debugging marker.`}</span></Popup>
    </Marker>
  )
}

const fetchMarkersData = async (): Promise<DataItem[]> => {
  const response = await fetch('/api/markers');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: DataItem[] = await response.json();
  return data;
};

const MarkersGroup: React.FC<{ markers: DataItem[] }> = ({ markers }) => (
  <>
    {markers.map(marker => (
      <Marker
        key={marker.id}
        icon={i[marker.type]}
        eventHandlers={eventHandlers}
        position={[marker.x, marker.y]}
        ref={markerRef}
      >
        <Popup minWidth={90}>
          <span>{marker.description}</span>
        </Popup>
      </Marker>
    ))}
  </>
);


export default function Map() {
  const [data, setData] = useState<Record<string, DataItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const markersData = await fetchMarkersData();
        const groupedData = markersData.reduce<Record<string, DataItem[]>>((acc, item) => {
          if (!acc[item.type]) {
            acc[item.type] = [];
          }
          acc[item.type].push(item);
          return acc;
        }, {});
        console.log('Grouped Data:', groupedData);
        setData(groupedData);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <MapContainer
      crs={L.CRS.Simple}
      center={[-0, 0.3]}
      maxBounds={[[0.05, -0.05], [-0.17, 0.59]]}
      maxBoundsViscosity={0.68}
      zoom={13}
      minZoom={12}
      maxZoom={15}
      scrollWheelZoom={true}
      attributionControl={false}
      style={{ height: "100vh", background: "rgb(8,23,37)" }}
    >
      <TileLayer url="https://ninesolsmap.s3.amazonaws.com/map/{z}/{x}/{y}.png" />


      <LayersControl position="topright">
        {Object.keys(data).map(type => (
          <LayersControl.Overlay key={type} checked name={type}>
            <MarkersGroup markers={data[type]} />
          </LayersControl.Overlay>
        ))}
      </LayersControl>

      <DraggableMarker />

    </MapContainer>
  );
}

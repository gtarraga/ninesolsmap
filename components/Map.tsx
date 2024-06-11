"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, LayersControl, LayerGroup } from "react-leaflet";
import * as Icons from './Icons';

// START: Preserve spaces to avoid auto-sorting
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
// END: Preserve spaces to avoid auto-sorting


//Type definitions
interface DataItem {
  id: string;
  created_at: string;
  x: number;
  y: number;
  type: string;
  description: string;
}
type IconKeys = keyof typeof Icons;

// Reference for markers
const markerRef = React.createRef<L.Marker<any>>();

const getIcon = (type: string): typeof Icons[IconKeys] | undefined => {
  const iconKey = type.toLowerCase() as IconKeys;
  return Icons[iconKey];
};


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
      icon={getIcon('bonfire')}
      eventHandlers={eventHandlers}
      position={[-0.0972900390625, 0.443359375]}
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
  <LayerGroup>
    {markers.map(marker => (
      <Marker
        key={marker.id}
        icon={getIcon(marker.type.toLowerCase())}
        position={[marker.x, marker.y]}
        ref={markerRef}
      >
        <Popup minWidth={90}>
          <span>{marker.id}</span>
        </Popup>
      </Marker>
    ))}
  </LayerGroup>
);

const MapComponent: React.FC = () => {
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
      center={[-0.0972900390625, 0.443359375]}
      maxBounds={[[0.05, -0.05], [-0.317529296875, 1]]}
      maxBoundsViscosity={0.68}
      zoom={13}
      minZoom={13}
      maxZoom={15}
      scrollWheelZoom={true}
      attributionControl={false}
      style={{ height: "100vh", background: "rgb(8,23,37)" }}
    >
      <TileLayer url="https://ninesolsmap.s3.amazonaws.com/mapBig/{z}/{x}/{y}.png" />


      <LayersControl>
        {Object.keys(data).map(type => (
            <LayersControl.Overlay key={type} checked name={
              `
                <div>
                  <img src='/icons/${type}.png' width=24 />
                  <Text style={{ textTransform: 'capitalize' }}>${type}</Text>
                </div>
              `
            }>
              <MarkersGroup markers={data[type]} />
            </LayersControl.Overlay>
          ))}
      </LayersControl>

      <DraggableMarker/>
    </MapContainer>
  );
};

export default MapComponent;

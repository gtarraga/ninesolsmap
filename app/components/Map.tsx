"use client"

import React, { useState, useEffect, useCallback } from 'react';
import L, { LeafletEvent } from 'leaflet';
import { MapContainer, Marker, TileLayer, LayersControl, LayerGroup, useMap } from 'react-leaflet';
import { MarkerPopup } from './MarkerPopup';
import { getName } from '@/app/utils/getNames';
import { getIcon } from '@/app/utils/getIcons';
import { LoadingScreen } from './LoadingScreen';

// START: Preserve spaces to avoid auto-sorting
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
// END: Preserve spaces to avoid auto-sorting

export interface DataItem {
  id: string;
  created_at: string;
  x: number;
  y: number;
  type: string;
  description: string;
}


const fetchMarkersData = async (): Promise<DataItem[]> => {
  const response = await fetch('/api/markers');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const MarkersGroup: React.FC<{ markers: DataItem[] }> = ({ markers }) => (
  <LayerGroup>
    {markers.map(marker => (
      <Marker
        key={marker.id}
        icon={getIcon(marker.type.toLowerCase())}
        position={[marker.x, marker.y]}
      >
        <MarkerPopup marker={marker} />
      </Marker>
    ))}
  </LayerGroup>
);

interface MapComponentProps {
  markerId?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ markerId }) => {
  const [data, setData] = useState<Record<string, DataItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllMarkers, setShowAllMarkers] = useState(!markerId);

  const markerInit = useCallback((ref: L.Marker) => {
    if (ref) {
      // If there's no timeout, the popup wont appear in production
      setTimeout(() => {
        ref.openPopup()
      }, 100);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const markersData = await fetchMarkersData();
        const groupedData = markersData.reduce<Record<string, DataItem[]>>((acc, item) => {
          if (!acc[item.type]) acc[item.type] = [];
          acc[item.type].push(item);
          return acc;
        }, {});
        setData(groupedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = () => setShowAllMarkers(true);

  const MapClickHandler = () => {
    const map = useMap();
    useEffect(() => {
      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
      };
    }, [map]);
    return null;
  };

  if (loading) return <LoadingScreen/>;
  if (error) return <div>Error: {error}</div>;

  const initialMarker = markerId ? Object.values(data).flat().find(m => m.id === markerId) : null;

  // Sorting the markers and replacing the name with the formatted name
  const sortedData = Object.keys(data)
    .sort((a, b) => getName(a).localeCompare(getName(b)))
    .map(type => ({
      name: getName(type),
      type,
      markers: data[type],
    }));

  return (
    <MapContainer
      id="map"
      crs={L.CRS.Simple}
      center={[-0.0972900390625, 0.443359375]}
      maxBounds={[[0.05, -0.05], [-0.317529296875, 1]]}
      maxBoundsViscosity={0.68}
      zoom={13}
      minZoom={13}
      maxZoom={15}
      scrollWheelZoom={true}
      attributionControl={false}
      style={{ height: '100vh', background: 'rgb(8,23,37)' }}
      // @ts-ignore: I cant figure out a way to do this wihtout changing the type defintion
      whenReady={(event: LeafletEvent) => {
        if (markerId && initialMarker) {
          event.target.setView([initialMarker.x, initialMarker.y], 15);
        }
      }}
    >
      <TileLayer url="https://ninesolsmap.s3.amazonaws.com/mapBig/{z}/{x}/{y}.png" />
      {showAllMarkers ? (
        <LayersControl>
          {sortedData.map(({ name, type, markers }) => (
            <LayersControl.Overlay key={type} checked name={
              `
                <img src='/icons/${type.toLowerCase()}.png' width=24 />
                <Text class="pl-1" style={{ textTransform: 'capitalize' }}>${name}</Text>
              `
            }>
              <MarkersGroup markers={markers} />
            </LayersControl.Overlay>
          ))}
        </LayersControl>
      ) : (
        initialMarker && (
          <Marker
            icon={getIcon(initialMarker.type.toLowerCase())}
            position={[initialMarker.x, initialMarker.y]}
            ref={markerInit}
          >
            <MarkerPopup marker={initialMarker} />
          </Marker>
        )
      )}
      
      <MapClickHandler />
    </MapContainer>
  );
};

export default MapComponent;

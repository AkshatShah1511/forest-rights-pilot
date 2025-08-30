import { useEffect, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/lib/api';
import { useAppStore } from '@/store/appStore';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapContent() {
  const { mapState, setSelectedFeature } = useAppStore();
  const map = useMap();

  const { data: ifrData } = useQuery({
    queryKey: ['ifr-data'],
    queryFn: api.fetchIFRData,
    enabled: mapState.selectedLayers.includes('ifr')
  });

  const { data: crData } = useQuery({
    queryKey: ['cr-data'],
    queryFn: api.fetchCRData,
    enabled: mapState.selectedLayers.includes('cr')
  });

  const { data: cfrData } = useQuery({
    queryKey: ['cfr-data'],
    queryFn: api.fetchCFRData,
    enabled: mapState.selectedLayers.includes('cfr')
  });

  const { data: assetsData } = useQuery({
    queryKey: ['assets-data'],
    queryFn: api.fetchAssets,
    enabled: mapState.selectedLayers.includes('assets')
  });

  useEffect(() => {
    map.setView(mapState.mapCenter, mapState.mapZoom);
  }, [map, mapState.mapCenter, mapState.mapZoom]);

  const handleFeatureClick = (feature: any, latlng: any) => {
    setSelectedFeature({
      ...feature,
      latlng,
      layerType: feature.properties.type || 'unknown'
    });
  };

  const getLayerStyle = (layerType: string) => {
    const styles = {
      ifr: { color: 'hsl(var(--ifr-color))', fillColor: 'hsl(var(--ifr-color))', fillOpacity: 0.3 },
      cr: { color: 'hsl(var(--cr-color))', fillColor: 'hsl(var(--cr-color))', fillOpacity: 0.3 },
      cfr: { color: 'hsl(var(--cfr-color))', fillColor: 'hsl(var(--cfr-color))', fillOpacity: 0.3 },
      assets: { color: 'hsl(var(--info))', fillColor: 'hsl(var(--info))', fillOpacity: 0.6 }
    };
    return styles[layerType as keyof typeof styles] || styles.assets;
  };

  return (
    <>
      {/* Base tile layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* IFR Layer */}
      {mapState.selectedLayers.includes('ifr') && ifrData && (
        <GeoJSON
          data={ifrData}
          style={getLayerStyle('ifr')}
          onEachFeature={(feature, layer) => {
            layer.on('click', (e) => {
              handleFeatureClick(feature, e.latlng);
            });
            layer.bindTooltip(`IFR: ${feature.properties.pattaId}`);
          }}
        />
      )}

      {/* CR Layer */}
      {mapState.selectedLayers.includes('cr') && crData && (
        <GeoJSON
          data={crData}
          style={getLayerStyle('cr')}
          onEachFeature={(feature, layer) => {
            layer.on('click', (e) => {
              handleFeatureClick(feature, e.latlng);
            });
            layer.bindTooltip(`CR: ${feature.properties.pattaId}`);
          }}
        />
      )}

      {/* CFR Layer */}
      {mapState.selectedLayers.includes('cfr') && cfrData && (
        <GeoJSON
          data={cfrData}
          style={getLayerStyle('cfr')}
          onEachFeature={(feature, layer) => {
            layer.on('click', (e) => {
              handleFeatureClick(feature, e.latlng);
            });
            layer.bindTooltip(`CFR: ${feature.properties.pattaId}`);
          }}
        />
      )}

      {/* Assets Layer */}
      {mapState.selectedLayers.includes('assets') && assetsData && (
        <GeoJSON
          data={assetsData}
          style={getLayerStyle('assets')}
          pointToLayer={(feature, latlng) => {
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background: hsl(var(--info)); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(feature, layer) => {
            layer.on('click', (e) => {
              handleFeatureClick(feature, e.latlng);
            });
            layer.bindTooltip(`${feature.properties.assetType}: ${feature.properties.name}`);
          }}
        />
      )}
    </>
  );
}

export function MapContainer() {
  const { mapState } = useAppStore();

  return (
    <div className="w-full h-full">
      <LeafletMapContainer
        center={mapState.mapCenter}
        zoom={mapState.mapZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapContent />
      </LeafletMapContainer>
    </div>
  );
}
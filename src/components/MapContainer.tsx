import { MapContainer as LeafletMapContainer, TileLayer, GeoJSON } from 'react-leaflet';
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

export function MapContainer() {
  const { mapState, setSelectedFeature } = useAppStore();

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

  const handleFeatureClick = (feature: any, latlng: any) => {
    setSelectedFeature({
      ...feature,
      latlng,
      layerType: feature.properties.type || 'unknown'
    });
  };

  const handleMapClick = () => {
    // Open the external FRA Atlas website when the map is clicked
    window.open('https://forest-rights-act-fr-1yxt.bolt.host/', '_blank');
  };

  const getLayerStyle = (layerType: string) => {
    const styles = {
      ifr: { color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.3 },
      cr: { color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.3 },
      cfr: { color: '#ca8a04', fillColor: '#ca8a04', fillOpacity: 0.3 },
      assets: { color: '#0891b2', fillColor: '#0891b2', fillOpacity: 0.6 }
    };
    return styles[layerType as keyof typeof styles] || styles.assets;
  };

  return (
    <div className="w-full h-full relative">
      <LeafletMapContainer
        center={mapState.mapCenter}
        zoom={mapState.mapZoom}
        className="w-full h-full"
        zoomControl={false}
        onClick={handleMapClick}
      >
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
            pointToLayer={(feature, latlng) => {
              const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background: #0891b2; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
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
      </LeafletMapContainer>

      {/* Clickable overlay with instructions */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg max-w-xs">
        <p className="text-sm">
          💡 <strong>Tip:</strong> Click anywhere on the map to open the official FRA Atlas website
        </p>
      </div>
    </div>
  );
}
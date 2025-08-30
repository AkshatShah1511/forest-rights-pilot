import { create } from 'zustand';

export type UserRole = 'Admin' | 'Dept Officer' | 'NGO';

interface MapState {
  selectedLayers: string[];
  selectedFeature: any;
  mapCenter: [number, number];
  mapZoom: number;
  showInfoDrawer: boolean;
}

interface AppState {
  // User state
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // Map state
  mapState: MapState;
  updateMapState: (updates: Partial<MapState>) => void;
  setSelectedFeature: (feature: any) => void;
  toggleLayer: (layerId: string) => void;
  setShowInfoDrawer: (show: boolean) => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Data filters
  selectedStates: string[];
  selectedDistricts: string[];
  selectedVillages: string[];
  setSelectedStates: (states: string[]) => void;
  setSelectedDistricts: (districts: string[]) => void;
  setSelectedVillages: (villages: string[]) => void;
  
  // DSS state
  dssFilters: {
    lowWater: boolean;
    hasAgriculture: boolean;
    forestDegradation: boolean;
    highPoverty: boolean;
  };
  updateDSSFilters: (filters: Partial<AppState['dssFilters']>) => void;
  
  // Admin state
  currentDataset: 'Maharashtra-Demo' | 'India-Minimal';
  setCurrentDataset: (dataset: AppState['currentDataset']) => void;
  
  // Plans (localStorage backed)
  plannedRecommendations: string[];
  addToPlans: (recommendationId: string) => void;
  removeFromPlans: (recommendationId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // User state
  userRole: 'Admin',
  setUserRole: (role) => set({ userRole: role }),
  
  // Map state
  mapState: {
    selectedLayers: ['villages', 'ifr'],
    selectedFeature: null,
    mapCenter: [78.9629, 20.5937], // Center of India
    mapZoom: 5,
    showInfoDrawer: false,
  },
  
  updateMapState: (updates) => set((state) => ({
    mapState: { ...state.mapState, ...updates }
  })),
  
  setSelectedFeature: (feature) => set((state) => ({
    mapState: { 
      ...state.mapState, 
      selectedFeature: feature,
      showInfoDrawer: !!feature
    }
  })),
  
  toggleLayer: (layerId) => set((state) => {
    const layers = state.mapState.selectedLayers;
    const newLayers = layers.includes(layerId)
      ? layers.filter(id => id !== layerId)
      : [...layers, layerId];
    
    return {
      mapState: { ...state.mapState, selectedLayers: newLayers }
    };
  }),
  
  setShowInfoDrawer: (show) => set((state) => ({
    mapState: { ...state.mapState, showInfoDrawer: show }
  })),
  
  // UI state
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Data filters
  selectedStates: [],
  selectedDistricts: [],
  selectedVillages: [],
  setSelectedStates: (states) => set({ selectedStates: states }),
  setSelectedDistricts: (districts) => set({ selectedDistricts: districts }),
  setSelectedVillages: (villages) => set({ selectedVillages: villages }),
  
  // DSS state
  dssFilters: {
    lowWater: false,
    hasAgriculture: false,
    forestDegradation: false,
    highPoverty: false,
  },
  updateDSSFilters: (filters) => set((state) => ({
    dssFilters: { ...state.dssFilters, ...filters }
  })),
  
  // Admin state
  currentDataset: 'Maharashtra-Demo',
  setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
  
  // Plans
  plannedRecommendations: JSON.parse(localStorage.getItem('fra-planned-recommendations') || '[]'),
  addToPlans: (recommendationId) => {
    const current = get().plannedRecommendations;
    if (!current.includes(recommendationId)) {
      const updated = [...current, recommendationId];
      localStorage.setItem('fra-planned-recommendations', JSON.stringify(updated));
      set({ plannedRecommendations: updated });
    }
  },
  removeFromPlans: (recommendationId) => {
    const updated = get().plannedRecommendations.filter(id => id !== recommendationId);
    localStorage.setItem('fra-planned-recommendations', JSON.stringify(updated));
    set({ plannedRecommendations: updated });
  },
}));
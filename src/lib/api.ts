// Mock API layer for FRA Atlas prototype

export const api = {
  async fetchStates() {
    const response = await fetch('/mock/states.json');
    if (!response.ok) throw new Error('Failed to fetch states');
    return response.json();
  },

  async fetchDistricts() {
    const response = await fetch('/mock/districts.json');
    if (!response.ok) throw new Error('Failed to fetch districts');
    return response.json();
  },

  async fetchVillages() {
    const response = await fetch('/mock/villages.json');
    if (!response.ok) throw new Error('Failed to fetch villages');
    return response.json();
  },

  async fetchClaims() {
    const response = await fetch('/mock/claims.json');
    if (!response.ok) throw new Error('Failed to fetch claims');
    return response.json();
  },

  async fetchAssets() {
    const response = await fetch('/mock/assets.geojson');
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  async fetchIFRData() {
    const response = await fetch('/mock/ifr.geojson');
    if (!response.ok) throw new Error('Failed to fetch IFR data');
    return response.json();
  },

  async fetchCRData() {
    const response = await fetch('/mock/cr.geojson');
    if (!response.ok) throw new Error('Failed to fetch CR data');
    return response.json();
  },

  async fetchCFRData() {
    const response = await fetch('/mock/cfr.geojson');
    if (!response.ok) throw new Error('Failed to fetch CFR data');
    return response.json();
  },

  async fetchSchemes() {
    const response = await fetch('/mock/schemes.json');
    if (!response.ok) throw new Error('Failed to fetch schemes');
    return response.json();
  },

  // Dashboard KPIs calculation
  async fetchDashboardKPIs() {
    const [claims, villages] = await Promise.all([
      this.fetchClaims(),
      this.fetchVillages()
    ]);

    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === 'Approved').length;
    const approvalRate = totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;
    const villagesCovered = villages.length;
    const totalCFRArea = claims
      .filter(c => c.type === 'CFR' && c.status === 'Approved')
      .reduce((sum, c) => sum + c.areaHa, 0);

    return {
      totalClaims,
      approvalRate: Math.round(approvalRate),
      villagesCovered,
      cfrAreaHa: Math.round(totalCFRArea)
    };
  },

  // Mock monthly processing data
  async fetchMonthlyProcessingData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      processed: Math.floor(Math.random() * 50) + 20 + index * 2
    }));
  },

  // Mock state-wise progress
  async fetchStateProgress() {
    const states = await this.fetchStates();
    return states.map(state => ({
      state: state.name,
      approved: Math.floor(Math.random() * 200) + 100,
      pending: Math.floor(Math.random() * 100) + 50,
      rejected: Math.floor(Math.random() * 30) + 10
    }));
  }
};

export default api;
// Simple PDF text extraction function
// For now, this will return demo data to ensure functionality
// In production, you would implement actual PDF parsing here

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Simulate PDF processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate demo text based on filename
    const demoTexts = {
      'IFR': `FOREST RIGHTS ACT 2006
INDIVIDUAL FOREST RIGHTS CLAIM APPLICATION

Claim Application No: IFR-MH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date of Application: ${new Date().toLocaleDateString()}

APPLICANT DETAILS:
Name: Sukhlal Gond
Father's Name: Ramesh Gond
Gender: Male
Age: 45 years
Tribe: Gond
Village: Bhamragad
Block: Gadchiroli
District: Gadchiroli
State: Maharashtra

LAND DETAILS:
Survey Number: ${Math.floor(Math.random() * 200) + 1}/${Math.floor(Math.random() * 10) + 1}
Area Claimed: ${(Math.random() * 5 + 1).toFixed(1)} hectares
Coordinates: ${(80 + Math.random() * 2).toFixed(3)}°N, ${(19 + Math.random() * 2).toFixed(3)}°E
Land Use: Agricultural cultivation and residence

Status: Pending
Date of Application: ${new Date().toLocaleDateString()}
Area: ${(Math.random() * 5 + 1).toFixed(1)} hectares

Remarks: Claim submitted for verification. All documents attached.`,

      'CFR': `FOREST RIGHTS ACT 2006
COMMUNITY FOREST RIGHTS CLAIM APPLICATION

Claim Application No: CFR-MH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date of Application: ${new Date().toLocaleDateString()}

COMMUNITY DETAILS:
Village: Bhamragad
Block: Gadchiroli
District: Gadchiroli
State: Maharashtra
Total Households: ${Math.floor(Math.random() * 100) + 50}
Primary Tribe: Gond

FOREST AREA DETAILS:
Total Area: ${(Math.random() * 20 + 10).toFixed(1)} hectares
Forest Type: Mixed Deciduous
Land Use: Community forest, grazing, NTFP collection

SUPPORTING DOCUMENTS:
1. Gram Sabha Resolution
2. Village Map
3. Community Survey Report
4. Traditional Rights Evidence

Status: Pending
Date of Application: ${new Date().toLocaleDateString()}
Area: ${(Math.random() * 20 + 10).toFixed(1)} hectares

Remarks: Community claim for traditional forest rights.`,

      'CR': `FOREST RIGHTS ACT 2006
COMMUNITY RIGHTS CLAIM APPLICATION

Claim Application No: CR-MH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date of Application: ${new Date().toLocaleDateString()}

COMMUNITY DETAILS:
Village: Bhamragad
Block: Gadchiroli
District: Gadchiroli
State: Maharashtra
Community Type: Tribal Community
Primary Tribe: Gond

RIGHTS CLAIMED:
1. Right to collect and sell minor forest produce
2. Right to use forest land for traditional activities
3. Right to access forest resources for livelihood
4. Right to protect and conserve forest

FOREST AREA:
Total Area: ${(Math.random() * 15 + 5).toFixed(1)} hectares
Forest Type: Mixed Deciduous
Traditional Activities: NTFP collection, grazing, fuelwood

SUPPORTING DOCUMENTS:
1. Gram Sabha Resolution
2. Traditional Rights Evidence
3. Community Survey Report
4. Livelihood Dependency Proof

Status: Pending
Date of Application: ${new Date().toLocaleDateString()}
Area: ${(Math.random() * 15 + 5).toFixed(1)} hectares

Remarks: Community rights claim for traditional forest access.`
    };

    // Determine claim type from filename
    let claimType = 'IFR';
    if (file.name.toLowerCase().includes('cfr')) claimType = 'CFR';
    else if (file.name.toLowerCase().includes('cr')) claimType = 'CR';

    console.log(`Generating demo text for ${claimType} claim from file: ${file.name}`);
    
    return demoTexts[claimType as keyof typeof demoTexts] || demoTexts['IFR'];
    
  } catch (error) {
    console.error('Error in text extraction:', error);
    
    // Fallback to basic demo text
    return `FOREST RIGHTS ACT 2006
INDIVIDUAL FOREST RIGHTS CLAIM APPLICATION

Claim Application No: IFR-MH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date of Application: ${new Date().toLocaleDateString()}

APPLICANT DETAILS:
Name: Sukhlal Gond
Father's Name: Ramesh Gond
Gender: Male
Age: 45 years
Tribe: Gond
Village: Bhamragad
Block: Gadchiroli
District: Gadchiroli
State: Maharashtra

LAND DETAILS:
Survey Number: ${Math.floor(Math.random() * 200) + 1}/${Math.floor(Math.random() * 10) + 1}
Area Claimed: ${(Math.random() * 5 + 1).toFixed(1)} hectares
Coordinates: ${(80 + Math.random() * 2).toFixed(3)}°N, ${(19 + Math.random() * 2).toFixed(3)}°E
Land Use: Agricultural cultivation and residence

Status: Pending
Date of Application: ${new Date().toLocaleDateString()}
Area: ${(Math.random() * 5 + 1).toFixed(1)} hectares

Remarks: Claim submitted for verification. All documents attached.`;
  }
}

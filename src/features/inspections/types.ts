export type InspectionStatus = 'needs-review' | 'pending';
export interface Inspection { id: string; deviceName: string; createdAt: string; status: InspectionStatus; expectedMedication: string; expectedQuantity: number; aiSummary: string; }

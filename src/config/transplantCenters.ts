export interface TransplantCenterConfig {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  contactPhone: string;
  contactEmail?: string;
  welcomeMessage?: string;
}

export const transplantCenters: Record<string, TransplantCenterConfig> = {
  'nyu-langone': {
    id: 'nyu-langone',
    name: 'NYU Langone Transplant Institute',
    shortName: 'NYU Langone',
    primaryColor: '#57068C',
    contactPhone: '(212) 263-8134',
    welcomeMessage:
      'Thank you for taking this next step in your kidney transplant journey with NYU Langone.',
  },
};

export function getTransplantCenter(centerId: string): TransplantCenterConfig | null {
  return transplantCenters[centerId] || null;
}

export const defaultCenterId = 'nyu-langone';

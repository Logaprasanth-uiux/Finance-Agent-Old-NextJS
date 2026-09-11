export interface SpecificationComparisonRow {
  id: string;
  category: string; // Group from CSV (visual header only)
  groupNo: number;  // Group No. from CSV (order of category sections)
  itemNo: string;   // Item No. from CSV (RFQ item mapping)
  feature: string;  // Column A: Feature name shown as comparison row
  detailRequirement: string; // Column B: Buyer requirement
  remarks?: string;
  responses: {
    'Prime Assemblies Inc': string;
    'ABC Digital Private Limited': string;
    'Demo Technologies Private Limited': string;
    [vendorName: string]: string;
  };
}

export interface SpecificationCategoryGroup {
  id: string;
  groupNo: number;
  name: string; // Exact Group name from CSV
  description: string;
  rows: SpecificationComparisonRow[];
}

export interface VendorCommercialQuotation {
  vendorId: string;
  vendorName: string;
  quotationNumber: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  taxRate: number; // 0.18
  taxAmount: number;
  totalAmount: number;
  deliveryTimeline: string;
  paymentTerms: string;
  warranty: string;
  vendorRemarks: string;
  logoInitial: string;
  logoColor: string;
  leadTime: string;
  rating: number;
  location: string;
  submittedDate: string;
}

export const mockLaptopCommercialQuotations: Record<string, VendorCommercialQuotation> = {
  'Prime Assemblies Inc': {
    vendorId: 'vnd-pa-01',
    vendorName: 'Prime Assemblies Inc',
    quotationNumber: 'PA-QTN-2026-8801',
    unitPrice: 82500,
    quantity: 20,
    subtotal: 1650000,
    taxRate: 0.18,
    taxAmount: 297000,
    totalAmount: 1947000,
    deliveryTimeline: '5-7 Business Days',
    paymentTerms: 'Net 30 Days',
    warranty: '3 Years On-site Warranty',
    vendorRemarks:
      'Intel Core i7-13700H 13th Gen with NVIDIA GeForce RTX 4060 8GB graphics, 16GB DDR5 RAM, and 3 Years On-site Warranty.',
    logoInitial: 'PA',
    logoColor: '#4F46E5',
    leadTime: '5-7 Business Days',
    rating: 4.9,
    location: 'Bengaluru, Karnataka',
    submittedDate: '28 Aug 2026',
  },
  'ABC Digital Private Limited': {
    vendorId: 'vnd-ad-02',
    vendorName: 'ABC Digital Private Limited',
    quotationNumber: 'ABC-QTN-2026-4412',
    unitPrice: 68000,
    quantity: 20,
    subtotal: 1360000,
    taxRate: 0.18,
    taxAmount: 244800,
    totalAmount: 1604800,
    deliveryTimeline: '7-10 Business Days',
    paymentTerms: 'Net 45 Days',
    warranty: '3 Years On-site Warranty',
    vendorRemarks:
      'Intel Core i7-13650HX with NVIDIA GeForce RTX 4060 8GB graphics, 1 TB SSD, 144Hz 72% NTSC display, and 3 Years On-site Warranty.',
    logoInitial: 'AD',
    logoColor: '#059669',
    leadTime: '7-10 Business Days',
    rating: 4.7,
    location: 'Mumbai, Maharashtra',
    submittedDate: '28 Aug 2026',
  },
  'Demo Technologies Private Limited': {
    vendorId: 'vnd-dt-03',
    vendorName: 'Demo Technologies Private Limited',
    quotationNumber: 'DT-QTN-2026-9034',
    unitPrice: 94000,
    quantity: 20,
    subtotal: 1880000,
    taxRate: 0.18,
    taxAmount: 338400,
    totalAmount: 2218400,
    deliveryTimeline: '3-5 Business Days',
    paymentTerms: 'Net 30 Days',
    warranty: '3 Years On-site Warranty',
    vendorRemarks:
      'Premium Intel Core i7-13700H configuration with 32GB RAM, QHD 2560x1440 165Hz display, Windows 11 Pro, and 3 Years On-site Warranty.',
    logoInitial: 'DT',
    logoColor: '#7C3AED',
    leadTime: '3-5 Business Days',
    rating: 4.8,
    location: 'Hyderabad, Telangana',
    submittedDate: '29 Aug 2026',
  },
};

export const mockLaptopSpecificationGroups: SpecificationCategoryGroup[] = [
  {
    id: 'grp-1',
    groupNo: 1,
    name: 'Performance',
    description: 'Processor, Operating System, and Chipset configuration',
    rows: [
      {
        id: 'spec-1-1',
        category: 'Performance',
        groupNo: 1,
        itemNo: '1.1',
        feature: 'Processor / CPU',
        detailRequirement: 'Intel Core i7-13700H (13th Gen)',
        responses: {
          'Prime Assemblies Inc': 'Intel Core i7-13700H (13th Gen)',
          'ABC Digital Private Limited': 'Intel Core i7-13650HX (13th Gen)',
          'Demo Technologies Private Limited': 'Intel Core i7-13700H (13th Gen)',
        },
      },
      {
        id: 'spec-1-2',
        category: 'Performance',
        groupNo: 1,
        itemNo: '1.2',
        feature: 'Operating System',
        detailRequirement: 'Windows 11 Home',
        responses: {
          'Prime Assemblies Inc': 'Windows 11 Home',
          'ABC Digital Private Limited': 'Windows 11 Home',
          'Demo Technologies Private Limited': 'Windows 11 Pro',
        },
      },
      {
        id: 'spec-1-3',
        category: 'Performance',
        groupNo: 1,
        itemNo: '1.3',
        feature: 'Chipset',
        detailRequirement: 'Integrated with Processor',
        responses: {
          'Prime Assemblies Inc': 'Integrated with Processor',
          'ABC Digital Private Limited': 'Intel HM770 Chipset',
          'Demo Technologies Private Limited': 'Integrated with Processor',
        },
      },
    ],
  },
  {
    id: 'grp-2',
    groupNo: 2,
    name: 'Memory & Storage',
    description: 'RAM capacity, speed, expandability, and NVMe SSD storage',
    rows: [
      {
        id: 'spec-2-1',
        category: 'Memory & Storage',
        groupNo: 2,
        itemNo: '2.1',
        feature: 'RAM (System Memory)',
        detailRequirement: '16 GB',
        responses: {
          'Prime Assemblies Inc': '16 GB',
          'ABC Digital Private Limited': '16 GB',
          'Demo Technologies Private Limited': '32 GB',
        },
      },
      {
        id: 'spec-2-2',
        category: 'Memory & Storage',
        groupNo: 2,
        itemNo: '2.2',
        feature: 'RAM Type',
        detailRequirement: 'DDR5 4800MHz',
        responses: {
          'Prime Assemblies Inc': 'DDR5 4800MHz',
          'ABC Digital Private Limited': 'DDR5 4800MHz',
          'Demo Technologies Private Limited': 'DDR5 5200MHz',
        },
      },
      {
        id: 'spec-2-3',
        category: 'Memory & Storage',
        groupNo: 2,
        itemNo: '2.3',
        feature: 'Memory Slots',
        detailRequirement: '2 x SO-DIMM',
        responses: {
          'Prime Assemblies Inc': '2 x SO-DIMM',
          'ABC Digital Private Limited': '2 x SO-DIMM',
          'Demo Technologies Private Limited': '2 x SO-DIMM',
        },
      },
      {
        id: 'spec-2-4',
        category: 'Memory & Storage',
        groupNo: 2,
        itemNo: '2.4',
        feature: 'Storage Type',
        detailRequirement: 'NVMe PCIe Gen4 SSD',
        responses: {
          'Prime Assemblies Inc': 'NVMe PCIe Gen4 SSD',
          'ABC Digital Private Limited': 'NVMe PCIe Gen4 SSD',
          'Demo Technologies Private Limited': 'NVMe PCIe Gen4 SSD',
        },
      },
      {
        id: 'spec-2-5',
        category: 'Memory & Storage',
        groupNo: 2,
        itemNo: '2.5',
        feature: 'Storage Capacity',
        detailRequirement: '512 GB',
        responses: {
          'Prime Assemblies Inc': '512 GB',
          'ABC Digital Private Limited': '1 TB',
          'Demo Technologies Private Limited': '512 GB',
        },
      },
      {
        id: 'spec-2-6',
        category: 'Memory & Storage',
        groupNo: 2,
        itemNo: '2.6',
        feature: 'Expandable Storage',
        detailRequirement: 'Up to 2 TB SSD',
        responses: {
          'Prime Assemblies Inc': 'Up to 2 TB SSD',
          'ABC Digital Private Limited': 'Up to 2 TB SSD',
          'Demo Technologies Private Limited': 'Up to 4 TB SSD',
        },
      },
    ],
  },
  {
    id: 'grp-3',
    groupNo: 3,
    name: 'Graphics',
    description: 'Dedicated graphics processing unit and video memory',
    rows: [
      {
        id: 'spec-3-1',
        category: 'Graphics',
        groupNo: 3,
        itemNo: '3.1',
        feature: 'Graphics Processor',
        detailRequirement: 'NVIDIA GeForce RTX 4060 (Dedicated)',
        responses: {
          'Prime Assemblies Inc': 'NVIDIA GeForce RTX 4060 (Dedicated)',
          'ABC Digital Private Limited': 'NVIDIA GeForce RTX 4060 (Dedicated)',
          'Demo Technologies Private Limited': 'NVIDIA GeForce RTX 4060 (Dedicated)',
        },
      },
      {
        id: 'spec-3-2',
        category: 'Graphics',
        groupNo: 3,
        itemNo: '3.2',
        feature: 'Graphics Memory',
        detailRequirement: '8 GB GDDR6',
        responses: {
          'Prime Assemblies Inc': '8 GB GDDR6',
          'ABC Digital Private Limited': '8 GB GDDR6',
          'Demo Technologies Private Limited': '8 GB GDDR6',
        },
      },
    ],
  },
  {
    id: 'grp-4',
    groupNo: 4,
    name: 'Display',
    description: 'Display panel, resolution, refresh rate, brightness, and color coverage',
    rows: [
      {
        id: 'spec-4-1',
        category: 'Display',
        groupNo: 4,
        itemNo: '4.1',
        feature: 'Screen Size',
        detailRequirement: '15.6 inches (39.62 cm)',
        responses: {
          'Prime Assemblies Inc': '15.6 inches (39.62 cm)',
          'ABC Digital Private Limited': '15.6 inches (39.62 cm)',
          'Demo Technologies Private Limited': '15.6 inches (39.62 cm)',
        },
      },
      {
        id: 'spec-4-2',
        category: 'Display',
        groupNo: 4,
        itemNo: '4.2',
        feature: 'Display Type',
        detailRequirement: 'LED Backlit Anti-Glare IPS Display',
        responses: {
          'Prime Assemblies Inc': 'LED Backlit Anti-Glare IPS Display',
          'ABC Digital Private Limited': 'LED Backlit Anti-Glare IPS Display',
          'Demo Technologies Private Limited': 'LED Backlit Anti-Glare IPS Display',
        },
      },
      {
        id: 'spec-4-3',
        category: 'Display',
        groupNo: 4,
        itemNo: '4.3',
        feature: 'Resolution',
        detailRequirement: '1920 x 1080 pixels (Full HD)',
        responses: {
          'Prime Assemblies Inc': '1920 x 1080 pixels (Full HD)',
          'ABC Digital Private Limited': '1920 x 1080 pixels (Full HD)',
          'Demo Technologies Private Limited': '2560 x 1440 pixels (QHD)',
        },
      },
      {
        id: 'spec-4-4',
        category: 'Display',
        groupNo: 4,
        itemNo: '4.4',
        feature: 'Brightness',
        detailRequirement: '300 nits',
        responses: {
          'Prime Assemblies Inc': '300 nits',
          'ABC Digital Private Limited': '300 nits',
          'Demo Technologies Private Limited': '350 nits',
        },
      },
      {
        id: 'spec-4-5',
        category: 'Display',
        groupNo: 4,
        itemNo: '4.5',
        feature: 'Aspect Ratio',
        detailRequirement: '16:09',
        responses: {
          'Prime Assemblies Inc': '16:09',
          'ABC Digital Private Limited': '16:09',
          'Demo Technologies Private Limited': '16:09',
        },
      },
      {
        id: 'spec-4-6',
        category: 'Display',
        groupNo: 4,
        itemNo: '4.6',
        feature: 'Refresh Rate',
        detailRequirement: '120 Hz',
        responses: {
          'Prime Assemblies Inc': '120 Hz',
          'ABC Digital Private Limited': '144 Hz',
          'Demo Technologies Private Limited': '165 Hz',
        },
      },
      {
        id: 'spec-4-7',
        category: 'Display',
        groupNo: 4,
        itemNo: '4.7',
        feature: 'Color Gamut',
        detailRequirement: '45% NTSC',
        responses: {
          'Prime Assemblies Inc': '45% NTSC',
          'ABC Digital Private Limited': '72% NTSC',
          'Demo Technologies Private Limited': '100% sRGB',
        },
      },
    ],
  },
  {
    id: 'grp-5',
    groupNo: 5,
    name: 'Audio',
    description: 'Speakers, microphones, and audio enhancement technology',
    rows: [
      {
        id: 'spec-5-1',
        category: 'Audio',
        groupNo: 5,
        itemNo: '5.1',
        feature: 'Speakers',
        detailRequirement: 'Stereo Speakers with Realtek ALC3204',
        responses: {
          'Prime Assemblies Inc': 'Stereo Speakers with Realtek ALC3204',
          'ABC Digital Private Limited': 'Stereo Speakers with Realtek Audio',
          'Demo Technologies Private Limited': 'Stereo Speakers with Dolby Audio',
        },
      },
      {
        id: 'spec-5-2',
        category: 'Audio',
        groupNo: 5,
        itemNo: '5.2',
        feature: 'Microphone',
        detailRequirement: 'Dual Array Digital Microphones',
        responses: {
          'Prime Assemblies Inc': 'Dual Array Digital Microphones',
          'ABC Digital Private Limited': 'Dual Array Digital Microphones',
          'Demo Technologies Private Limited': 'Dual Array Digital Microphones',
        },
      },
      {
        id: 'spec-5-3',
        category: 'Audio',
        groupNo: 5,
        itemNo: '5.3',
        feature: 'Audio Technology',
        detailRequirement: 'Waves MaxxAudio Pro',
        responses: {
          'Prime Assemblies Inc': 'Waves MaxxAudio Pro',
          'ABC Digital Private Limited': 'Waves MaxxAudio Pro',
          'Demo Technologies Private Limited': 'Waves MaxxAudio Pro',
        },
      },
    ],
  },
  {
    id: 'grp-6',
    groupNo: 6,
    name: 'Webcam & Privacy',
    description: 'Camera resolution, integrated sensors, and physical privacy mechanisms',
    rows: [
      {
        id: 'spec-6-1',
        category: 'Webcam & Privacy',
        groupNo: 6,
        itemNo: '6.1',
        feature: 'Webcam Resolution',
        detailRequirement: '720p HD (30fps)',
        responses: {
          'Prime Assemblies Inc': '720p HD (30fps)',
          'ABC Digital Private Limited': '720p HD (30fps)',
          'Demo Technologies Private Limited': '720p HD (30fps)',
        },
      },
      {
        id: 'spec-6-2',
        category: 'Webcam & Privacy',
        groupNo: 6,
        itemNo: '6.2',
        feature: 'Webcam Features',
        detailRequirement: 'Integrated Digital Microphone',
        responses: {
          'Prime Assemblies Inc': 'Integrated Digital Microphone',
          'ABC Digital Private Limited': 'Integrated Digital Microphone',
          'Demo Technologies Private Limited': 'Integrated Digital Microphone',
        },
      },
      {
        id: 'spec-6-3',
        category: 'Webcam & Privacy',
        groupNo: 6,
        itemNo: '6.3',
        feature: 'Privacy Features',
        detailRequirement: 'No physical privacy shutter',
        responses: {
          'Prime Assemblies Inc': 'No physical privacy shutter',
          'ABC Digital Private Limited': 'No physical privacy shutter',
          'Demo Technologies Private Limited': 'No physical privacy shutter',
        },
      },
    ],
  },
  {
    id: 'grp-7',
    groupNo: 7,
    name: 'Keyboard & Touchpad',
    description: 'Keyboard layout, backlighting, precision touchpad, and biometrics',
    rows: [
      {
        id: 'spec-7-1',
        category: 'Keyboard & Touchpad',
        groupNo: 7,
        itemNo: '7.1',
        feature: 'Keyboard Type',
        detailRequirement: 'Standard Full-size Keyboard',
        responses: {
          'Prime Assemblies Inc': 'Standard Full-size Keyboard',
          'ABC Digital Private Limited': 'Standard Full-size Keyboard',
          'Demo Technologies Private Limited': 'Standard Full-size Keyboard',
        },
      },
      {
        id: 'spec-7-2',
        category: 'Keyboard & Touchpad',
        groupNo: 7,
        itemNo: '7.2',
        feature: 'Backlight',
        detailRequirement: 'Orange Backlit',
        responses: {
          'Prime Assemblies Inc': 'Orange Backlit',
          'ABC Digital Private Limited': 'Orange Backlit',
          'Demo Technologies Private Limited': 'Orange Backlit',
        },
      },
      {
        id: 'spec-7-3',
        category: 'Keyboard & Touchpad',
        groupNo: 7,
        itemNo: '7.3',
        feature: 'Numeric Keypad',
        detailRequirement: 'Yes',
        responses: {
          'Prime Assemblies Inc': 'Yes',
          'ABC Digital Private Limited': 'Yes',
          'Demo Technologies Private Limited': 'Yes',
        },
      },
      {
        id: 'spec-7-4',
        category: 'Keyboard & Touchpad',
        groupNo: 7,
        itemNo: '7.4',
        feature: 'Touchpad Type',
        detailRequirement: 'Multi-touch Gesture Enabled Precision Touchpad',
        responses: {
          'Prime Assemblies Inc': 'Multi-touch Gesture Enabled Precision Touchpad',
          'ABC Digital Private Limited': 'Multi-touch Gesture Enabled Precision Touchpad',
          'Demo Technologies Private Limited': 'Multi-touch Gesture Enabled Precision Touchpad',
        },
      },
      {
        id: 'spec-7-5',
        category: 'Keyboard & Touchpad',
        groupNo: 7,
        itemNo: '7.5',
        feature: 'Fingerprint Reader',
        detailRequirement: 'No',
        responses: {
          'Prime Assemblies Inc': 'No',
          'ABC Digital Private Limited': 'No',
          'Demo Technologies Private Limited': 'No',
        },
      },
    ],
  },
  {
    id: 'grp-8',
    groupNo: 8,
    name: 'Connectivity',
    description: 'Wireless networking standards and Gigabit Ethernet',
    rows: [
      {
        id: 'spec-8-1',
        category: 'Connectivity',
        groupNo: 8,
        itemNo: '8.1',
        feature: 'Wi-Fi Standard',
        detailRequirement: 'Wi-Fi 6 (802.11ax)',
        responses: {
          'Prime Assemblies Inc': 'Wi-Fi 6 (802.11ax)',
          'ABC Digital Private Limited': 'Wi-Fi 6 (802.11ax)',
          'Demo Technologies Private Limited': 'Wi-Fi 6 (802.11ax)',
        },
      },
      {
        id: 'spec-8-2',
        category: 'Connectivity',
        groupNo: 8,
        itemNo: '8.2',
        feature: 'Bluetooth Version',
        detailRequirement: 'Bluetooth 5.2',
        responses: {
          'Prime Assemblies Inc': 'Bluetooth 5.2',
          'ABC Digital Private Limited': 'Bluetooth 5.2',
          'Demo Technologies Private Limited': 'Bluetooth 5.2',
        },
      },
      {
        id: 'spec-8-3',
        category: 'Connectivity',
        groupNo: 8,
        itemNo: '8.3',
        feature: 'Ethernet',
        detailRequirement: 'Gigabit Ethernet (RJ-45)',
        responses: {
          'Prime Assemblies Inc': 'Gigabit Ethernet (RJ-45)',
          'ABC Digital Private Limited': 'Gigabit Ethernet (RJ-45)',
          'Demo Technologies Private Limited': 'Gigabit Ethernet (RJ-45)',
        },
      },
    ],
  },
  {
    id: 'grp-9',
    groupNo: 9,
    name: 'Ports & Slots',
    description: 'Physical USB ports, video out, audio, Ethernet, card readers, and DC power',
    rows: [
      {
        id: 'spec-9-1',
        category: 'Ports & Slots',
        groupNo: 9,
        itemNo: '9.1',
        feature: 'USB Ports',
        detailRequirement: '1x USB 3.2 Gen 1 (Type-C), 2x USB 3.2 Gen 1 (Type-A)',
        responses: {
          'Prime Assemblies Inc': '2 x USB-A 3.2 Gen 1, 1 x USB-C 3.2 Gen 2',
          'ABC Digital Private Limited': '2 x USB-A 3.2 Gen 1, 1 x USB-C 3.2 Gen 2',
          'Demo Technologies Private Limited': '2 x USB-A 3.2 Gen 2, 2 x USB-C',
        },
      },
      {
        id: 'spec-9-2',
        category: 'Ports & Slots',
        groupNo: 9,
        itemNo: '9.2',
        feature: 'HDMI Port',
        detailRequirement: '1x HDMI 2.1',
        responses: {
          'Prime Assemblies Inc': '1x HDMI 2.1',
          'ABC Digital Private Limited': '1x HDMI 2.1',
          'Demo Technologies Private Limited': '1x HDMI 2.1',
        },
      },
      {
        id: 'spec-9-3',
        category: 'Ports & Slots',
        groupNo: 9,
        itemNo: '9.3',
        feature: 'Audio Jack',
        detailRequirement: '1x 3.5mm Headphone/Microphone Combo Jack',
        responses: {
          'Prime Assemblies Inc': '3.5 mm Combo Audio Jack',
          'ABC Digital Private Limited': '3.5 mm Combo Audio Jack',
          'Demo Technologies Private Limited': '3.5 mm Combo Audio Jack',
        },
      },
      {
        id: 'spec-9-4',
        category: 'Ports & Slots',
        groupNo: 9,
        itemNo: '9.4',
        feature: 'Ethernet Port',
        detailRequirement: '1x RJ-45',
        responses: {
          'Prime Assemblies Inc': '1x RJ-45',
          'ABC Digital Private Limited': '1x RJ-45',
          'Demo Technologies Private Limited': '1x RJ-45',
        },
      },
      {
        id: 'spec-9-5',
        category: 'Ports & Slots',
        groupNo: 9,
        itemNo: '9.5',
        feature: 'Card Reader',
        detailRequirement: 'No',
        responses: {
          'Prime Assemblies Inc': 'No',
          'ABC Digital Private Limited': 'No',
          'Demo Technologies Private Limited': 'No',
        },
      },
      {
        id: 'spec-9-6',
        category: 'Ports & Slots',
        groupNo: 9,
        itemNo: '9.6',
        feature: 'Power Port',
        detailRequirement: '1x DC-in barrel',
        responses: {
          'Prime Assemblies Inc': '1x DC-in barrel',
          'ABC Digital Private Limited': '1x DC-in barrel',
          'Demo Technologies Private Limited': '1x DC-in barrel',
        },
      },
    ],
  },
  {
    id: 'grp-10',
    groupNo: 10,
    name: 'Battery & Power',
    description: 'Battery chemistry, Watt-hour capacity, power adapter, and runtime',
    rows: [
      {
        id: 'spec-10-1',
        category: 'Battery & Power',
        groupNo: 10,
        itemNo: '10.1',
        feature: 'Battery Type',
        detailRequirement: '3-Cell Lithium-ion',
        responses: {
          'Prime Assemblies Inc': '3-Cell Lithium-ion',
          'ABC Digital Private Limited': '3-Cell Lithium-ion',
          'Demo Technologies Private Limited': '3-Cell Lithium-ion',
        },
      },
      {
        id: 'spec-10-2',
        category: 'Battery & Power',
        groupNo: 10,
        itemNo: '10.2',
        feature: 'Battery Capacity',
        detailRequirement: '56 Whr',
        responses: {
          'Prime Assemblies Inc': '56 Whr',
          'ABC Digital Private Limited': '56 Whr',
          'Demo Technologies Private Limited': '56 Whr',
        },
      },
      {
        id: 'spec-10-3',
        category: 'Battery & Power',
        groupNo: 10,
        itemNo: '10.3',
        feature: 'Power Adapter Wattage',
        detailRequirement: '180W AC Adapter',
        responses: {
          'Prime Assemblies Inc': '180W AC Adapter',
          'ABC Digital Private Limited': '180W AC Adapter',
          'Demo Technologies Private Limited': '180W AC Adapter',
        },
      },
      {
        id: 'spec-10-4',
        category: 'Battery & Power',
        groupNo: 10,
        itemNo: '10.4',
        feature: 'Battery Life',
        detailRequirement: 'Up to 6 hours (Mixed usage)',
        responses: {
          'Prime Assemblies Inc': 'Up to 6 hours (Mixed usage)',
          'ABC Digital Private Limited': 'Up to 6 hours (Mixed usage)',
          'Demo Technologies Private Limited': 'Up to 6 hours (Mixed usage)',
        },
      },
    ],
  },
  {
    id: 'grp-11',
    groupNo: 11,
    name: 'Build & Design',
    description: 'Chassis material, finish color, physical dimensions, and unit weight',
    rows: [
      {
        id: 'spec-11-1',
        category: 'Build & Design',
        groupNo: 11,
        itemNo: '11.1',
        feature: 'Material',
        detailRequirement: 'Plastic Chassis',
        responses: {
          'Prime Assemblies Inc': 'Plastic Chassis',
          'ABC Digital Private Limited': 'Plastic Chassis',
          'Demo Technologies Private Limited': 'Plastic Chassis',
        },
      },
      {
        id: 'spec-11-2',
        category: 'Build & Design',
        groupNo: 11,
        itemNo: '11.2',
        feature: 'Color',
        detailRequirement: 'Dark Shadow Gray',
        responses: {
          'Prime Assemblies Inc': 'Dark Shadow Gray',
          'ABC Digital Private Limited': 'Dark Shadow Gray',
          'Demo Technologies Private Limited': 'Dark Shadow Gray',
        },
      },
      {
        id: 'spec-11-3',
        category: 'Build & Design',
        groupNo: 11,
        itemNo: '11.3',
        feature: 'Dimensions (W x D x H)',
        detailRequirement: '357.26 x 272.11 x 24.95 mm',
        responses: {
          'Prime Assemblies Inc': '357.26 x 272.11 x 24.95 mm',
          'ABC Digital Private Limited': '357.26 x 272.11 x 24.95 mm',
          'Demo Technologies Private Limited': '357.26 x 272.11 x 24.95 mm',
        },
      },
      {
        id: 'spec-11-4',
        category: 'Build & Design',
        groupNo: 11,
        itemNo: '11.4',
        feature: 'Weight',
        detailRequirement: '2.81 kg',
        responses: {
          'Prime Assemblies Inc': '2.35 kg',
          'ABC Digital Private Limited': '2.30 kg',
          'Demo Technologies Private Limited': '2.45 kg',
        },
      },
    ],
  },
  {
    id: 'grp-12',
    groupNo: 12,
    name: 'Security & Features',
    description: 'Hardware lock slot, pre-installed management utilities, and warranty terms',
    rows: [
      {
        id: 'spec-12-1',
        category: 'Security & Features',
        groupNo: 12,
        itemNo: '12.1',
        feature: 'Security Features',
        detailRequirement: 'Kensington Lock Slot',
        responses: {
          'Prime Assemblies Inc': 'Kensington Lock Slot',
          'ABC Digital Private Limited': 'Kensington Lock Slot',
          'Demo Technologies Private Limited': 'Kensington Lock Slot',
        },
      },
      {
        id: 'spec-12-2',
        category: 'Security & Features',
        groupNo: 12,
        itemNo: '12.2',
        feature: 'Pre-installed Software',
        detailRequirement: 'Dell SupportAssist, Dell Digital Delivery, My Dell',
        responses: {
          'Prime Assemblies Inc': 'Dell SupportAssist, Dell Digital Delivery, My Dell',
          'ABC Digital Private Limited': 'Dell SupportAssist, Dell Digital Delivery, My Dell',
          'Demo Technologies Private Limited': 'Dell SupportAssist, Dell Digital Delivery, My Dell',
        },
      },
      {
        id: 'spec-12-3',
        category: 'Security & Features',
        groupNo: 12,
        itemNo: '12.3',
        feature: 'Warranty',
        detailRequirement: '1 Year Onsite Service',
        responses: {
          'Prime Assemblies Inc': '3 Years On-site Warranty',
          'ABC Digital Private Limited': '3 Years On-site Warranty',
          'Demo Technologies Private Limited': '3 Years On-site Warranty',
        },
      },
    ],
  },
];

export type UserType = {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "DEVELOPER";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CardsType = {
    _id?: string
    title: string
    municipality: string
    slug: string
    pricing_lowest: number
    category: string[]
    cover_image: string
    description: string
    is_premium: boolean
    fileSizeMB: number
    createdAt?: string
    updatedAt?: string
}

export type TouristSpotType = {
    _id?: string
    slug: string
    title: string
    cover_image: string,
    description: string
    category: string[]
    municipality: string
    geo_lat: number
    geo_lng: number
    activity_tags: string[]
    contact_info: {
        phone?: string
        email?: string
        website?: string
    }
    social_links: {
        facebook?: string
        instagram?: string
    }
    pricing_lowest: number | null
    operating_hours: string | null
    rating: number | null
    is_premium: boolean
    view_count: number
    fullURLMap?: string
    fileSizeMB: number
    createdAt?: string
    updatedAt?: string
}

export type RestaurantType = {
    _id?: string
    slug: string
    title: string
    cover_image: string,
    description: string
    category: string[]
    municipality: string
    geo_lat: number
    geo_lng: number
    activity_tags: string[]
    contact_info: {
        phone?: string
        email?: string
        website?: string
    }
    social_links: {
        facebook?: string
        instagram?: string
    }
    pricing_lowest: number | null
    operating_hours: string | null
    rating: number | null
    is_premium: boolean
    view_count: number
    fullURLMap?: string
    fileSizeMB: number
    createdAt?: string
    updatedAt?: string
}

export type HotelType = {
    _id?: string
    slug: string
    title: string
    cover_image: string,
    description: string
    category: string[]
    municipality: string
    geo_lat: number
    geo_lng: number
    activity_tags: string[]
    contact_info: {
        phone?: string
        email?: string
        website?: string
    }
    social_links: {
        facebook?: string
        instagram?: string
    }
    pricing_lowest: number | null
    operating_hours: string | null
    rating: number | null
    is_premium: boolean
    view_count: number
    fullURLMap?: string
    fileSizeMB: number
    createdAt?: string
    updatedAt?: string
}

export type TouristGuideType = {
    _id?: string
    slug: string
    title: string
    cover_image: string,
    description: string
    category: string[]
    municipality: string
    geo_lat: number
    geo_lng: number
    activity_tags: string[]
    contact_info: {
        phone?: string
        email?: string
        website?: string
    }
    social_links: {
        facebook?: string
        instagram?: string
    }
    pricing_lowest: number | null
    operating_hours: string | null
    rating: number | null
    is_premium: boolean
    view_count: number
    fullURLMap?: string
    fileSizeMB: number
    createdAt?: string
    updatedAt?: string
}

export type TerminalType = {
    _id: string;
    name: string;
    slug: string;
    municipality: string;
    description: string;
    cover_image: string;
    category: string[]
    terminal_type?: string;
    is_24_hours?: boolean;
    operating_hours?: string;
    rating?: number;
    routes_count?: number;
    routes?: string[];
    facilities?: string[];
    transport_types?: string[];
    geo_lat?: number;
    geo_lng?: number;
    contact_info?: {
        phone?: string;
        email?: string;
    };
    createdAt?: string
    updatedAt?: string
};

export type RecentActivitiesType = {
    _id: string;
    text: string;
    slug: string;
    createdAt?: string
    updatedAt?: string
}

const mockTerminal: TerminalType = {
    _id: "terminal-001",
    name: "Legazpi Grand Central Terminal",
    slug: "legazpi-grand-central-terminal",
    municipality: "Legazpi City",
    category: ["terminals"],
    description: `Legazpi Grand Central Terminal is the main transport hub serving passengers traveling across Albay and nearby provinces.

It provides organized loading bays for buses, UV Express vans, and jeepneys. The terminal offers clean waiting areas, ticketing booths, and 24/7 security to ensure passenger safety.

Conveniently located near major highways, it connects travelers to key destinations such as Naga, Sorsogon, and Manila.`,
    cover_image: "https://example.com/images/legazpi-terminal.jpg",
    terminal_type: "Bus & Van Terminal",
    is_24_hours: true,
    operating_hours: "Open 24 Hours",
    rating: 4.3,
    routes_count: 12,
    routes: [
        // Albay (intra-province)
        "Legazpi - Daraga",
        "Legazpi - Camalig",
        "Legazpi - Guinobatan",
        "Legazpi - Ligao",
        "Legazpi - Oas",
        "Legazpi - Polangui",
        "Legazpi - Libon",
        "Legazpi - Tabaco",
        "Legazpi - Malilipot",
        "Legazpi - Sto. Domingo",
        "Legazpi - Bacacay",
        "Legazpi - Manito",

        // Camarines Sur
        "Legazpi - Naga",
        "Legazpi - Iriga",
        "Legazpi - Pili",

        // Sorsogon
        "Legazpi - Sorsogon City",
        "Legazpi - Bulan",
        "Legazpi - Matnog",
        "Legazpi - Irosin",

        // Camarines Norte
        "Legazpi - Daet",

        // Masbate (via Pilar/Tabaco port + RORO)
        "Legazpi - Masbate City",

        // Metro Manila / Luzon
        "Legazpi - Manila (Cubao)",
        "Legazpi - Manila (PITX)",
        "Legazpi - Pasay",
        "Legazpi - Alabang",
        "Legazpi - Calamba",
        "Legazpi - Lucena",

        // Visayas (via bus + ferry connections)
        "Legazpi - Samar (Catbalogan)",
        "Legazpi - Tacloban",
    ],
    facilities: [
        "Restrooms",
        "Waiting Area",
        "Food Stalls",
        "Ticket Counters",
        "Parking Area",
        "24/7 Security",
        "ATM Machines"
    ],
    transport_types: [
        "Bus",
        "Van",
        "Jeepney"
    ],
    geo_lat: 13.1391,
    geo_lng: 123.7438,
    contact_info: {
        phone: "+63 917 123 4567",
        email: "info@legazpiterminal.ph"
    }
};
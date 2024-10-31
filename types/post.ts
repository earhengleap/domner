// types/post.ts
export const CAMBODIA_PROVINCES = {
    BANTEAY_MEANCHEY: 'Banteay Meanchey',
    BATTAMBANG: 'Battambang',
    KAMPONG_CHAM: 'Kampong Cham',
    KAMPONG_CHHNANG: 'Kampong Chhnang',
    KAMPONG_SPEU: 'Kampong Speu',
    KAMPONG_THOM: 'Kampong Thom',
    KAMPOT: 'Kampot',
    KANDAL: 'Kandal',
    KEP: 'Kep',
    KOH_KONG: 'Koh Kong',
    KRATIE: 'Kratie',
    MONDULKIRI: 'Mondulkiri',
    PHNOM_PENH: 'Phnom Penh',
    PREAH_VIHEAR: 'Preah Vihear',
    PREY_VENG: 'Prey Veng',
    PURSAT: 'Pursat',
    RATANAKIRI: 'Ratanakiri',
    SIEM_REAP: 'Siem Reap',
    PREAH_SIHANOUK: 'Preah Sihanouk',
    STUNG_TRENG: 'Stung Treng',
    SVAY_RIENG: 'Svay Rieng',
    TAKEO: 'Takeo',
    ODDAR_MEANCHEY: 'Oddar Meanchey',
    PAILIN: 'Pailin',
    TBOUNG_KHMUM: 'Tboung Khmum'
  } as const;
  
  export const POST_AREAS = {
    RURAL: 'Rural',
    COASTAL: 'Coastal',
    MOUNTAIN: 'Mountain',
    FOREST: 'Forest',
    RIVERSIDE: 'Riverside',
    WATERFALL: 'Waterfall',
    OTHER: 'Other'
  } as const;
  
  export const POST_CATEGORIES = {
    FOOD: 'Food',
    DRINK: 'Drink',
    RESORT: 'Resort',
    OTHER: 'Other'
  } as const;
  
  export const TRENDING_HASHTAGS = [
    'PhnomPenh',
    'SiemReap',
    'AngkorWat',
    'KhmerFood',
    'CambodianCulture',
    'TravelCambodia',
    'KhmerStyle',
    'CambodiaTourism',
    'AsianFood',
    'SoutheastAsia'
  ];
  
  export type CambodiaProvince = keyof typeof CAMBODIA_PROVINCES;
  export type PostArea = keyof typeof POST_AREAS;
  export type PostCategory = keyof typeof POST_CATEGORIES;
  
  export interface CreatePostData {
    photos: string[];
    caption: string;
    location: CambodiaProvince;
    area: PostArea;
    category: PostCategory;
    hashtags: string[];
    mentions: string[];
  }
  
  export interface ImageWithPreview extends File {
    preview: string;
  }
  export interface Post {
    id: string;
    userId: string;
    caption: string;
    location: CambodiaProvince;
    area: PostArea;
    category: PostCategory;
    photos: string[];
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    _count: {
      comments: number;
      likes: number;
    };
    likes: Array<{ id: string }>;
  }
  
  export interface PostsResponse {
    posts: Post[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    };
  }
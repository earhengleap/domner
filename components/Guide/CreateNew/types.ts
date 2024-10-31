export interface Itinerary {
    title: string;
    content: string;
  }
  
  export interface FormData {
    title: string;
    location: string;
    area: string;  // New field
    type: string;  // New field
    about: string;
    packageOffer: string;
    highlight: string;
    fullDescription: string;
    include: string;
    notSuitableFor: string;
    importantInfo: string;
    price: string;
    itinerary: Itinerary[];
    photos: string[];
    offlineMapUrl: string;
    bookletUrl: string;
    termsUrl: string;
  }
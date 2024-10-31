export interface GuideProfile {
    id?: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    description: string;
    profilePicture: string | null;
    imagePath?: string;
    facebookLink: string;
    tiktokLink: string;
    twitterLink: string;
    telegramLink: string;
  }
  
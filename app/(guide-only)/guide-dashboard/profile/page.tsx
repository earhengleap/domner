// app/guide-profile/page.tsx
import { GuideProfileForm } from '@/components/Guide/GuideProfile';

export default function GuideProfilePage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4 p-8 ">Guide Profile</h1>
      <GuideProfileForm />
    </div>
  );
}
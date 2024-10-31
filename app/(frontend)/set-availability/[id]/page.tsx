import { AvailabilitySection } from '@/components/Guide/CreateNew/AvailabilitySection';

export default function SetAvailabilityPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Set Tour Availability</h1>
      <AvailabilitySection postId={params.id} />
    </div>
  );
}
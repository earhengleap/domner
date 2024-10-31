// File: app/apply-guide/page.tsx

import Link from 'next/link';

const ApplyGuidePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Become a Guide</h1>
      <p className="mb-4">Interested in becoming a guide? Fill out our application form to get started!</p>
      <Link href="/guide-registration" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Apply Now
      </Link>
    </div>
  );
};

export default ApplyGuidePage;
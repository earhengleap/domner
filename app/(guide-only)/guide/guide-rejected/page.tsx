// File: app/application-rejected/page.tsx

import Link from 'next/link';

const ApplicationRejectedPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Application Rejected</h1>
      <p className="mb-4">We're sorry, but your guide application has been rejected. If you have any questions, please contact our support team.</p>
      <Link href="/" className="text-blue-500 hover:text-blue-600">
        Return to Home
      </Link>
    </div>
  );
};

export default ApplicationRejectedPage;
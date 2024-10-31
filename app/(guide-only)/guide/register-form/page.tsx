
import RegisterFormGuide from '@/components/Guide/RegisterFormGuide'
import React from 'react'


export default function page() {
  return (
    <div className=" py-32 w-3/5 mx-auto font-forum">
    <h1 className="text-2xl font-bold mb-6 text-center">
      Guide Registration
    </h1>
    <p className="mb-6 text-sm text-gray-600">
      Registering and certifying your information ensures that you are
      recognized as a trusted and professional guide on our platform. This
      process enhances your credibility with travelers, opens up more
      opportunities for work, and helps maintain the highest standards of
      safety and quality in guiding tourists to iconic destinations. By
      verifying your credentials, you not only showcase your expertise but
      also contribute to a secure and enriching travel experience for all.
    </p>
      <RegisterFormGuide/>
    </div>
  )
}

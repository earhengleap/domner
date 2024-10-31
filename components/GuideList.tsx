// components/GuideList.tsx
'use client'

import React from 'react'
import Link from 'next/link'

interface GuideProfile {
  id: string
  firstName: string
  lastName: string
  description?: string
  profilePicture?: string
}

interface Guide {
  id: string
  name: string
  guideProfile: GuideProfile
}

interface GuideListProps {
  guides: Guide[]
  currentUserId: string
}

export default function GuideList({ guides, currentUserId }: GuideListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guides.map((guide) => (
        <div key={guide.id} className="border rounded-lg p-4 shadow-md">
          <img
            src={guide.guideProfile.profilePicture || '/default-avatar.png'}
            alt={`${guide.name}'s profile`}
            className="w-32 h-32 rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-center mb-2">{guide.name}</h2>
          <p className="text-gray-600 text-center mb-4">{guide.guideProfile.description}</p>
          <Link 
            href={`/chat/${currentUserId}/${guide.id}`}
            className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Chat with {guide.name}
          </Link>
        </div>
      ))}
    </div>
  )
}
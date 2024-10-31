"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ItineraryItem {
  title: string;
  content: string;
}

interface PostFormData {
  title: string;
  location: string;
  price: number;
  category: string;
  about: string;
  packageOffer: string;
  highlight: string;
  fullDescription: string;
  include: string[];
  notSuitableFor: string[];
  importantInfo: string[];
  photos: string[];
  itinerary: ItineraryItem[];
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    location: "",
    price: 0,
    category: "",
    about: "",
    packageOffer: "",
    highlight: "",
    fullDescription: "",
    include: [],
    notSuitableFor: [],
    importantInfo: [],
    photos: [],
    itinerary: [], // Initialize as an empty array
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await fetch(`/api/guide-posts/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        } else {
          toast.error("Failed to fetch post data");
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
        toast.error("An error occurred while fetching the post data");
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const response = await fetch(`/api/guide-posts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Post updated successfully");
        router.push("/guide-dashboard");
      } else {
        toast.error("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleArrayInputChange = (
    index: number,
    field: keyof PostFormData,
    value: string
  ) => {
    setFormData((prev) => {
      if (!prev) return null;
      const newArray = [...(prev[field] as string[])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleItineraryChange = (
    index: number,
    key: "title" | "content",
    value: string
  ) => {
    setFormData((prev) => {
      if (!prev) return null;
      const newItinerary = [...prev.itinerary];
      newItinerary[index] = { ...newItinerary[index], [key]: value };
      return { ...prev, itinerary: newItinerary };
    });
  };

  const addItineraryItem = () => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        itinerary: [...prev.itinerary, { title: "", content: "" }],
      };
    });
  };

  const removeItineraryItem = (index: number) => {
    setFormData((prev) => {
      if (!prev) return null;
      const newItinerary = [...prev.itinerary];
      newItinerary.splice(index, 1);
      return { ...prev, itinerary: newItinerary };
    });
  };

  if (loading) {
    return <div className="loader"/>;
  }

  if (!formData) {
    return <div>Failed to load post data</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>

      {/* Basic fields */}
      {[
        "title",
        "location",
        "price",
        "category",
        "about",
        "packageOffer",
        "highlight",
        "fullDescription",
      ].map((field) => (
        <div key={field}>
          <label
            htmlFor={field}
            className="block text-sm font-medium text-gray-700"
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          {field === "about" ||
          field === "packageOffer" ||
          field === "highlight" ||
          field === "fullDescription" ? (
            <textarea
              id={field}
              name={field}
              value={formData[field as keyof PostFormData] as string}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows={3}
            />
          ) : (
            <input
              type={field === "price" ? "number" : "text"}
              id={field}
              name={field}
              value={formData[field as keyof PostFormData] as string | number}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          )}
        </div>
      ))}

      {/* Array fields */}
      {["include", "notSuitableFor", "importantInfo", "photos"].map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          {Array.isArray(formData[field as keyof PostFormData]) &&
            (formData[field as keyof PostFormData] as string[]).map(
              (item: string, index: number) => (
                <input
                  key={index}
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleArrayInputChange(
                      index,
                      field as keyof PostFormData,
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              )
            )}
        </div>
      ))}

      {/* Itinerary */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Itinerary
        </label>
        {formData.itinerary?.length > 0 ? (
          formData.itinerary.map((item, index) => (
            <div key={index} className="space-y-2 mt-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) =>
                  handleItineraryChange(index, "title", e.target.value)
                }
                placeholder="Title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <textarea
                value={item.content}
                onChange={(e) =>
                  handleItineraryChange(index, "content", e.target.value)
                }
                placeholder="Content"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button
                type="button"
                onClick={() => removeItineraryItem(index)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No itinerary items added yet.</p>
        )}
        <button
          type="button"
          onClick={addItineraryItem}
          className="bg-green-500 text-white p-2 rounded mt-2"
        >
          Add Itinerary Item
        </button>
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Update Post
      </button>
    </form>
  );
}

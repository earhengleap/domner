"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import { CalendarDays, Clock3, ImagePlus, Link2, Lock, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ItineraryItem = {
  title: string;
  content: string;
};

type AvailabilityItem = {
  date: string;
  isAvailable: boolean;
};

type GuideProfileSummary = {
  firstName?: string | null;
  lastName?: string | null;
  description?: string | null;
};

type EditorUser = {
  id: string;
  name?: string | null;
  guideProfile?: GuideProfileSummary | null;
};

export type ManageableGuidePost = {
  id: string;
  title: string;
  location: string;
  area: string;
  type: string;
  about: string;
  packageOffer: string;
  highlight: string;
  fullDescription: string;
  include: string;
  notSuitableFor: string;
  importantInfo: string;
  price: number;
  photos: string[];
  offlineMapUrl?: string | null;
  bookletUrl?: string | null;
  termsUrl?: string | null;
  itinerary: ItineraryItem[];
  availability: AvailabilityItem[];
  lockedDates: string[];
  updatedAt: string;
  createdAt: string;
  user: EditorUser;
};

type ManagePostEditorProps = {
  post: ManageableGuidePost;
  onSubmit: (post: ManageableGuidePost) => Promise<void>;
  onCancel: () => void;
};

function formatDateValue(value: string | Date) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function formatLongDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(parsed);
}

export function ManagePostEditor({ post, onSubmit, onCancel }: ManagePostEditorProps) {
  const [editedPost, setEditedPost] = useState<ManageableGuidePost>({
    ...post,
    availability: (post.availability ?? []).map((entry) => ({
      date: formatDateValue(entry.date),
      isAvailable: entry.isAvailable,
    })),
    lockedDates: (post.lockedDates ?? []).map((date) => formatDateValue(date)),
    itinerary: post.itinerary?.length ? post.itinerary : [{ title: "", content: "" }],
  });
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);

  const lockedDateSet = useMemo(
    () => new Set(editedPost.lockedDates.map((date) => formatDateValue(date)).filter(Boolean)),
    [editedPost.lockedDates]
  );

  const availableDates = useMemo(
    () =>
      editedPost.availability
        .filter((entry) => entry.isAvailable)
        .map((entry) => formatDateValue(entry.date))
        .filter((date) => date && !lockedDateSet.has(date))
        .sort(),
    [editedPost.availability, lockedDateSet]
  );

  const guideName =
    [editedPost.user?.guideProfile?.firstName, editedPost.user?.guideProfile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || editedPost.user?.name || "Guide owner";

  const handleFieldChange = (field: keyof ManageableGuidePost, value: string | number | string[]) => {
    setEditedPost((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryItem, value: string) => {
    setEditedPost((current) => ({
      ...current,
      itinerary: current.itinerary.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItineraryItem = () => {
    setEditedPost((current) => ({
      ...current,
      itinerary: [...current.itinerary, { title: "", content: "" }],
    }));
  };

  const removeItineraryItem = (index: number) => {
    setEditedPost((current) => ({
      ...current,
      itinerary: current.itinerary.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addAvailabilityDate = () => {
    const normalizedDate = formatDateValue(newDate);

    if (!normalizedDate || lockedDateSet.has(normalizedDate) || availableDates.includes(normalizedDate)) {
      return;
    }

    setEditedPost((current) => ({
      ...current,
      availability: [...current.availability, { date: normalizedDate, isAvailable: true }],
    }));
    setNewDate("");
  };

  const removeAvailabilityDate = (date: string) => {
    setEditedPost((current) => ({
      ...current,
      availability: current.availability.filter((entry) => formatDateValue(entry.date) !== date),
    }));
  };

  const handlePhotoUpload = (urls: string[]) => {
    handleFieldChange("photos", [...editedPost.photos, ...urls]);
  };

  const removePhoto = (index: number) => {
    handleFieldChange(
      "photos",
      editedPost.photos.filter((_, photoIndex) => photoIndex !== index)
    );
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await onSubmit({
        ...editedPost,
        availability: availableDates.map((date) => ({ date, isAvailable: true })),
        lockedDates: Array.from(lockedDateSet),
        itinerary: editedPost.itinerary.filter(
          (item) => item.title.trim().length > 0 || item.content.trim().length > 0
        ),
        price: Number(editedPost.price) || 0,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit bg-emerald-600 text-white hover:bg-emerald-600">{editedPost.type}</Badge>
              <CardTitle className="text-2xl font-semibold text-slate-900">{editedPost.title}</CardTitle>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {editedPost.location}, {editedPost.area}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-emerald-600" />
                  Updated {formatLongDate(editedPost.updatedAt)}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              <div className="font-medium text-slate-900">{guideName}</div>
              <div className="whitespace-nowrap">{availableDates.length} open dates</div>
              <div className="whitespace-nowrap">{lockedDateSet.size} booked dates locked</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post title</Label>
              <Input
                id="title"
                value={editedPost.title}
                onChange={(event) => handleFieldChange("title", event.target.value)}
                placeholder="Tonle Sap floating village tour"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editedPost.location}
                onChange={(event) => handleFieldChange("location", event.target.value)}
                placeholder="Siem Reap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                value={editedPost.area}
                onChange={(event) => handleFieldChange("area", event.target.value)}
                placeholder="Lakeside"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={editedPost.price}
                onChange={(event) => handleFieldChange("price", Number(event.target.value))}
                placeholder="120"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="about">Quick summary</Label>
              <Textarea
                id="about"
                rows={4}
                value={editedPost.about}
                onChange={(event) => handleFieldChange("about", event.target.value)}
                placeholder="Short summary shown to travelers."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highlight">Highlights</Label>
              <Textarea
                id="highlight"
                rows={4}
                value={editedPost.highlight}
                onChange={(event) => handleFieldChange("highlight", event.target.value)}
                placeholder="Top reasons to book this experience."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packageOffer">What is included in the offer</Label>
              <Textarea
                id="packageOffer"
                rows={4}
                value={editedPost.packageOffer}
                onChange={(event) => handleFieldChange("packageOffer", event.target.value)}
                placeholder="Transport, snacks, guide fee..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="include">Inclusions</Label>
              <Textarea
                id="include"
                rows={4}
                value={editedPost.include}
                onChange={(event) => handleFieldChange("include", event.target.value)}
                placeholder="What travelers can expect."
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="fullDescription">Full description</Label>
              <Textarea
                id="fullDescription"
                rows={8}
                value={editedPost.fullDescription}
                onChange={(event) => handleFieldChange("fullDescription", event.target.value)}
                placeholder="Describe the route, experience, timing, and unique value."
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notSuitableFor">Not suitable for</Label>
                <Textarea
                  id="notSuitableFor"
                  rows={3}
                  value={editedPost.notSuitableFor}
                  onChange={(event) => handleFieldChange("notSuitableFor", event.target.value)}
                  placeholder="Children under 5, guests with mobility limits..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="importantInfo">Important information</Label>
                <Textarea
                  id="importantInfo"
                  rows={4}
                  value={editedPost.importantInfo}
                  onChange={(event) => handleFieldChange("importantInfo", event.target.value)}
                  placeholder="Meeting point, what to bring, weather notes..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.3fr,0.9fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              Availability control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Dates with confirmed or pending bookings stay locked automatically. You can add or remove only open dates.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} />
              <Button type="button" onClick={addAvailabilityDate} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Add date
              </Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Open dates</h3>
                  <Badge variant="secondary">{availableDates.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableDates.length > 0 ? (
                    availableDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => removeAvailabilityDate(date)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                      >
                        {formatLongDate(date)}
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No open dates added yet.</p>
                  )}
                </div>
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Locked booked dates</h3>
                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">{lockedDateSet.size}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(lockedDateSet).sort().length > 0 ? (
                    Array.from(lockedDateSet)
                      .sort()
                      .map((date) => (
                        <span
                          key={date}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-500"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          {formatLongDate(date)}
                        </span>
                      ))
                  ) : (
                    <p className="text-sm text-slate-500">No booked dates are locking the calendar right now.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <ImagePlus className="h-5 w-5 text-emerald-600" />
                Media gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {editedPost.photos.length > 0 ? (
                  editedPost.photos.map((photo, index) => (
                    <div key={`${photo}-${index}`} className="group relative overflow-hidden rounded-2xl border border-slate-200">
                      <Image
                        src={photo}
                        alt={`Post photo ${index + 1}`}
                        width={480}
                        height={320}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    No photos uploaded yet.
                  </div>
                )}
              </div>
              <UploadButton<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                onClientUploadComplete={(result) => {
                  if (result) {
                    handlePhotoUpload(result.map((file) => file.url));
                  }
                }}
                onUploadError={(error: Error) => {
                  window.alert(`Upload failed: ${error.message}`);
                }}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Link2 className="h-5 w-5 text-emerald-600" />
                Reference links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="offlineMapUrl">Offline map URL</Label>
                <Input
                  id="offlineMapUrl"
                  value={editedPost.offlineMapUrl ?? ""}
                  onChange={(event) => handleFieldChange("offlineMapUrl", event.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookletUrl">Booklet URL</Label>
                <Input
                  id="bookletUrl"
                  value={editedPost.bookletUrl ?? ""}
                  onChange={(event) => handleFieldChange("bookletUrl", event.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termsUrl">Terms URL</Label>
                <Input
                  id="termsUrl"
                  value={editedPost.termsUrl ?? ""}
                  onChange={(event) => handleFieldChange("termsUrl", event.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl text-slate-900">Itinerary</CardTitle>
          <Button type="button" variant="outline" onClick={addItineraryItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add stop
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editedPost.itinerary.map((item, index) => (
            <div key={`${index}-${item.title}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[0.9fr,1.4fr,auto]">
              <Input
                value={item.title}
                onChange={(event) => handleItineraryChange(index, "title", event.target.value)}
                placeholder={`Stop ${index + 1} title`}
              />
              <Textarea
                rows={3}
                value={item.content}
                onChange={(event) => handleItineraryChange(index, "content", event.target.value)}
                placeholder="Describe what happens at this stop."
              />
              <Button type="button" variant="outline" onClick={() => removeItineraryItem(index)} className="h-fit">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Close editor
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving changes..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

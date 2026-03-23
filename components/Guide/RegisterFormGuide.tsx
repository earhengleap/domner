'use client'

import React, { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  currentAddress: string;
  guideLicenseNumber: string;
  licenseExpiryDate: string;
  yearsOfExperience: string;
  areaOfExpertise: string;
  facebookLink: string;
  languagesSpoken: string[];
  specializedArea: string;
  nationalIdPassport: File | null;
  guideCertification: File | null;
}

const LANGUAGES = ['English', 'French', 'Thai', 'Chinese', 'Spanish', 'Vietnamese'];

const STEPS = [
  {
    key: 'personal',
    title: 'Personal',
    description: 'Basic identity and contact details',
    icon: UserRound,
  },
  {
    key: 'professional',
    title: 'Professional',
    description: 'License, experience, and languages',
    icon: ShieldCheck,
  },
  {
    key: 'documents',
    title: 'Documents',
    description: 'Upload verification files',
    icon: FileText,
  },
] as const;

const fieldClassName =
  'mt-2 h-12 rounded-2xl border-[#ddd2c8] bg-[#fffdfb] px-4 text-sm text-[#2d241d] placeholder:text-slate-400 focus-visible:ring-[#a18167] focus-visible:ring-offset-0';

const textareaClassName =
  'mt-2 min-h-[120px] w-full rounded-2xl border border-[#ddd2c8] bg-[#fffdfb] px-4 py-3 text-sm text-[#2d241d] placeholder:text-slate-400 outline-none transition focus:border-[#a18167] focus:ring-2 focus:ring-[#a18167]';

const selectClassName =
  'mt-2 h-12 w-full rounded-2xl border border-[#ddd2c8] bg-[#fffdfb] px-4 text-sm text-[#2d241d] outline-none transition focus:border-[#a18167] focus:ring-2 focus:ring-[#a18167]';

function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;

        return (
          <div
            key={step.key}
            className={`rounded-3xl border px-4 py-4 transition ${
              isActive
                ? 'border-[#a18167] bg-[#fff9f4] shadow-[0_18px_40px_-32px_rgba(88,63,42,0.28)]'
                : isCompleted
                  ? 'border-[#d6e6d8] bg-[#f6fbf7]'
                  : 'border-[#e8ddd2] bg-[#fffdfb]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  isActive
                    ? 'bg-[#a18167] text-white'
                    : isCompleted
                      ? 'bg-[#2d6a4f] text-white'
                      : 'bg-[#f6efe8] text-[#8b6a53]'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2d241d]">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionLabel({
  label,
  helper,
}: {
  label: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#2d241d]">{label}</label>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function FilePicker({
  id,
  label,
  file,
  required,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  required?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[#d9cec4] bg-[#fcfaf7] p-5">
      <SectionLabel label={label} helper="PDF, JPG, or PNG supported." />
      <input
        id={id}
        name={id}
        type="file"
        required={required}
        onChange={onChange}
        className="mt-3 block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-[#f1e7dd] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#6f4e37] hover:file:bg-[#e7d8ca]"
      />
      <p className="mt-3 text-sm text-[#2d241d]">{file ? file.name : 'No file selected yet'}</p>
    </div>
  );
}

function DateField({
  id,
  name,
  label,
  value,
  required,
  helper,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  required?: boolean;
  helper?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <SectionLabel label={label} helper={helper} />
      <div className="relative mt-2">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6a53]">
          <CalendarDays className="h-4.5 w-4.5" />
        </div>
        <Input
          type="date"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`${fieldClassName} pl-12 pr-4`}
          required={required}
        />
      </div>
    </div>
  );
}

const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    emailAddress: '',
    currentAddress: '',
    guideLicenseNumber: '',
    licenseExpiryDate: '',
    yearsOfExperience: '',
    areaOfExpertise: '',
    facebookLink: '',
    languagesSpoken: [],
    specializedArea: '',
    nationalIdPassport: null,
    guideCertification: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value.replace(/\D/g, ''),
      }));
      return;
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      languagesSpoken: checked
        ? [...prevState.languagesSpoken, value]
        : prevState.languagesSpoken.filter((lang) => lang !== value),
    }));
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      return Boolean(
        formData.fullName &&
          formData.dateOfBirth &&
          formData.gender &&
          formData.phoneNumber &&
          formData.emailAddress &&
          formData.currentAddress
      );
    }

    if (step === 1) {
      return Boolean(
        formData.guideLicenseNumber &&
          formData.licenseExpiryDate &&
          formData.yearsOfExperience &&
          formData.areaOfExpertise &&
          formData.languagesSpoken.length > 0
      );
    }

    return Boolean(formData.nationalIdPassport && formData.guideCertification);
  };

  const progressLabel = useMemo(() => `Step ${currentStep + 1} of ${STEPS.length}`, [currentStep]);

  const handleNext = () => {
    setError(null);
    if (!validateStep(currentStep)) {
      setError('Please complete the required fields before continuing.');
      return;
    }
    setCurrentStep((previous) => Math.min(previous + 1, STEPS.length - 1));
  };

  const handlePrevious = () => {
    setError(null);
    setCurrentStep((previous) => Math.max(previous - 1, 0));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateStep(2)) {
      setError('Please complete the required fields and uploads before submitting.');
      return;
    }

    setIsLoading(true);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof File) {
        formDataToSend.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => formDataToSend.append(key, item));
      } else {
        formDataToSend.append(key, value.toString());
      }
    });

    try {
      const response = await fetch('/api/register-guide', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error === 'You have already submitted a guide application'
        ) {
          setError(
            'You have already submitted a guide application. Please wait for it to be processed.'
          );
        } else {
          throw new Error(data.error || 'Something went wrong');
        }
      } else {
        router.push('/guide-pending');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[2rem] border border-[#e4d8cd] bg-white shadow-[0_28px_90px_-56px_rgba(38,29,21,0.45)]"
    >
      <div className="space-y-4">
        <div className="border-b border-[#efe6de] bg-[linear-gradient(180deg,_#fffdfb_0%,_#f8f3ed_100%)] px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6a53]">
                {progressLabel}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2d241d]">
                {STEPS[currentStep].title} Information
              </h2>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#6f4e37] shadow-sm">
              {STEPS[currentStep].description}
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f1e8df]">
            <div
              className="h-full rounded-full bg-[#a18167] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="px-5 py-5 sm:px-8">
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      <div className="space-y-8 px-5 pb-5 sm:px-8 sm:pb-8">
      {currentStep === 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-5 rounded-[1.75rem] border border-[#ece2d8] bg-[#fffdfb] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6a53]">
                Identity
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Add your basic personal details exactly as they appear on your documents.
              </p>
            </div>

            <div>
              <SectionLabel label="Full name" />
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={fieldClassName}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <DateField
                id="dateOfBirth"
                name="dateOfBirth"
                label="Date of birth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
              <div>
                <SectionLabel label="Gender" />
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={selectClassName}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-[1.75rem] border border-[#ece2d8] bg-white p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6a53]">
                Contact
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Make sure these details are active so the review team can reach you if needed.
              </p>
            </div>

            <div>
              <SectionLabel label="Phone number" helper="Numbers only" />
              <Input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={fieldClassName}
                required
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <SectionLabel label="Email address" />
              <Input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                className={fieldClassName}
                required
              />
            </div>

            <div>
              <SectionLabel label="Current address" />
              <textarea
                id="currentAddress"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleInputChange}
                rows={5}
                className={textareaClassName}
                required
              />
            </div>
          </div>
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <SectionLabel label="Guide license number" />
            <Input
              id="guideLicenseNumber"
              name="guideLicenseNumber"
              value={formData.guideLicenseNumber}
              onChange={handleInputChange}
              className={fieldClassName}
              required
            />
          </div>
          <div>
            <DateField
              id="licenseExpiryDate"
              name="licenseExpiryDate"
              label="License expiry date"
              value={formData.licenseExpiryDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <SectionLabel label="Years of experience" />
            <Input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleInputChange}
              min="0"
              className={fieldClassName}
              required
            />
          </div>
          <div>
            <SectionLabel label="Area of expertise" />
            <Input
              id="areaOfExpertise"
              name="areaOfExpertise"
              value={formData.areaOfExpertise}
              onChange={handleInputChange}
              className={fieldClassName}
              required
            />
          </div>
          <div className="md:col-span-2">
            <SectionLabel label="Facebook link" helper="Optional" />
            <Input
              type="url"
              id="facebookLink"
              name="facebookLink"
              value={formData.facebookLink}
              onChange={handleInputChange}
              className={fieldClassName}
              placeholder="https://facebook.com/your-profile"
            />
          </div>
          <div className="md:col-span-2">
            <SectionLabel label="Languages spoken" helper="Choose at least one" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LANGUAGES.map((language) => (
                <label
                  key={language}
                  htmlFor={`language-${language}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                    formData.languagesSpoken.includes(language)
                      ? 'border-[#a18167] bg-[#fff8f2] text-[#2d241d]'
                      : 'border-[#e4d8cd] bg-white text-slate-600'
                  }`}
                >
                  <input
                    id={`language-${language}`}
                    name="languagesSpoken"
                    type="checkbox"
                    value={language}
                    checked={formData.languagesSpoken.includes(language)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-[#cdb9a8] text-[#a18167] focus:ring-[#a18167]"
                  />
                  <span>{language}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <SectionLabel label="Specialized area" helper="Optional" />
            <Input
              id="specializedArea"
              name="specializedArea"
              value={formData.specializedArea}
              onChange={handleInputChange}
              className={fieldClassName}
              placeholder="Wildlife tours, temples, food tours..."
            />
          </div>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="space-y-5">
          <FilePicker
            id="nationalIdPassport"
            label="National ID or passport"
            file={formData.nationalIdPassport}
            required
            onChange={handleFileChange}
          />
          <FilePicker
            id="guideCertification"
            label="Guide certification"
            file={formData.guideCertification}
            required
            onChange={handleFileChange}
          />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[#efe6de] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          Review each step carefully before submitting your guide application.
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="rounded-full border-[#d7c0af] px-5"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : null}

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-[#2f251d] px-5 text-white hover:bg-[#1f1812]"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-[#2f251d] px-6 text-white hover:bg-[#1f1812]"
            >
              {isLoading ? 'Submitting...' : 'Submit application'}
            </Button>
          )}
        </div>
      </div>
      </div>
    </form>
  );
};

export default RegistrationForm;

// File: app/api/register-guide/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createClient } from "@supabase/supabase-js";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function uploadFileToSupabase(
  file: File,
  userEmail: string,
  documentType: string
): Promise<string> {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;
  const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, "_");
  const filePath = `${sanitizedEmail}/${documentType}/${uniqueFileName}`;

  const { data, error } = await supabase.storage
    .from("guide-documents")
    .upload(filePath, file);

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(`Error uploading file: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("guide-documents")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user already has a guide form
    const existingGuideForm = await prisma.guideForm.findUnique({
      where: { userId: session.user.id },
    });

    if (existingGuideForm) {
      return NextResponse.json({ error: 'You have already submitted a guide application' }, { status: 400 });
    }

    const formData = await req.formData();
    
    const data: Prisma.GuideFormCreateInput = {
      fullName: formData.get('fullName') as string,
      dateOfBirth: new Date(formData.get('dateOfBirth') as string),
      gender: formData.get('gender') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      emailAddress: formData.get('emailAddress') as string,
      currentAddress: formData.get('currentAddress') as string,
      guideLicenseNumber: formData.get('guideLicenseNumber') as string,
      licenseExpiryDate: new Date(formData.get('licenseExpiryDate') as string),
      yearsOfExperience: parseInt(formData.get('yearsOfExperience') as string),
      areaOfExpertise: formData.get('areaOfExpertise') as string,
      facebookLink: formData.get('facebookLink') as string | null,
      languagesSpoken: formData.getAll('languagesSpoken') as string[],
      specializedArea: formData.get('specializedArea') as string | null,
      status: 'PENDING',
      user: {
        connect: { id: session.user.id }
      }
    };

    const nationalIdPassport = formData.get('nationalIdPassport') as File;
    const guideCertification = formData.get('guideCertification') as File;

    if (nationalIdPassport) {
      data.nationalIdPassportUrl = await uploadFileToSupabase(
        nationalIdPassport,
        session.user.email as string,
        "nationalIdPassport"
      );
    }

    if (guideCertification) {
      data.guideCertificationUrl = await uploadFileToSupabase(
        guideCertification,
        session.user.email as string,
        "guideCertification"
      );
    }

    const newGuideForm = await prisma.guideForm.create({ data });

    return NextResponse.json({ message: 'Application submitted successfully', data: newGuideForm }, { status: 201 });
  } catch (error) {
    console.error('Error in guide registration:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'You have already submitted a guide application' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'An error occurred while processing your application' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
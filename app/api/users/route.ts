import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: any) {
  try {
    const { name, email, password, role } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedName = name?.trim();

    if (!normalizedName || !normalizedEmail || !password) {
      return NextResponse.json(
        {
          message: "Name, email, and password are required.",
          user: null,
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters long.",
          user: null,
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          message: "Authentication service is not configured correctly.",
          user: null,
        },
        { status: 500 }
      );
    }

    // Check if user email already exists in your database
    const userExist = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (userExist) {
      return NextResponse.json(
        {
          message: "User already exists",
          user: null,
        },
        { status: 409 }
      );
    }

    // Register user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      console.error(authError);
      const duplicateEmail =
        authError.status === 422 ||
        authError.message.toLowerCase().includes("already") ||
        authError.message.toLowerCase().includes("registered");

      return NextResponse.json(
        {
          message: duplicateEmail
            ? "This email is already registered."
            : `Supabase Auth Error: ${authError.message}`,
          user: null,
        },
        { status: duplicateEmail ? 409 : 500 }
      );
    }

    // Get the Supabase user ID
    const supabaseUserId = data.user?.id;

    if (!supabaseUserId) {
      return NextResponse.json(
        {
          message: "Failed to retrieve Supabase user ID",
          user: null,
        },
        { status: 500 }
      );
    }

    // If Supabase auth is successful, hash the password and save the user in your own DB
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: {
        id: supabaseUserId,
        name: normalizedName,
        email: normalizedEmail,
        hashedPassword,
        role: role || "USER",
        image: "/default-image.png",
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error,
        message: "Server Error: Something went wrong",
      },
      { status: 500 }
    );
  }
}

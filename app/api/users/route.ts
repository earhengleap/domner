import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_KEY in environment variables."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: any) {
  try {
    const { name, email, password, role } = await request.json();

    // Check if user email already exists in your database
    const userExist = await db.user.findUnique({
      where: { email },
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
      email,
      password,
    });

    if (authError) {
      console.error(authError);
      return NextResponse.json(
        {
          message: "Supabase Auth Error: " + authError.message,
          user: null,
        },
        { status: 500 }
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
        name,
        email,
        password,
        hashedPassword,
        role,
      },
    });

    console.log(newUser);
    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error,
        message: "Server Error: Something went wrong",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

console.log("🔍 REGISTER - Initial users:", db.users);
console.log("🔍 REGISTER - Array memory location:", db.users);

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db.users.find((user) => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: (db.users.length + 1).toString(),
      email,
      password, // In production, hash this!
      name,
    };

    db.users.push(newUser);
    console.log("Registered user:", newUser); // Debug log
    console.log("All users:", db.users); // Debug log

    return NextResponse.json(
      { message: "User created successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
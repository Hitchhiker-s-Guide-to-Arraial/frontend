import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Forward to FastAPI /register (not /api/register unless you mounted it)
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Registration failed" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully", user: data },
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

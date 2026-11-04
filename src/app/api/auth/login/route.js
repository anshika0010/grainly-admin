import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL;
    console.log("BASE_URL:", JSON.stringify(baseUrl));

    const response = await fetch(
      `${baseUrl}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Login Route Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
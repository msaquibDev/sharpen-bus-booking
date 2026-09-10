import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string" ? body.username.trim() : "";

    const password = typeof body.password === "string" ? body.password : "";

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error("ADMIN_USERNAME or ADMIN_PASSWORD is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Admin authentication is not configured.",
        },
        { status: 500 },
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password.",
        },
        { status: 401 },
      );
    }

    await createAdminSession(username);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to login.",
      },
      { status: 500 },
    );
  }
}

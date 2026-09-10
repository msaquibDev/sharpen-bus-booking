import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/admin-auth";

export async function POST() {
  try {
    await destroyAdminSession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to logout.",
      },
      { status: 500 },
    );
  }
}

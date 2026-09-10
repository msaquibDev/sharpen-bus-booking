import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { EVENT, formatSlotTime } from "@/lib/booking-config";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

async function checkAuth() {
  return await isAdminAuthenticated();
}

export async function HEAD() {
  const authenticated = await checkAuth();

  if (!authenticated) {
    return new NextResponse(null, {
      status: 401,
    });
  }

  return new NextResponse(null, {
    status: 200,
  });
}

export async function GET() {
  try {
    const authenticated = await checkAuth();

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    await connectToDatabase();

    const bookingDate = EVENT.dates[0];

    const bookings = await Booking.find({
      date: bookingDate,
      status: "CONFIRMED",
    })
      .sort({
        slotTime: 1,
        createdAt: 1,
      })
      .lean();

    const headers = [
      "Booking ID",
      "Date",
      "Bus Slot",
      "Name",
      "Email",
      "Mobile",
      "Pickup",
      "Drop",
      "Status",
      "Booked At",
    ];

    const rows = bookings.map((booking) => [
      booking.bookingId,
      booking.date,
      formatSlotTime(booking.slotTime),
      booking.name,
      booking.email,
      booking.mobile,
      booking.pickup,
      booking.drop,
      booking.status,
      booking.createdAt
        ? new Date(booking.createdAt).toLocaleString("en-IN")
        : "",
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="sharpen-the-edge-bus-bookings-2026-09-12.csv"',
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("CSV download error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to download bookings CSV.",
      },
      {
        status: 500,
      },
    );
  }
}

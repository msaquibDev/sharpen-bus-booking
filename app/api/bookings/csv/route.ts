import { NextResponse } from "next/server";
import { EVENT, formatSlotTime } from "@/lib/booking-config";
import { Booking } from "@/models/Booking";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    await connectDB();

    // Only export bookings for 12 September 2026
    const bookings = await Booking.find({
      date: EVENT.dates[0],
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
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("CSV download error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to download bookings CSV.",
      },
      { status: 500 },
    );
  }
}
function connectDB() {
  throw new Error("Function not implemented.");
}

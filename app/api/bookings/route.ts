import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { BusSlot } from '@/models/BusSlot';
import { EVENT, SLOT_CAPACITY } from '@/lib/booking-config';
import { sendBookingConfirmation } from '@/lib/zeptomail';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const indianMobilePattern = /^(?:\+91)?[6-9]\d{9}$/;

function makeBookingId(date: string): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `STE-${date.replaceAll('-', '')}-${suffix}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: 'Please check the details and try again.' }, { status: 400 });
  }

  const date = typeof body.date === 'string' ? body.date : '';
  const slotTime = typeof body.slotTime === 'string' ? body.slotTime : '';
  const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const rawMobile = typeof body.mobile === 'string' ? body.mobile.trim().replace(/[\s-]/g, '') : '';
  const mobile = rawMobile.startsWith('+91') ? rawMobile.slice(3) : rawMobile;

  if (!EVENT.dates.includes(date as typeof EVENT.dates[number]) || !/^\d{2}:\d{2}$/.test(slotTime)) {
    return NextResponse.json({ success: false, message: 'Please choose a valid date and bus slot.' }, { status: 400 });
  }
  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ success: false, message: 'Please enter your full name.' }, { status: 400 });
  }
  if (!emailPattern.test(email) || email.length > 160) {
    return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!indianMobilePattern.test(rawMobile)) {
    return NextResponse.json({ success: false, message: 'Please enter a valid Indian mobile number.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const recentBooking = await Booking.findOne({ date, slotTime, email, mobile, status: 'CONFIRMED', createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } }).lean();
    if (recentBooking) return NextResponse.json({ success: true, bookingId: recentBooking.bookingId, duplicate: true });

    const slot = await BusSlot.findOneAndUpdate(
      { date, slotTime, $expr: { $lt: ['$bookedCount', '$capacity'] } },
      { $inc: { bookedCount: 1 }, $setOnInsert: { capacity: SLOT_CAPACITY } },
      { new: true, upsert: true },
    );
    if (!slot || slot.bookedCount > slot.capacity) {
      if (slot) await BusSlot.updateOne({ _id: slot._id }, { $inc: { bookedCount: -1 } });
      return NextResponse.json({ success: false, message: 'Sorry, this slot was just filled. Please choose another slot.' }, { status: 409 });
    }

    const bookingId = makeBookingId(date);
    try {
      await Booking.create({ bookingId, date, slotTime, name, email, mobile, pickup: EVENT.pickup, drop: EVENT.drop, status: 'CONFIRMED' });
      await sendBookingConfirmation({ bookingId, date, slotTime, name, email, mobile });
    } catch {
      await BusSlot.updateOne({ _id: slot._id, bookedCount: { $gt: 0 } }, { $inc: { bookedCount: -1 } });
      await Booking.deleteOne({ bookingId });
      return NextResponse.json({ success: false, message: 'We could not complete the booking email. No seat was reserved. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, bookingId });
  } catch {
    return NextResponse.json({ success: false, message: 'We could not complete your booking right now. Please try again.' }, { status: 503 });
  }
}

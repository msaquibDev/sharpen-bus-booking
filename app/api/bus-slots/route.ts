import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EVENT, SLOT_CAPACITY, SLOT_TIMES, formatSlotTime } from '@/lib/booking-config';
import { BusSlot } from '@/models/BusSlot';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get('date');
  if (!date || !EVENT.dates.includes(date as typeof EVENT.dates[number])) {
    return NextResponse.json({ message: 'Please choose a valid convention date.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    await BusSlot.bulkWrite(SLOT_TIMES.map((slotTime) => ({
      updateOne: { filter: { date, slotTime }, update: { $setOnInsert: { date, slotTime, capacity: SLOT_CAPACITY, bookedCount: 0 } }, upsert: true },
    })));
    const slots = await BusSlot.find({ date }).sort({ slotTime: 1 }).lean();
    return NextResponse.json(slots.map((slot) => ({
      time: slot.slotTime,
      displayTime: formatSlotTime(slot.slotTime),
      capacity: slot.capacity,
      booked: slot.bookedCount,
      available: Math.max(slot.capacity - slot.bookedCount, 0),
      isFull: slot.bookedCount >= slot.capacity,
    })));
  } catch {
    return NextResponse.json({ message: 'We could not load the bus slots right now.' }, { status: 503 });
  }
}

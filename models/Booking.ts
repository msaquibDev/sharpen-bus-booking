import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const bookingSchema = new Schema({
  bookingId: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  slotTime: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  pickup: { type: String, required: true },
  drop: { type: String, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
}, { timestamps: true });

bookingSchema.index({ date: 1, slotTime: 1, email: 1, mobile: 1, createdAt: -1 });

export type BookingDocument = InferSchemaType<typeof bookingSchema>;
export const Booking = (mongoose.models.Booking as Model<BookingDocument>) || mongoose.model<BookingDocument>('Booking', bookingSchema);

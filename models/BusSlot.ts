import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const busSlotSchema = new Schema({
  date: { type: String, required: true },
  slotTime: { type: String, required: true },
  capacity: { type: Number, required: true, default: 40 },
  bookedCount: { type: Number, required: true, default: 0 },
}, { timestamps: true });

busSlotSchema.index({ date: 1, slotTime: 1 }, { unique: true });

export type BusSlotDocument = InferSchemaType<typeof busSlotSchema>;
export const BusSlot = (mongoose.models.BusSlot as Model<BusSlotDocument>) || mongoose.model<BusSlotDocument>('BusSlot', busSlotSchema);

"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BusFront,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  UserRound,
  X,
} from "lucide-react";
import {
  EVENT,
  formatEventDate,
  formatSlotTime,
  getDateParts,
  SLOT_TIMES,
} from "@/lib/booking-config";

type Slot = {
  time: string;
  displayTime: string;
  capacity: number;
  booked: number;
  available: number;
  isFull: boolean;
};
type FormData = { name: string; email: string; mobile: string };

const initialForm: FormData = { name: "", email: "", mobile: "" };

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
}: {
  label: string;
  name: keyof FormData;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: typeof UserRound;
  error?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <span className="field-control">
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
        <input
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={
            name === "name" ? "name" : name === "email" ? "email" : "tel"
          }
        />
      </span>
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(EVENT.dates[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  async function loadSlots(date: string) {
    setLoadingSlots(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/bus-slots?date=${date}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as Slot[] | { message?: string };
      if (!response.ok || !Array.isArray(data))
        throw new Error("Unable to load slots");
      setSlots(data);
    } catch {
      setSlots([]);
      setLoadError("We could not load availability. Please try again.");
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    void loadSlots(selectedDate);
  }, [selectedDate]);

  const selectedDateLabel = useMemo(
    () => formatEventDate(selectedDate),
    [selectedDate],
  );

  function updateForm(key: keyof FormData, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setFormError("");
  }

  function validate(): Partial<FormData> {
    const nextErrors: Partial<FormData> = {};
    if (form.name.trim().length < 2)
      nextErrors.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      nextErrors.email = "Please enter a valid email.";
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(form.mobile.replace(/[\s-]/g, "")))
      nextErrors.mobile = "Enter a valid Indian mobile number.";
    return nextErrors;
  }

  async function submitBooking() {
    if (!selectedSlot) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: selectedDate,
          slotTime: selectedSlot.time,
        }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        bookingId?: string;
        message?: string;
      };
      if (!response.ok || !data.success || !data.bookingId)
        throw new Error(data.message || "Unable to confirm booking");
      setConfirmation(data.bookingId);
      setSelectedSlot(null);
      setForm(initialForm);
      void loadSlots(selectedDate);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not confirm your booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <Confirmation
        bookingId={confirmation}
        date={selectedDateLabel}
        slot={selectedSlot}
        email={form.email}
        onReset={() => {
          setConfirmation("");
          setSelectedSlot(null);
        }}
      />
    );
  }

  return (
    <main>
      <section className="hero-shell">
        <div className="hero-topbar">
          <div className="brand-mark">
            <Image
              src="/images/sharpen-logo.png"
              alt="Sharpen The Edge"
              width={144}
              height={96}
              priority
            />
          </div>
          <div className="secure-label">
            <ShieldCheck size={16} /> Secure seat booking
          </div>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">2026 National Convention</p>
            <h1>
              Arrive ready.
              <br />
              <em>Travel together.</em>
            </h1>
            <p className="hero-intro">
              Reserve your complimentary bus seat for Sharpen The Edge in
              Hyderabad.
            </p>
            <div className="event-meta">
              <span>
                <Clock3 size={16} /> 10–12 September 2026
              </span>
              <span>
                <MapPin size={16} /> Hyderabad, India
              </span>
            </div>
          </div>
          {/* <div className="hero-image-wrap"><Image src="/images/sharpen-banner.png" alt="Sharpen The Edge 2026 National Convention" fill priority sizes="(max-width: 768px) 100vw, 48vw" className="hero-image" /></div> */}
        </div>
      </section>

      <section className="booking-section" id="booking">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Choose your journey</p>
            <h2>Where are you travelling?</h2>
          </div>
          <span className="step-count">
            01 <span>/ 02</span>
          </span>
        </div>
        <div className="route-card">
          <div className="route-point">
            <span className="route-dot pickup-dot" />
            <div>
              <small>PICKUP</small>
              <strong>{EVENT.pickup}</strong>
            </div>
          </div>
          <div className="route-line">
            <ArrowDown size={18} />
          </div>
          <div className="route-point">
            <span className="route-dot drop-dot" />
            <div>
              <small>DROP</small>
              <strong>{EVENT.drop}</strong>
            </div>
          </div>
        </div>

        <div className="section-heading date-heading">
          <div>
            <p className="eyebrow dark">Select a date</p>
            <h2>When will you join us?</h2>
          </div>
        </div>
        <div className="date-grid">
          {EVENT.dates.map((date) => {
            const parts = getDateParts(date);
            return (
              <button
                key={date}
                className={`date-card ${selectedDate === date ? "selected" : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                <span>{parts.weekday}</span>
                <b>{parts.day}</b>
                <small>{parts.month} 2026</small>
                {selectedDate === date && (
                  <i>
                    <Check size={14} />
                  </i>
                )}
              </button>
            );
          })}
        </div>

        <div className="section-heading slots-heading">
          <div>
            <p className="eyebrow dark">Available departures</p>
            <h2>Pick a bus slot</h2>
          </div>
          <span className="availability-note">
            <BusFront size={17} /> 40 seats per bus
          </span>
        </div>
        {loadError && (
          <div className="notice error-notice">
            {loadError}{" "}
            <button onClick={() => void loadSlots(selectedDate)}>
              Try again
            </button>
          </div>
        )}
        {loadingSlots ? (
          <div className="slot-grid">
            {SLOT_TIMES.slice(0, 6).map((time) => (
              <div className="slot-skeleton" key={time} />
            ))}
          </div>
        ) : (
          <div className="slot-grid">
            {slots.map((slot) => (
              <article
                className={`slot-card ${slot.isFull ? "full" : ""}`}
                key={slot.time}
              >
                <div className="slot-top">
                  <span className="slot-time">{slot.displayTime}</span>
                  <span
                    className={`slot-status ${slot.isFull ? "status-full" : slot.available <= 5 ? "status-low" : ""}`}
                  >
                    {slot.isFull
                      ? "FULL"
                      : slot.available <= 5
                        ? "Almost full"
                        : "Available"}
                  </span>
                </div>
                <div className="slot-route">
                  <span>{EVENT.pickup}</span>
                  <ArrowRight size={17} />
                  <span>{EVENT.drop}</span>
                </div>
                <div className="slot-bottom">
                  <strong>
                    {slot.isFull ? (
                      "No seats available"
                    ) : (
                      <>
                        {slot.available} <small>seats available</small>
                      </>
                    )}
                  </strong>
                  <button
                    disabled={slot.isFull}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setFormError("");
                    }}
                  >
                    {" "}
                    {slot.isFull ? "Fully booked" : "Book this slot"}{" "}
                    <ChevronRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <footer>
        <Image
          src="/images/sharpen-logo.png"
          alt="Sharpen The Edge"
          width={86}
          height={58}
        />
        <span>Travel desk · 2026 National Convention</span>
      </footer>
      {selectedSlot && (
        <BookingPanel
          date={selectedDateLabel}
          slot={selectedSlot}
          form={form}
          errors={errors}
          formError={formError}
          submitting={submitting}
          onClose={() => !submitting && setSelectedSlot(null)}
          onUpdate={updateForm}
          onSubmit={() => void submitBooking()}
        />
      )}
    </main>
  );
}

function BookingPanel({
  date,
  slot,
  form,
  errors,
  formError,
  submitting,
  onClose,
  onUpdate,
  onSubmit,
}: {
  date: string;
  slot: Slot;
  form: FormData;
  errors: Partial<FormData>;
  formError: string;
  submitting: boolean;
  onClose: () => void;
  onUpdate: (key: keyof FormData, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
    >
      <div className="booking-panel">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close booking form"
        >
          <X size={20} />
        </button>
        <div className="panel-heading">
          <p className="eyebrow dark">Almost there</p>
          <h2 id="booking-title">Reserve your seat</h2>
          <p>Tell us who will be travelling on this bus.</p>
        </div>
        <div className="selected-summary">
          <div>
            <small>YOUR SELECTED BUS</small>
            <strong>
              {date} · {slot.displayTime}
            </strong>
          </div>
          <div className="summary-route">
            {EVENT.pickup}
            <ArrowRight size={15} />
            {EVENT.drop}
          </div>
        </div>
        <div className="form-fields">
          <Field
            label="Full name"
            name="name"
            value={form.name}
            onChange={(value) => onUpdate("name", value)}
            placeholder="e.g. John Doe"
            icon={UserRound}
            error={errors.name}
          />
          <Field
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={(value) => onUpdate("email", value)}
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email}
          />
          <Field
            label="Mobile number"
            name="mobile"
            type="tel"
            value={form.mobile}
            onChange={(value) => onUpdate("mobile", value)}
            placeholder="98765 43210"
            icon={Smartphone}
            error={errors.mobile}
          />
        </div>
        {formError && <div className="notice error-notice">{formError}</div>}
        <button
          className="confirm-button"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Confirming booking…" : "Confirm booking"}{" "}
          {!submitting && <ChevronRight size={18} />}
        </button>
        <p className="privacy-note">
          <ShieldCheck size={14} /> Your details are used only for this bus
          reservation.
        </p>
      </div>
    </div>
  );
}

function Confirmation({
  bookingId,
  date,
  slot,
  email,
  onReset,
}: {
  bookingId: string;
  date: string;
  slot: Slot | null;
  email: string;
  onReset: () => void;
}) {
  return (
    <main className="confirmation-page">
      <div className="confirmation-card">
        <div className="success-icon">
          <Check size={28} />
        </div>
        <p className="eyebrow dark">Seat reserved</p>
        <h1>Booking confirmed.</h1>
        <p className="confirmation-lead">
          Your bus seat has been successfully reserved. We look forward to
          welcoming you.
        </p>
        <div className="booking-id">
          <small>BOOKING ID</small>
          <strong>{bookingId}</strong>
        </div>
        <div className="confirmation-details">
          <div>
            <small>Date</small>
            <strong>{date}</strong>
          </div>
          <div>
            <small>Bus time</small>
            <strong>{slot?.displayTime || "Selected slot"}</strong>
          </div>
          <div>
            <small>Pickup</small>
            <strong>{EVENT.pickup}</strong>
          </div>
          <div>
            <small>Drop</small>
            <strong>{EVENT.drop}</strong>
          </div>
        </div>
        <div className="email-sent">
          <Mail size={18} />
          <span>
            A confirmation email has been sent to
            <br />
            <strong>{email || "your email address"}</strong>
          </span>
        </div>
        <button className="confirm-button" onClick={onReset}>
          Book another slot <ChevronRight size={18} />
        </button>
      </div>
    </main>
  );
}

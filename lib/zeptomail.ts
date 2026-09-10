import { EVENT, formatEventDate, formatSlotTime } from "./booking-config";

export type BookingEmail = {
  bookingId: string;
  date: string;
  slotTime: string;
  name: string;
  email: string;
  mobile: string;
};

export async function sendBookingConfirmation(
  booking: BookingEmail,
): Promise<boolean> {
  const zeptoUrl = process.env.ZEPTO_URL;
  const zeptoToken = process.env.ZEPTO_TOKEN;
  const zeptoFrom = process.env.ZEPTO_FROM;

  // If ZeptoMail environment variables are missing,
  // do not fail the actual booking.
  if (!zeptoUrl || !zeptoToken || !zeptoFrom) {
    console.error("ZeptoMail environment variables are missing:", {
      ZEPTO_URL: Boolean(zeptoUrl),
      ZEPTO_TOKEN: Boolean(zeptoToken),
      ZEPTO_FROM: Boolean(zeptoFrom),
    });

    return false;
  }

  try {
    const response = await fetch(zeptoUrl, {
      method: "POST",

      headers: {
        Authorization: `Zoho-enczapikey ${zeptoToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        from: {
          address: zeptoFrom,
          name: EVENT.name,
        },

        to: [
          {
            email_address: {
              address: booking.email,
              name: booking.name,
            },
          },
        ],

        subject: "Bus Booking Confirmation - Sharpen The Edge 2026",

        htmlbody: `
          <div style="
            margin:0;
            background:#f4f7f7;
            padding:32px 16px;
            font-family:Arial,sans-serif;
            color:#142329;
          ">
            <div style="
              max-width:600px;
              margin:0 auto;
              background:#fff;
              border-radius:20px;
              overflow:hidden;
              border:1px solid #dce5e5;
            ">

              <div style="
                background:#102f35;
                padding:28px 32px;
                color:#fff;
              ">
                <div style="
                  font-size:12px;
                  letter-spacing:2px;
                  color:#c7d88b;
                  font-weight:bold;
                ">
                  SHARPEN THE EDGE
                </div>

                <h1 style="
                  font-size:28px;
                  margin:12px 0 4px;
                ">
                  Booking confirmed
                </h1>

                <p style="
                  margin:0;
                  color:#d9e6e4;
                ">
                  2026 National Convention, Hyderabad, India
                </p>
              </div>

              <div style="padding:32px">

                <p style="
                  font-size:16px;
                  line-height:1.6;
                ">
                  Hi ${booking.name}, your bus seat has been successfully reserved.
                </p>

                <div style="
                  background:#f3f7f4;
                  border-radius:12px;
                  padding:20px;
                  margin:24px 0;
                ">

                  <p style="
                    margin:0 0 12px;
                    color:#627276;
                    font-size:12px;
                    text-transform:uppercase;
                    letter-spacing:1px;
                  ">
                    Booking ID
                  </p>

                  <p style="
                    margin:0 0 20px;
                    font-size:20px;
                    font-weight:bold;
                    color:#102f35;
                  ">
                    ${booking.bookingId}
                  </p>

                  <p style="margin:7px 0">
                    <strong>Date:</strong>
                    ${formatEventDate(booking.date)}
                  </p>

                  <p style="margin:7px 0">
                    <strong>Bus time:</strong>
                    ${formatSlotTime(booking.slotTime)}
                  </p>

                  <p style="margin:7px 0">
                    <strong>Name:</strong>
                    ${booking.name}
                  </p>

                  <p style="margin:7px 0">
                    <strong>Email:</strong>
                    ${booking.email}
                  </p>

                  <p style="margin:7px 0">
                    <strong>Mobile:</strong>
                    ${booking.mobile}
                  </p>

                </div>

                <p style="
                  line-height:1.7;
                  margin:0;
                ">
                  <strong>Pickup:</strong>
                  ${EVENT.pickup}
                  <br />

                  <strong>Drop:</strong>
                  ${EVENT.drop}
                </p>

                <p style="
                  color:#627276;
                  font-size:13px;
                  line-height:1.6;
                  margin-top:28px;
                ">
                  Please keep this email handy for your journey.
                </p>

              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("ZeptoMail rejected email:", {
        status: response.status,
        statusText: response.statusText,
        response: errorText,
      });

      return false;
    }

    return true;
  } catch (error) {
    console.error("ZeptoMail request failed:", error);

    return false;
  }
}

import { getSupabaseClient } from "../supabase";
import type { QuoteRequest } from "../../types";

const ADMIN_EMAIL = "dudesonwill@gmail.com";

async function sendBrevoEmail(data: {
  to: { email: string }[];
  sender: { name: string; email: string };
  subject: string;
  htmlContent: string;
}) {
  const response = await fetch("http://localhost:3000/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: data.sender.email,
      subject: data.subject,
      text: data.htmlContent,
    }),
  });

  const data1 = await response.json();
  console.log("Email sent successfully:", data1);

  return response.json();
}

export async function sendQuoteNotification(data: QuoteRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    // Store email in sent_emails table first
    // const { error: dbError } = await supabase.from("sent_emails").insert({
    //   access_code_id: access_code.id,
    //   recipient_email: ADMIN_EMAIL,
    //   subject: `New Quote Request from ${data.name}`,
    //   body: formatQuoteEmail(data),
    //   sent_by: data.email,
    //   status: "pending",
    // });
    // console.log(access_code);

    // if (dbError) throw dbError;

    // Send email via Brevo API
    await sendBrevoEmail({
      to: "dudesonwill@gmail.com",
      sender: {
        name: "LightShowVault",
        email: data.email,
      },
      subject: `New Quote Request from ${data.name}`,
      htmlContent: formatQuoteEmail(data),
    });

    // Update email status to sent
    await supabase
      .from("sent_emails")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("recipient_email", ADMIN_EMAIL)
      .eq("status", "pending");

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendAccessCodeEmail(
  accessCodeId: string,
  recipientEmail: string,
  customMessage?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    // Get access code details
    const { data: accessCode, error: accessCodeError } = await supabase
      .from("access_codes")
      .select("*")
      .eq("id", accessCodeId)
      .single();

    if (accessCodeError || !accessCode) {
      throw new Error("Access code not found");
    }

    // Create email content
    const body = customMessage || formatAccessCodeEmail(accessCode);

    // Store email in sent_emails table first
    const { error: dbError } = await supabase.from("sent_emails").insert({
      access_code_id: accessCodeId,
      recipient_email: recipientEmail,
      subject: "Your LightShowVault Access Code",
      body,
      status: "pending",
    });

    if (dbError) throw dbError;

    // Send email via Brevo API
    await sendBrevoEmail({
      to: [{ email: recipientEmail }],
      sender: {
        name: "LightShowVault",
        email: "noreply@lightshowvault.com",
      },
      subject: "Your LightShowVault Access Code",
      htmlContent: body,
    });

    // Update email status to sent
    await supabase
      .from("sent_emails")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("access_code_id", accessCodeId)
      .eq("status", "pending");
  } catch (error) {
    console.error("Failed to send access code email:", error);
    throw error;
  }
}

function formatQuoteEmail(data: QuoteRequest): string {
  return `
    <h2>New Quote Request</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
    <p><strong>Timeline:</strong> ${data.timeline}</p>
    <p><strong>Budget:</strong> ${data.budget}</p>
    <p><strong>Notes:</strong> ${data.notes || "None"}</p>
    <p><a href="https://lightshowvault.com/admin/quotes">View request in admin dashboard</a></p>
  `.trim();
}

function formatAccessCodeEmail(accessCode: any): string {
  return `
    <h2>Your LightShowVault Access Code</h2>
    <p>Here's your access code: <strong>${accessCode.code}</strong></p>
    ${accessCode.description ? `<p>${accessCode.description}</p>` : ""}
    ${
      accessCode.expires_at
        ? `<p>This code expires on ${new Date(
            accessCode.expires_at
          ).toLocaleDateString()}</p>`
        : ""
    }
    <p>Visit <a href="https://lightshowvault.com">LightShowVault</a> to use your code.</p>
  `.trim();
}

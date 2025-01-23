import { getSupabaseClient } from "../supabase";
import type { QuoteRequest } from "../../types";

const ADMIN_EMAIL = "dudesonwill@gmail.com";

async function sendBrevoEmail(data: { 
  recipient_email: string;
  subject: string;
  content: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  // Store email in notifications table
  const { error } = await supabase
    .from('email_notifications')
    .insert({
      recipient_email: data.recipient_email,
      subject: data.subject,
      content: data.content,
      status: 'pending'
    });

  if (error) {
    console.error('Failed to queue email notification:', error);
    throw error;
  }
}

export async function sendQuoteNotification(data: QuoteRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    await sendBrevoEmail({
      recipient_email: "dudesonwill@gmail.com",
      subject: `New Quote Request from ${data.name}`,
      content: formatQuoteEmail(data)
    });

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

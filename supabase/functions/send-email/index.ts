import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const formData = await req.formData();
    const pdfFile = formData.get("pdf");
    if (!pdfFile || !(pdfFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Missing pdf file attachment in form-data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get metadata from form-data to customize the email subject and body
    const wagenNummer = formData.get("wagenNummer") || "Onbekend";
    const driverName = formData.get("naam") || "Onbekend";
    const datum = formData.get("datum") || "Onbekend";

    // Get environment variables configured as Supabase Secrets
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendSender = Deno.env.get("RESEND_SENDER");
    const resendRecipient = Deno.env.get("RESEND_RECIPIENT");

    if (!resendApiKey || !resendSender || !resendRecipient) {
      console.error("Missing environment variables configuration in Supabase Secrets.");
      return new Response(
        JSON.stringify({ error: "Server configuration missing: RESEND_API_KEY, RESEND_SENDER, or RESEND_RECIPIENT is not set." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Read and encode PDF file to base64
    const arrayBuffer = await pdfFile.arrayBuffer();
    const base64Content = encode(arrayBuffer);

    // Call Resend API to dispatch the email with the attachment
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: resendSender,
        to: resendRecipient.split(",").map(email => email.trim()),
        subject: `Rittenstaat - Wagennummer ${wagenNummer} - ${driverName} - ${datum}`,
        html: `
          <h3>Nieuwe Rittenstaat Ingediend</h3>
          <p>Hierbij ontvangt u de rittenstaat in PDF-formaat.</p>
          <ul>
            <li><strong>Chauffeur:</strong> ${driverName}</li>
            <li><strong>Wagennummer:</strong> ${wagenNummer}</li>
            <li><strong>Datum:</strong> ${datum}</li>
          </ul>
          <p>Met vriendelijke groet,<br>Taxi Livo App</p>
        `,
        attachments: [
          {
            filename: pdfFile.name || `rittenstaat-${datum}.pdf`,
            content: base64Content
          }
        ]
      })
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", resData);
      return new Response(
        JSON.stringify({ error: `Resend API failed: ${resData.message || JSON.stringify(resData)}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "E-mail succesvol verzonden via Resend", data: resData }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Unexpected error in Edge Function:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: `Unexpected server error: ${errorMessage}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
})

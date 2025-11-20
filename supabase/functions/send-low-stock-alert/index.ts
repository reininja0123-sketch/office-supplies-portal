import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LowStockProduct {
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
}

interface LowStockAlertRequest {
  email: string;
  products: LowStockProduct[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, products }: LowStockAlertRequest = await req.json();

    console.log("Sending low stock alert to:", email);

    // Generate products HTML
    const productsHtml = products.map(product => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0;">${product.product_name}</td>
        <td style="padding: 12px 0; text-align: center; color: #dc2626; font-weight: bold;">${product.current_stock}</td>
        <td style="padding: 12px 0; text-align: center;">${product.threshold}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Low Stock Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Low Stock Alert</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Dear Admin,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">The following products have reached or fallen below their low stock threshold and require immediate attention:</p>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b;"><strong>⚠️ Action Required</strong></p>
              <p style="margin: 10px 0 0 0; color: #991b1b;">${products.length} product${products.length > 1 ? 's need' : ' needs'} restocking to maintain inventory levels.</p>
            </div>

            <h2 style="font-size: 20px; margin: 30px 0 15px 0; color: #333;">Low Stock Products</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 12px 0; text-align: left;">Product Name</th>
                  <th style="padding: 12px 0; text-align: center;">Current Stock</th>
                  <th style="padding: 12px 0; text-align: center;">Threshold</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>

            <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #075985;"><strong>📋 Recommended Actions:</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #075985;">
                <li>Review and update product stock quantities</li>
                <li>Place orders with suppliers for low stock items</li>
                <li>Update low stock thresholds if needed</li>
                <li>Monitor sales trends for better inventory planning</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">This is an automated alert from your inventory management system. Please take appropriate action to maintain optimal stock levels.</p>
            
            <p style="font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Procurement Store System</strong></p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 5px 0;">This is an automated email. Please do not reply to this message.</p>
            <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Procurement Store. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Procurement Store <onboarding@resend.dev>",
      to: [email],
      subject: `⚠️ Low Stock Alert - ${products.length} Product${products.length > 1 ? 's' : ''} Need Restocking`,
      html: emailHtml,
    });

    console.log("Low stock alert email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse.data }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-low-stock-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

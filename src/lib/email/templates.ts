const PRIMARY_COLOR = '#6C63FF';

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:${PRIMARY_COLOR};padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Waggingtails &#128062;</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:13px;color:#999999;">&copy; ${new Date().getFullYear()} Waggingtails. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:30px auto;">
  <tr>
    <td style="background-color:${PRIMARY_COLOR};border-radius:6px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

export function welcomeEmail(name: string): string {
  const content = `
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Welcome, ${name}!</h2>
    <p style="margin:0 0 16px;color:#555555;font-size:16px;line-height:1.6;">
      We're thrilled to have you join the Waggingtails family. Get ready to turn your beloved pet into the star of their very own storybook!
    </p>
    <p style="margin:0 0 16px;color:#555555;font-size:16px;line-height:1.6;">
      Creating a personalised story is simple &mdash; just upload a photo of your pet, pick a theme and art style, and we'll do the rest.
    </p>
    ${button('Create Your First Story', 'https://waggingtails.com/dashboard')}
    <p style="margin:0;color:#999999;font-size:14px;text-align:center;">
      If you have any questions, just reply to this email. We're happy to help!
    </p>`;

  return layout(content);
}

export function paymentConfirmationEmail(name: string): string {
  const content = `
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Payment Confirmed</h2>
    <p style="margin:0 0 16px;color:#555555;font-size:16px;line-height:1.6;">
      Hi ${name}, your payment has been received. Thank you for your purchase!
    </p>
    <p style="margin:0 0 16px;color:#555555;font-size:16px;line-height:1.6;">
      You're all set to create amazing personalised storybooks for your pet. Head to your dashboard to get started.
    </p>
    ${button('Go to Dashboard', 'https://waggingtails.com/dashboard')}
    <p style="margin:0;color:#999999;font-size:14px;text-align:center;">
      A receipt has been sent separately by our payment provider.
    </p>`;

  return layout(content);
}

export function storyReadyEmail(
  name: string,
  storyTitle: string,
  downloadUrl: string
): string {
  const content = `
    <h2 style="margin:0 0 16px;color:#333333;font-size:22px;">Your Story is Ready!</h2>
    <p style="margin:0 0 16px;color:#555555;font-size:16px;line-height:1.6;">
      Hi ${name}, great news &mdash; your story <strong>&ldquo;${storyTitle}&rdquo;</strong> has been generated and is ready to download.
    </p>
    <p style="margin:0 0 16px;color:#555555;font-size:16px;line-height:1.6;">
      Click the button below to view and download your personalised storybook.
    </p>
    ${button('Download Your Story', downloadUrl)}
    <p style="margin:0;color:#999999;font-size:14px;text-align:center;">
      This download link will remain available in your dashboard.
    </p>`;

  return layout(content);
}

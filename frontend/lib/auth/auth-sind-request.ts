import { log } from '@/lib/log';
import 'server-only';

export async function sendVerificationRequest(params) {
    const { identifier: to, provider, url } = params;
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: provider.from,
            to,
            subject: `Sign in to MemFree`,
            html: html({ url }),
            text: `Sign in to MemFree`,
        }),
    });

    if (!res.ok) {
        console.error('Failed to send email', await res.json());
        log({
            service: 'frontend',
            message: 'Failed to send email',
            error: await res.json(),
        });
    }
}

function html(params: { url: string }) {
    const { url } = params;

    const colors = {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        background: '#f0f7ff',
        text: '#1e293b',
        lightText: '#64748b',
        white: '#ffffff',
    };

    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="x-ua-compatible" content="ie=edge">
            <title>Email Verification</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 40px 20px; background-color: ${
            colors.background
        }; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
                <!-- Main Container -->
                <tr>
                    <td align="center">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; background-color: ${
                            colors.white
                        }; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <!-- Logo Section -->
                            <tr>
                                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                                    <div style="display: inline-block; margin-bottom: 24px;">
                                        <img src="https://www.memfree.me/logo.png" 
                                             alt="MemFree Logo" 
                                             style="width: 80px; height: 80px;"
                                        />
                                    </div>
                                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${colors.text};">
                                        Welcome to MemFree
                                    </h1>
                                </td>
                            </tr>

                            <!-- Message Section -->
                            <tr>
                                <td style="padding: 20px 40px;">
                                    <p style="margin: 0; font-size: 16px; line-height: 24px; color: ${colors.lightText}; text-align: center;">
                                        Please click the button below to verify your email address and sign in to your account.
                                    </p>
                                </td>
                            </tr>

                            <!-- Button Section -->
                            <tr>
                                <td style="padding: 20px 40px 30px 40px; text-align: center;">
                                    <a href="${url}" 
                                       style="display: inline-block; padding: 16px 36px; font-size: 16px; font-weight: 600; color: ${
                                           colors.white
                                       }; text-decoration: none; background: linear-gradient(135deg, ${colors.primary} 0%, ${
                                           colors.secondary
                                       } 100%); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: all 0.2s ease;">
                                        Sign in to MemFree
                                    </a>
                                </td>
                            </tr>

                            <!-- Security Notice -->
                            <tr>
                                <td style="padding: 0 40px 30px 40px;">
                                    <div style="padding: 16px; background-color: ${colors.background}; border-radius: 12px; text-align: center;">
                                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: ${colors.lightText};">
                                            If you didn't request this email, you can safely ignore it.
                                        </p>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td style="background-color: ${colors.background}; padding: 20px; text-align: center;">
                                    <p style="margin: 0; font-size: 14px; color: ${colors.lightText};">
                                        © ${new Date().getFullYear()} MemFree. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
    `;
}

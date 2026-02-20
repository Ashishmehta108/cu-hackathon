import { Request, Response, NextFunction } from 'express';
import { Resend } from 'resend';
import { asyncHandler } from '../utils/asyncHandler';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123'); // Fallback to prevent crash, though will fail sending

/**
 * Send an email to authorities (or self) regarding a petition.
 * POST /api/email/send
 * Body: { to: string, subject: string, text: string, html?: string }
 */
export const sendEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || !text) {
        res.status(400).json({ success: false, error: 'Missing required fields: to, subject, text' });
        return;
    }

    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY is missing. Add it to your .env file.");
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Awaaz <onboarding@resend.dev>', // resend.dev allows sending to verified domain email
            to: "parasharabhijay@gmail.com",
            replyTo: 'noreply@awaaz.dev',
            subject: subject,
            text: text,
            html: html || `<div style="font-family: sans-serif; padding: 20px; color: #1C1714;">${text.replace(/\n/g, '<br/>')}</div>`,
        });

        if (error) {
            console.error('Resend error:', error);
            res.status(400).json({ success: false, error });
            return;
        }

        res.status(200).json({ success: true, data });
    } catch (err: any) {
        console.error('Email send failed:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

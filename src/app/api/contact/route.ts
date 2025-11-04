import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// Validation Schema
const contactSchema = z.object({
    name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(100),
    email: z.string().email('Ungültige E-Mail-Adresse'),
    message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein').max(5000),
});

// MongoDB Schema & Model
const contactMongooseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true },
        message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactMongooseSchema);

// MongoDB Connection Helper
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
}

// Email Service
async function sendEmails(name: string, email: string, message: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const recipientEmail = process.env.RECIPIENT_EMAIL || 'niklas@hoffmann-niklas.de';

    // Send confirmation to user
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Bestätigung: Deine Nachricht wurde erhalten / Confirmation: Your Message Received',
        html: `
            <h2>Danke für deine Nachricht!</h2>
            <p>Hallo ${name},</p>
            <p>Ich habe deine Nachricht erhalten und werde mich in Kürze mit dir in Verbindung setzen.</p>
            <p>Beste Grüße,<br>Niklas Hoffmann</p>
            <hr>
            <h2>Thank you for your message!</h2>
            <p>Hello ${name},</p>
            <p>I have received your message and will get back to you shortly.</p>
            <p>Best regards,<br>Niklas Hoffmann</p>
        `,
    });

    // Send notification to admin
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `Neue Kontaktanfrage: ${name}`,
        html: `
            <h2>Neue Kontaktanfrage</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Nachricht:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <p><strong>Zeitstempel:</strong> ${new Date().toLocaleString('de-DE')}</p>
        `,
    });
}

// POST - Create contact
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = contactSchema.parse(body);

        // Connect to MongoDB
        await connectDB();

        // Save to database
        const contact = new Contact({
            name: validatedData.name,
            email: validatedData.email,
            message: validatedData.message,
        });

        await contact.save();

        // Send emails
        await sendEmails(validatedData.name, validatedData.email, validatedData.message);

        return NextResponse.json(
            {
                success: true,
                message: 'Contact message sent successfully',
                data: {
                    id: contact._id,
                    email: contact.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Contact API Error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation error',
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// GET - Fetch all contacts (for admin)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const contacts = await Contact.find().sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: contacts,
        });
    } catch (error) {
        console.error('Get Contacts Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch contacts',
            },
            { status: 500 }
        );
    }
}

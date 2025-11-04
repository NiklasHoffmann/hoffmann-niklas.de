import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// MongoDB Schema & Model (reuse from main route)
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

// PATCH - Mark as read
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const { id } = await params;

        const contact = await Contact.findByIdAndUpdate(id, { read: true }, { new: true });

        if (!contact) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Contact not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: contact,
        });
    } catch (error) {
        console.error('Mark as Read Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update contact',
            },
            { status: 500 }
        );
    }
}

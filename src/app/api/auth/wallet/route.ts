import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const ADMIN_WALLET = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();

export async function POST(request: Request) {
    try {
        const { wallet, signature, message } = await request.json();

        if (!ADMIN_WALLET) {
            return NextResponse.json(
                { error: 'Admin wallet not configured' },
                { status: 500 }
            );
        }

        if (!wallet || !signature || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify the signature
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            
            // Check if recovered address matches admin wallet
            if (recoveredAddress.toLowerCase() !== ADMIN_WALLET) {
                return NextResponse.json(
                    { error: 'Unauthorized wallet' },
                    { status: 403 }
                );
            }

            // Check if provided wallet matches recovered address
            if (wallet.toLowerCase() !== recoveredAddress.toLowerCase()) {
                return NextResponse.json(
                    { error: 'Wallet mismatch' },
                    { status: 403 }
                );
            }

            // Create auth session
            const session = {
                wallet: wallet.toLowerCase(),
                signature,
                timestamp: Date.now()
            };

            // Set cookie
            const response = NextResponse.json({ success: true });
            response.cookies.set('admin-auth', JSON.stringify(session), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 // 24 hours
            });

            return response;
        } catch (error) {
            console.error('Signature verification failed:', error);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 403 }
            );
        }
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

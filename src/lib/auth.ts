import { cookies } from 'next/headers';

const ADMIN_WALLET = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();
const AUTH_COOKIE = 'admin-auth';
const AUTH_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthSession {
    wallet: string;
    signature: string;
    timestamp: number;
}

/**
 * Verify a wallet signature
 */
export function verifySignature(message: string, signature: string, address: string): boolean {
    try {
        // Note: In production, you'd verify the actual signature here
        // For now, we'll just check if the wallet matches
        return address.toLowerCase() === ADMIN_WALLET;
    } catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
}

/**
 * Check if user is authenticated admin
 */
export async function isAuthenticated(): Promise<boolean> {
    if (!ADMIN_WALLET) {
        console.error('ADMIN_WALLET_ADDRESS not configured');
        return false;
    }

    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE);

    if (!authCookie) {
        return false;
    }

    try {
        const session: AuthSession = JSON.parse(authCookie.value);

        // Check if session expired
        if (Date.now() - session.timestamp > AUTH_EXPIRY) {
            return false;
        }

        // Check if wallet matches admin wallet
        return session.wallet.toLowerCase() === ADMIN_WALLET;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

/**
 * Get auth message for signing
 */
export function getAuthMessage(): string {
    const timestamp = Date.now();
    return `Sign this message to authenticate as admin.\n\nTimestamp: ${timestamp}`;
}

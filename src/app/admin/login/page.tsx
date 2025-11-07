'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export default function AdminLogin() {
    const router = useRouter();
    const [wallet, setWallet] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError('MetaMask is not installed. Please install MetaMask to continue.');
            return;
        }

        try {
            setIsConnecting(true);
            setError(null);

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            const walletAddress = accounts[0];
            setWallet(walletAddress);

            // Create message to sign
            const message = `Sign this message to authenticate as admin.\n\nTimestamp: ${Date.now()}`;

            // Request signature
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, walletAddress]
            });

            // Send to backend for verification
            const response = await fetch('/api/auth/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: walletAddress,
                    signature,
                    message
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Authentication failed');
            }

            // Redirect to admin page
            router.push('/admin');
        } catch (err: any) {
            console.error('Wallet connection error:', err);
            if (err.code === 4001) {
                setError('You rejected the signature request.');
            } else {
                setError(err.message || 'Failed to connect wallet');
            }
            setWallet(null);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="min-h-[600px] flex items-center justify-center bg-background py-12">
            <div className="max-w-md w-full mx-4 p-8 bg-card rounded-lg border border-border shadow-lg">
                <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
                    Admin Login
                </h1>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Connect your wallet and sign a message to authenticate as admin.
                    </p>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {wallet && (
                        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Connected Wallet:</p>
                            <p className="text-sm text-foreground font-mono break-all">
                                {wallet}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
                    </button>

                    <p className="text-xs text-muted-foreground text-center">
                        Only authorized wallet addresses can access the admin panel.
                    </p>
                </div>
            </div>
        </div>
    );
}

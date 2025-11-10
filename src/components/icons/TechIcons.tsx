'use client';

import { Icon } from '@iconify/react';

interface IconProps {
    className?: string;
}

// Wrapper für konsistente Icon-Props
function BrandIcon({ icon, className = 'w-6 h-6' }: IconProps & { icon: string }) {
    return <Icon icon={icon} className={className} ssr={true} />;
}

export function ReactIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:react" className={className} />;
}

export function NextJsIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:nextjs-icon" className={className} />;
}

export function TypeScriptIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:typescript-icon" className={className} />;
}

export function TailwindIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:tailwindcss-icon" className={className} />;
}

export function NodeIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:nodejs-icon" className={className} />;
}

export function ExpressIcon({ className }: IconProps) {
    return <BrandIcon icon="skill-icons:expressjs-dark" className={className} />;
}

export function MongoDBIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:mongodb-icon" className={className} />;
}

export function GitIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:git-icon" className={className} />;
}

export function FigmaIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:figma" className={className} />;
}

export function VsCodeIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:visual-studio-code" className={className} />;
}

export function EthereumIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:ethereum" className={className} />;
}

export function WalletConnectIcon({ className }: IconProps) {
    return <BrandIcon icon="token-branded:wallet-connect" className={className} />;
}

export function ViemIcon({ className = 'w-6 h-6' }: IconProps) {
    // Official Viem Logo - simple V in circle
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-foreground" />
            <text
                x="12"
                y="17"
                fontSize="14"
                fontWeight="600"
                textAnchor="middle"
                fill="currentColor"
                className="text-foreground"
                fontFamily="system-ui, -apple-system, sans-serif"
            >
                V
            </text>
        </svg>
    );
}

export function WagmiIcon({ className }: IconProps) {
    return <BrandIcon icon="simple-icons:wagmi" className={className} />;
}

export function MetaMaskIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:metamask-icon" className={className} />;
}

export function IPFSIcon({ className }: IconProps) {
    return <BrandIcon icon="simple-icons:ipfs" className={className} />;
}

export function GraphQLIcon({ className }: IconProps) {
    return <BrandIcon icon="logos:graphql" className={className} />;
}

export function TheGraphIcon({ className }: IconProps) {
    return <BrandIcon icon="cryptocurrency:grt" className={className} />;
}

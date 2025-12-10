/**
 * Icon Caching Script
 * Downloads all Iconify icons used in the app and caches them locally
 * Run: node scripts/cache-icons.js
 * 
 * This eliminates CORS issues and improves performance by serving icons locally
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Output directory for cached icons
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Icon categories for better organization
 * 
 * keepColors: true = Behält die originalen Farben (für Brand-Logos)
 * keepColors: false/undefined = Verwendet currentColor (für UI-Icons)
 */
const iconCategories = {
    // Brand & Tech Stack Icons (logos:, vscode-icons:, skill-icons:)
    // Diese Icons behalten ihre originalen Farben
    brands: [
        { name: 'logos:react', filename: 'brand-react.svg', keepColors: true },
        { name: 'logos:nextjs-icon', filename: 'brand-nextjs.svg', keepColors: true },
        { name: 'logos:typescript-icon', filename: 'brand-typescript.svg', keepColors: true },
        { name: 'logos:tailwindcss-icon', filename: 'brand-tailwind.svg', keepColors: true },
        { name: 'logos:nodejs-icon', filename: 'brand-nodejs.svg', keepColors: true },
        { name: 'logos:ethereum', filename: 'brand-ethereum.svg', keepColors: true },
        { name: 'logos:figma', filename: 'brand-figma.svg', keepColors: true },
        { name: 'logos:mongodb-icon', filename: 'brand-mongodb.svg', keepColors: true },
        { name: 'logos:git-icon', filename: 'brand-git.svg', keepColors: true },
        { name: 'logos:graphql', filename: 'brand-graphql.svg', keepColors: true },
        { name: 'logos:metamask-icon', filename: 'brand-metamask.svg', keepColors: true },
        { name: 'simple-icons:wagmi', filename: 'brand-wagmi.svg', keepColors: false },
        { name: 'simple-icons:ipfs', filename: 'brand-ipfs.svg', keepColors: false },
        { name: 'cryptocurrency:grt', filename: 'brand-thegraph.svg', keepColors: false },
        { name: 'vscode-icons:file-type-reactjs', filename: 'service-webdev.svg', keepColors: true },
        { name: 'vscode-icons:file-type-mongo', filename: 'service-database.svg', keepColors: true },
        { name: 'vscode-icons:file-type-node', filename: 'service-backend.svg', keepColors: true },
        { name: 'token-branded:wallet-connect', filename: 'service-wallet.svg', keepColors: true },
        { name: 'skill-icons:expressjs-dark', filename: 'brand-express.svg', keepColors: true },
    ],

    // Service Category Icons (for ServicesSection cube)
    services: [
        { name: 'mdi:cube-outline', filename: 'ui-cube-outline.svg' },
        { name: 'mdi:grid', filename: 'ui-grid.svg' },
    ],

    // UI & Navigation Icons (mdi: + lucide:)
    ui: [
        { name: 'mdi:chevron-right', filename: 'ui-chevron-right.svg' },
        { name: 'mdi:chevron-left', filename: 'ui-chevron-left.svg' },
        { name: 'mdi:menu', filename: 'ui-menu.svg' },
        { name: 'mdi:close', filename: 'ui-close.svg' },
        { name: 'mdi:send', filename: 'ui-send.svg' },
        { name: 'mdi:lightning-bolt', filename: 'ui-lightning.svg' },
        { name: 'mdi:lightbulb-on', filename: 'ui-lightbulb.svg' },
        // Lucide replacements
        { name: 'lucide:external-link', filename: 'ui-external-link.svg' },
        { name: 'lucide:github', filename: 'ui-github.svg' },
        { name: 'lucide:moon', filename: 'ui-moon.svg' },
        { name: 'lucide:sun', filename: 'ui-sun.svg' },
        { name: 'lucide:sparkles', filename: 'ui-sparkles.svg' },
        { name: 'lucide:mail', filename: 'ui-mail.svg' },
        { name: 'lucide:map-pin', filename: 'ui-map-pin.svg' },
        { name: 'lucide:loader-2', filename: 'ui-loader.svg' },
        { name: 'lucide:check-circle', filename: 'ui-check-circle.svg' },
        { name: 'lucide:alert-circle', filename: 'ui-alert-circle.svg' },
        { name: 'lucide:x', filename: 'ui-x.svg' },
        { name: 'lucide:instagram', filename: 'ui-instagram.svg' },
        { name: 'lucide:arrow-left', filename: 'ui-arrow-left.svg' },
        { name: 'lucide:trending-up', filename: 'ui-trending-up.svg' },
        { name: 'lucide:users', filename: 'ui-users.svg' },
        { name: 'lucide:clock', filename: 'ui-clock.svg' },
        { name: 'lucide:eye', filename: 'ui-eye.svg' },
        { name: 'lucide:mouse-pointer-click', filename: 'ui-mouse-click.svg' },
        { name: 'lucide:monitor', filename: 'ui-monitor.svg' },
        { name: 'lucide:smartphone', filename: 'ui-smartphone.svg' },
        { name: 'lucide:globe', filename: 'ui-globe.svg' },
        { name: 'lucide:bar-chart-3', filename: 'ui-bar-chart.svg' },
        { name: 'lucide:activity', filename: 'ui-activity.svg' },
        { name: 'lucide:tablet', filename: 'ui-tablet.svg' },
    ],

    // About Section Timeline Icons
    timeline: [
        { name: 'mdi:rocket-launch', filename: 'timeline-rocket.svg' },
        { name: 'mdi:briefcase', filename: 'timeline-briefcase.svg' },
        { name: 'mdi:code-braces', filename: 'timeline-code.svg' },
    ],

    // About Section Highlights Icons
    highlights: [
        { name: 'mdi:web', filename: 'highlight-web.svg' },
        { name: 'mdi:palette', filename: 'highlight-palette.svg' },
        { name: 'mdi:api', filename: 'highlight-api.svg' },
        { name: 'mdi:database', filename: 'highlight-database.svg' },
        { name: 'mdi:responsive', filename: 'highlight-responsive.svg' },
    ],

    // Chat Widget Icons
    chat: [
        { name: 'mdi:chat', filename: 'chat-bubble.svg' },
        { name: 'mdi:chat-outline', filename: 'chat-outline.svg' },
        { name: 'mdi:close', filename: 'chat-close.svg' },
        { name: 'mdi:window-minimize', filename: 'chat-minimize.svg' },
        { name: 'mdi:window-maximize', filename: 'chat-maximize.svg' },
    ],

    // Admin Panel Icons
    admin: [
        { name: 'mdi:account-circle', filename: 'admin-user.svg' },
        { name: 'mdi:message-text', filename: 'admin-message.svg' },
        { name: 'mdi:shield-check', filename: 'admin-shield.svg' },
        { name: 'mdi:clock', filename: 'admin-clock.svg' },
        { name: 'mdi:delete', filename: 'admin-delete.svg' },
        { name: 'mdi:check-circle', filename: 'admin-check.svg' },
        { name: 'mdi:alert-circle', filename: 'admin-alert.svg' },
        { name: 'mdi:loading', filename: 'admin-loader.svg' },
    ],

    // Legal Pages Icons
    legal: [
        { name: 'mdi:file-document', filename: 'legal-document.svg' },
        { name: 'mdi:gavel', filename: 'legal-gavel.svg' },
        { name: 'mdi:shield-check', filename: 'legal-shield.svg' },
        { name: 'mdi:cookie', filename: 'legal-cookie.svg' },
        { name: 'mdi:lock', filename: 'legal-lock.svg' },
    ],
};

/**
 * Download a single icon from Iconify API
 */
function downloadIcon(iconName, filename, category, keepColors = false) {
    return new Promise((resolve, reject) => {
        // Iconify API endpoint
        // keepColors = true: Download mit originalen Farben (kein color parameter)
        // keepColors = false: Download mit currentColor für Theme-Kompatibilität
        const url = keepColors 
            ? `https://api.iconify.design/${iconName}.svg`
            : `https://api.iconify.design/${iconName}.svg?color=%23currentColor`;
        
        console.log(`  [${category}] ${iconName} → ${filename}${keepColors ? ' (colors)' : ''}`);
        
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                // Nur bei currentColor Icons: Fix #currentColor → currentColor
                if (!keepColors) {
                    data = data.replace(/#currentColor/g, 'currentColor');
                }
                
                const filepath = path.join(outputDir, filename);
                fs.writeFileSync(filepath, data);
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Download all icons in a category
 */
async function downloadCategory(categoryName, icons) {
    console.log(`\n📦 ${categoryName.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    for (const icon of icons) {
        try {
            await downloadIcon(icon.name, icon.filename, categoryName, icon.keepColors);
            await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}`);
        }
    }
}

/**
 * Main function
 */
async function cacheAllIcons() {
    console.log('\n🎨 Icon Caching System');
    console.log('='.repeat(50));
    console.log(`Output: ${outputDir}`);
    
    const startTime = Date.now();
    let totalIcons = 0;
    
    // Count total icons
    for (const icons of Object.values(iconCategories)) {
        totalIcons += icons.length;
    }
    
    console.log(`Total icons to cache: ${totalIcons}`);
    
    // Download each category
    for (const [categoryName, icons] of Object.entries(iconCategories)) {
        await downloadCategory(categoryName, icons);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Done! Cached ${totalIcons} icons in ${duration}s`);
    console.log(`📁 Icons saved to: ${outputDir}`);
}

// Run if called directly
if (require.main === module) {
    cacheAllIcons().catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { cacheAllIcons };

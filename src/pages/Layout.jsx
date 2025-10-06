
import React, { useEffect } from 'react';

export default function Layout({ children, currentPageName }) {
    const siteTitle = "The Coin Master | Create Solana SPL Tokens with AI";
    const siteDescription = "Create professional Solana SPL tokens instantly with AI-powered validation. Revoke authorities, customize supply, and launch your token on mainnet in minutes.";
    const siteUrl = "https://thecoinmaster.app";
    const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dcbe85458648cf2e4585e6/8ba85d3c2_ChatGPTImageOct4202508_22_18PM.png";

    useEffect(() => {
        // Set page title
        document.title = siteTitle;
        
        // Set or update meta tags
        const setMetaTag = (name, content, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attribute, name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Basic Meta Tags
        setMetaTag('description', siteDescription);
        setMetaTag('keywords', 'Solana, SPL Token, Token Creator, Crypto, Blockchain, Meme Coin, Token Launch, DeFi, Web3, Solana Token, Create Token');
        
        // Favicon
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = logoUrl;

        // Apple Touch Icon
        let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
        if (!appleTouchIcon) {
            appleTouchIcon = document.createElement('link');
            appleTouchIcon.rel = 'apple-touch-icon';
            document.head.appendChild(appleTouchIcon);
        }
        appleTouchIcon.href = logoUrl;

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = siteUrl;

        // Open Graph / Facebook / iMessage
        setMetaTag('og:type', 'website', true);
        setMetaTag('og:url', siteUrl, true);
        setMetaTag('og:title', siteTitle, true);
        setMetaTag('og:description', siteDescription, true);
        setMetaTag('og:image', logoUrl, true);
        setMetaTag('og:image:width', '1200', true);
        setMetaTag('og:image:height', '1200', true);
        setMetaTag('og:image:alt', 'The Coin Master - Solana Token Creator', true);
        setMetaTag('og:site_name', 'The Coin Master', true);

        // Twitter Card
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:url', siteUrl);
        setMetaTag('twitter:title', siteTitle);
        setMetaTag('twitter:description', siteDescription);
        setMetaTag('twitter:image', logoUrl);

        // Theme Color
        setMetaTag('theme-color', '#14b8a6');
        
        // Mobile Web App
        setMetaTag('apple-mobile-web-app-capable', 'yes');
        setMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
        setMetaTag('apple-mobile-web-app-title', 'The Coin Master');

        // Robots
        setMetaTag('robots', 'index, follow');

    }, []);

    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}

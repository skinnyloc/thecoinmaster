# Setup Instructions

## GitHub Setup
1. Go to https://github.com and create a new repository named `thecoinmaster`
2. Make it **public**
3. **Don't** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL (it will be something like: `https://github.com/yourusername/thecoinmaster.git`)

## Push to GitHub
After creating the repository, run these commands:

```bash
git remote add origin https://github.com/YOURUSERNAME/thecoinmaster.git
git branch -M main
git push -u origin main
```

## Vercel Deployment
1. Go to https://vercel.com
2. Import your GitHub repository
3. Deploy with default settings (Vite will be auto-detected)
4. Add environment variables for Solana functionality

## Environment Variables to Add on Vercel
- `VITE_SOLANA_RPC_URL` - Your Solana RPC endpoint
- `VITE_SOLANA_NETWORK` - mainnet-beta or devnet
- Any other API keys you'll need for token creation

The site is ready to deploy! 🚀
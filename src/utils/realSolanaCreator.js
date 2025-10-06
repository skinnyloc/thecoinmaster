// Real Solana Token Creator with Fee Collection
// Works directly in browser with Phantom wallet

export const FEES = {
  BASE_FEE: 0.1,
  REVOKE_FEE: 0.05
};

export const calculateTotalFee = (revokeOptions) => {
  let total = FEES.BASE_FEE;
  if (revokeOptions.revoke_freeze) total += FEES.REVOKE_FEE;
  if (revokeOptions.revoke_mint) total += FEES.REVOKE_FEE;
  if (revokeOptions.revoke_update) total += FEES.REVOKE_FEE;
  return total;
};

export const createRealSolanaToken = async (params) => {
  const {
    provider, // Phantom wallet
    tokenName,
    symbol,
    decimals,
    supply,
    imageUrl,
    description,
    revokeOptions = {}
  } = params;

  try {
    // Get environment variables
    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const feeWallet = import.meta.env.VITE_FEE_WALLET || 'GQ95MH74f2kF6Aqv5dy6PSKq3S1xfwQowwYYqVQPNTMe';

    // Import Solana from window (loaded via CDN)
    const {
      Connection,
      PublicKey,
      Transaction,
      SystemProgram,
      LAMPORTS_PER_SOL,
      Keypair
    } = window.solanaWeb3;

    const {
      TOKEN_PROGRAM_ID,
      createInitializeMintInstruction,
      createAssociatedTokenAccountInstruction,
      createMintToInstruction,
      createSetAuthorityInstruction,
      getAssociatedTokenAddress,
      getMinimumBalanceForRentExemptMint,
      MINT_SIZE,
      AuthorityType
    } = window.splToken;

    // Create connection
    const connection = new Connection(rpcUrl, 'confirmed');

    // Get user's public key
    const payer = provider.publicKey;

    // Calculate service fee
    const serviceFee = calculateTotalFee(revokeOptions);
    const serviceFeeInLamports = Math.floor(serviceFee * LAMPORTS_PER_SOL);

    // Generate new mint keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    console.log('Creating token with:', {
      mint: mint.toString(),
      serviceFee,
      revokeOptions
    });

    // Create transaction
    const transaction = new Transaction();

    // 1. Add service fee payment to your wallet
    const feeWalletPubkey = new PublicKey(feeWallet);
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: feeWalletPubkey,
        lamports: serviceFeeInLamports,
      })
    );

    // 2. Get minimum balance for mint account
    const mintRentExempt = await getMinimumBalanceForRentExemptMint(connection);

    // 3. Create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports: mintRentExempt,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // 4. Initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mint,
        decimals,
        payer, // mint authority
        revokeOptions.revoke_freeze ? null : payer  // freeze authority
      )
    );

    // 5. Create associated token account for the payer
    const associatedTokenAddress = await getAssociatedTokenAddress(mint, payer);
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAddress,
        payer,
        mint
      )
    );

    // 6. Mint tokens to the associated token account
    const mintAmount = supply * Math.pow(10, decimals);
    transaction.add(
      createMintToInstruction(
        mint,
        associatedTokenAddress,
        payer,
        mintAmount
      )
    );

    // 7. Revoke mint authority if requested
    if (revokeOptions.revoke_mint) {
      transaction.add(
        createSetAuthorityInstruction(
          mint,
          payer,
          AuthorityType.MintTokens,
          null
        )
      );
    }

    // 8. Revoke freeze authority if requested
    if (revokeOptions.revoke_freeze) {
      transaction.add(
        createSetAuthorityInstruction(
          mint,
          payer,
          AuthorityType.FreezeAccount,
          null
        )
      );
    }

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer;

    // Partially sign with mint keypair
    transaction.partialSign(mintKeypair);

    return {
      transaction,
      mintAddress: mint.toString(),
      serviceFee,
      metadata: {
        name: tokenName,
        symbol: symbol,
        decimals: decimals,
        supply: supply
      }
    };

  } catch (error) {
    console.error('Error creating token transaction:', error);
    throw new Error(`Failed to create token transaction: ${error.message}`);
  }
};

export const sendTokenTransaction = async (connection, signedTransaction) => {
  try {
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }

    return {
      success: true,
      signature,
      message: 'Token created successfully!'
    };
  } catch (error) {
    console.error('Error sending transaction:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
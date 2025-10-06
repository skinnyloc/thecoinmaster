// Solana Token Creator with Fee Collection
// Replaces base44 functionality with direct Solana implementation

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair
} from '@solana/web3.js';

import {
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token';

import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';

// Your fee collection wallet
const FEE_WALLET = import.meta.env.VITE_FEE_WALLET || 'GQ95MH74f2kF6Aqv5dy6PSKq3S1xfwQowwYYqVQPNTMe';

// Fee structure (in SOL)
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

export const createSolanaTokenTransaction = async (params) => {
  const {
    connection,
    payer,
    tokenName,
    symbol,
    decimals,
    supply,
    imageUrl,
    description,
    revokeOptions = {}
  } = params;

  try {
    const transaction = new Transaction();

    // Generate new mint keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // Calculate fees
    const serviceFee = calculateTotalFee(revokeOptions);
    const serviceFeeInLamports = serviceFee * LAMPORTS_PER_SOL;

    // 1. Add service fee payment to your wallet
    const feeWallet = new PublicKey(FEE_WALLET);
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: feeWallet,
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
        payer  // freeze authority (will be revoked if requested)
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

    // 7. Create metadata (requires Metaplex)
    const metadataAccount = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    )[0];

    const metadata = {
      name: tokenName,
      symbol: symbol,
      uri: imageUrl, // This should point to a JSON metadata file
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    transaction.add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataAccount,
          mint: mint,
          mintAuthority: payer,
          payer: payer,
          updateAuthority: payer,
        },
        {
          createMetadataAccountArgsV3: {
            data: metadata,
            isMutable: !revokeOptions.revoke_update,
            collectionDetails: null,
          },
        }
      )
    );

    // 8. Revoke authorities if requested
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

    if (revokeOptions.revoke_update) {
      transaction.add(
        createSetAuthorityInstruction(
          metadataAccount,
          payer,
          AuthorityType.AccountOwner,
          null
        )
      );
    }

    return {
      transaction,
      mintAddress: mint.toString(),
      mintKeypair,
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

export const sendTokenTransaction = async (connection, transaction, signers) => {
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      signers,
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      }
    );

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
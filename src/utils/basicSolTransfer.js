// Ultra simple SOL transfer - just to test Phantom wallet
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

export const createBasicTransfer = async (revokeOptions = {}) => {
  try {
    console.log('🔍 Starting basic transfer creation...');

    // Check if Phantom is available
    if (!window.solana) {
      throw new Error('Phantom wallet not found! Please install Phantom.');
    }

    if (!window.solana.isConnected) {
      throw new Error('Phantom wallet not connected! Please connect your wallet first.');
    }

    console.log('✅ Phantom wallet found and connected');

    // Check if Solana Web3 is loaded
    if (!window.solanaWeb3) {
      throw new Error('Solana Web3 library not loaded! Please refresh the page.');
    }

    console.log('✅ Solana Web3 library loaded');

    const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = window.solanaWeb3;

    // Get environment variables with fallbacks
    const feeWallet = import.meta.env.VITE_FEE_WALLET || 'GQ95MH74f2kF6Aqv5dy6PSKq3S1xfwQowwYYqVQPNTMe';
    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

    console.log('💰 Fee wallet:', feeWallet);
    console.log('🌐 RPC URL:', rpcUrl);

    // Calculate service fee
    const serviceFee = calculateTotalFee(revokeOptions);
    const serviceFeeInLamports = Math.floor(serviceFee * LAMPORTS_PER_SOL);

    console.log('💵 Service fee:', serviceFee, 'SOL (', serviceFeeInLamports, 'lamports)');

    // Get user's wallet
    const userWallet = window.solana.publicKey;
    console.log('👤 User wallet:', userWallet.toString());

    // Create connection
    const connection = new Connection(rpcUrl, 'confirmed');
    console.log('🔗 Connection created');

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    console.log('📝 Got recent blockhash:', blockhash);

    // Create transaction
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userWallet;

    // Add transfer instruction
    const feeWalletPubkey = new PublicKey(feeWallet);
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: userWallet,
      toPubkey: feeWalletPubkey,
      lamports: serviceFeeInLamports,
    });

    transaction.add(transferInstruction);
    console.log('✅ Transfer instruction added to transaction');

    return {
      transaction,
      serviceFee,
      connection,
      signature: null // Will be set after signing
    };

  } catch (error) {
    console.error('❌ Error in createBasicTransfer:', error);
    throw error;
  }
};

export const sendBasicTransfer = async (transactionData) => {
  try {
    const { transaction, connection } = transactionData;

    console.log('📤 Sending transaction to blockchain...');

    // Send transaction
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('⏳ Transaction sent, waiting for confirmation...');
    console.log('🔗 Signature:', signature);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('✅ Transaction confirmed!');

    return {
      success: true,
      signature,
      message: 'SOL transfer successful!'
    };

  } catch (error) {
    console.error('❌ Error sending transaction:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
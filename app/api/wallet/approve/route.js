// app/api/wallet/approve/route.js

import { USDC } from 'path/to/usdc-module';

// Endpoint to approve USDC transaction for signing
export const approveTransaction = async (req, res) => {
    try {
        const { userWallet, amount } = req.body;

        // Validate the user wallet and amount
        if (!userWallet || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid wallet or amount' });
        }

        const transaction = await USDC.createTransaction({
            from: userWallet,
            value: amount,
        });

        // Sign the transaction with the user's wallet
        const signedTransaction = await userWallet.signTransaction(transaction);

        return res.status(200).json({ transaction: signedTransaction });
    } catch (error) {
        console.error('Error approving transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default approveTransaction;
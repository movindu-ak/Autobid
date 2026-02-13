import { Router } from 'express';
import {
  getBalance,
  topUpWallet,
  getTransactions,
  withdrawFromWallet,
  getWalletSummary,
} from '../controllers/wallet.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All wallet routes are protected
router.use(protect);

router.get('/balance', getBalance);
router.post('/topup', topUpWallet);
router.post('/withdraw', withdrawFromWallet);
router.get('/transactions', getTransactions);
router.get('/summary', getWalletSummary);

export default router;

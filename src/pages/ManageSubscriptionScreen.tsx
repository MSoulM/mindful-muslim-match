import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, CreditCard, AlertCircle } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
}

const transactions: Transaction[] = [
  { id: '1', date: 'Nov 15, 2024', amount: '£71.97', status: 'paid' },
  { id: '2', date: 'Aug 15, 2024', amount: '£71.97', status: 'paid' },
  { id: '3', date: 'May 15, 2024', amount: '£71.97', status: 'paid' },
];

export default function ManageSubscriptionScreen() {
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handleChangePlan = () => {
    hapticFeedback();
    navigate('/premium');
  };

  const handlePauseSubscription = () => {
    hapticFeedback();
    // Handle pause logic
    console.log('Pause subscription');
  };

  const handleCancelSubscription = () => {
    hapticFeedback();
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    // Handle cancellation logic
    console.log('Subscription cancelled');
    setShowCancelDialog(false);
    navigate('/profile');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-neutral-50">
        <TopBar
          variant="back"
          title="Subscription"
          onBackClick={() => navigate(-1)}
        />

        <ScreenContainer hasTopBar padding scrollable>
          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-forest to-[#4A8B8C] p-6 mb-6 text-white"
          >
            {/* Decorative elements */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="text-3xl mb-3">⭐</div>
              
              <h2 className="text-xl font-bold mb-1">Premium Member</h2>
              <p className="text-white/90 text-sm mb-4">3-Month Plan</p>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/80">Next billing</span>
                  <span className="font-semibold">Feb 15, 2025</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Amount</span>
                  <span className="text-lg font-bold">£71.97</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Plan Options */}
          <div className="space-y-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePlan}
              className="w-full h-14 bg-white border-2 border-neutral-200 rounded-xl font-semibold text-neutral-900 hover:border-primary-forest transition-colors"
            >
              Change Plan
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePauseSubscription}
              className="w-full h-14 bg-white border-2 border-neutral-200 rounded-xl font-semibold text-neutral-900 hover:border-neutral-300 transition-colors"
            >
              Pause Subscription
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCancelSubscription}
              className="w-full h-12 text-semantic-error font-semibold hover:underline"
            >
              Cancel Subscription
            </motion.button>
          </div>

          {/* Billing History */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">
              Billing History
            </h2>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    'flex items-center justify-between p-4',
                    index !== transactions.length - 1 && 'border-b border-neutral-200'
                  )}
                >
                  <div>
                    <div className="font-semibold text-neutral-900">
                      {transaction.amount}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {transaction.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'text-xs font-semibold px-2 py-1 rounded-full',
                      transaction.status === 'paid' && 'bg-semantic-success/10 text-semantic-success',
                      transaction.status === 'pending' && 'bg-semantic-warning/10 text-semantic-warning',
                      transaction.status === 'failed' && 'bg-semantic-error/10 text-semantic-error'
                    )}>
                      {transaction.status === 'paid' && 'Paid'}
                      {transaction.status === 'pending' && 'Pending'}
                      {transaction.status === 'failed' && 'Failed'}
                    </span>

                    <button
                      onClick={() => hapticFeedback()}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-neutral-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">
              Payment Method
            </h2>

            <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">
                    •••• 4242
                  </div>
                  <div className="text-sm text-neutral-600">
                    Expires 12/25
                  </div>
                </div>
              </div>

              <button
                onClick={() => hapticFeedback()}
                className="text-sm font-semibold text-primary-forest hover:underline"
              >
                Update
              </button>
            </div>
          </div>
        </ScreenContainer>

        {/* Cancel Subscription Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-semantic-error/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-semantic-error" />
                </div>
              </div>
              <AlertDialogTitle className="text-center">
                Cancel Premium?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                You'll lose access to premium features including unlimited likes, 
                priority matching, and enhanced ChaiChat insights. Your subscription 
                will remain active until Feb 15, 2025.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <AlertDialogAction
                onClick={confirmCancel}
                className="w-full bg-semantic-error hover:bg-semantic-error/90 text-white"
              >
                Yes, Cancel Subscription
              </AlertDialogAction>
              <AlertDialogCancel className="w-full mt-0">
                Keep Premium
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}

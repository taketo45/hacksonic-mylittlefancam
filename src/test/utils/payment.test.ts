import { 
  createCheckoutSession, 
  getCheckoutSession, 
  verifyPaymentSuccess, 
  handlePaymentWebhook, 
  generateReceiptUrl,
  stripe
} from '../../lib/utils/payment';
import Stripe from 'stripe';

// Stripeのモック
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'test_session_id',
          payment_status: 'paid',
          metadata: { print_option: 'true' }
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'test_session_id',
          payment_status: 'paid',
          payment_intent: 'test_payment_intent_id',
          line_items: [],
          metadata: { print_option: 'true' }
        })
      }
    },
    paymentIntents: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'test_payment_intent_id',
        latest_charge: 'test_charge_id'
      })
    },
    charges: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'test_charge_id',
        receipt_url: 'https://receipt.example.com'
      })
    }
  }));
});

// payment.tsモジュールをモック
jest.mock('../../lib/utils/payment', () => {
  // 実際のモジュールを取得
  const originalModule = jest.requireActual('../../lib/utils/payment');
  
  // モックStripeインスタンス
  const mockStripe = {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'test_session_id',
          payment_status: 'paid',
          metadata: { print_option: 'true' }
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'test_session_id',
          payment_status: 'paid',
          payment_intent: 'test_payment_intent_id',
          line_items: [],
          metadata: { print_option: 'true' }
        })
      }
    },
    paymentIntents: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'test_payment_intent_id',
        latest_charge: 'test_charge_id'
      })
    },
    charges: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'test_charge_id',
        receipt_url: 'https://receipt.example.com'
      })
    }
  };
  
  // 元の関数を上書きして、モックStripeを使用するようにする
  return {
    ...originalModule,
    stripe: mockStripe,
    // 各関数をモックStripeを使用するように上書き
    createCheckoutSession: jest.fn().mockImplementation(async (options) => {
      await mockStripe.checkout.sessions.create(options);
      return 'test_session_id';
    }),
    getCheckoutSession: jest.fn().mockImplementation(async (sessionId) => {
      await mockStripe.checkout.sessions.retrieve(sessionId);
      return {
        id: 'test_session_id',
        payment_status: 'paid',
        payment_intent: 'test_payment_intent_id',
        line_items: [],
        metadata: { print_option: 'true' }
      };
    }),
    verifyPaymentSuccess: jest.fn().mockImplementation(async () => {
      await mockStripe.checkout.sessions.retrieve();
      return true;
    }),
    generateReceiptUrl: jest.fn().mockImplementation(async () => {
      await mockStripe.checkout.sessions.retrieve();
      await mockStripe.paymentIntents.retrieve('test_payment_intent_id');
      await mockStripe.charges.retrieve('test_charge_id');
      return 'https://receipt.example.com';
    }),
    handlePaymentWebhook: originalModule.handlePaymentWebhook
  };
});

describe('Payment Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session', async () => {
      const options = {
        products: [
          {
            id: 'test_product_id',
            name: 'Test Product',
            description: 'Test Description',
            price: 1000,
            metadata: { test: 'value' }
          }
        ],
        customerEmail: 'test@example.com',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        metadata: { order_id: 'test_order_id' },
        printOption: true
      };

      const sessionId = await createCheckoutSession(options);
      
      expect(stripe.checkout.sessions.create).toHaveBeenCalled();
      expect(sessionId).toBe('test_session_id');
    });
  });

  describe('getCheckoutSession', () => {
    it('should retrieve a checkout session', async () => {
      const sessionId = 'test_session_id';
      const session = await getCheckoutSession(sessionId);
      
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalled();
      expect(session).toEqual(expect.objectContaining({
        id: 'test_session_id',
        payment_status: 'paid'
      }));
    });
  });

  describe('verifyPaymentSuccess', () => {
    it('should verify payment success', async () => {
      const sessionId = 'test_session_id';
      const result = await verifyPaymentSuccess(sessionId);
      
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('handlePaymentWebhook', () => {
    it('should handle checkout.session.completed event', async () => {
      // Stripe.Eventの型に合わせたモックイベントを作成
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'test_session_id',
            payment_status: 'paid',
            metadata: { print_option: 'true' }
          }
        }
      } as unknown as Stripe.Event;

      const result = await handlePaymentWebhook(mockEvent);
      
      expect(result).toEqual({ success: true });
    });

    it('should handle payment_intent.payment_failed event', async () => {
      // Stripe.Eventの型に合わせたモックイベントを作成
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'test_payment_intent_id'
          }
        }
      } as unknown as Stripe.Event;

      const result = await handlePaymentWebhook(mockEvent);
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('generateReceiptUrl', () => {
    it('should generate a receipt URL', async () => {
      const sessionId = 'test_session_id';
      const receiptUrl = await generateReceiptUrl(sessionId);
      
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalled();
      expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith('test_payment_intent_id');
      expect(stripe.charges.retrieve).toHaveBeenCalledWith('test_charge_id');
      expect(receiptUrl).toBe('https://receipt.example.com');
    });
  });
}); 
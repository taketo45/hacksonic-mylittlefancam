import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

// Stripeクライアントの初期化
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * 商品の型定義
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  metadata?: Record<string, string>;
}

/**
 * 決済セッションの作成オプション
 */
export interface CreateCheckoutSessionOptions {
  products: Product[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  printOption?: boolean;
}

/**
 * Stripe決済セッションを作成する関数
 * @param options 決済セッションの作成オプション
 * @returns 決済セッションのID
 */
export async function createCheckoutSession(options: CreateCheckoutSessionOptions): Promise<string> {
  try {
    const { products, customerEmail, successUrl, cancelUrl, metadata = {}, printOption = false } = options;
    
    // 決済アイテムの作成
    const lineItems = products.map(product => ({
      price_data: {
        currency: 'jpy',
        product_data: {
          name: product.name,
          description: product.description,
          metadata: {
            product_id: product.id,
            ...product.metadata,
          },
        },
        unit_amount: product.price,
      },
      quantity: 1,
    }));
    
    // 印刷オプションが選択されている場合、追加料金を設定
    if (printOption) {
      lineItems.push({
        price_data: {
          currency: 'jpy',
          product_data: {
            name: '印刷オプション',
            description: '写真の印刷と郵送サービス',
            metadata: {
              product_id: 'print-option',
            },
          },
          unit_amount: 500, // 印刷オプションの料金（500円）
        },
        quantity: 1,
      });
    }
    
    // セッションの作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        print_option: printOption ? 'true' : 'false',
      },
    });
    
    return session.id;
  } catch (error) {
    console.error('決済セッションの作成に失敗しました:', error);
    throw error;
  }
}

/**
 * 決済セッションの情報を取得する関数
 * @param sessionId 決済セッションのID
 * @returns 決済セッションの情報
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });
    
    return session;
  } catch (error) {
    console.error('決済セッション情報の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 決済の成功を確認する関数
 * @param sessionId 決済セッションのID
 * @returns 決済が成功したかどうか
 */
export async function verifyPaymentSuccess(sessionId: string): Promise<boolean> {
  try {
    const session = await getCheckoutSession(sessionId);
    return session.payment_status === 'paid';
  } catch (error) {
    console.error('決済確認に失敗しました:', error);
    return false;
  }
}

/**
 * 決済完了後のWebhookイベントを処理する関数
 * @param event Stripeイベント
 * @returns 処理結果
 */
export async function handlePaymentWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // 決済が完了した場合の処理
        if (session.payment_status === 'paid') {
          // ここで購入処理を完了させる（データベース更新など）
          console.log('決済が完了しました:', session.id);
          
          // 印刷オプションが選択されている場合の処理
          if (session.metadata?.print_option === 'true') {
            // 印刷サービスの処理を開始
            console.log('印刷オプションが選択されました:', session.id);
            // TODO: 印刷サービスの処理を実装
          }
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('決済に失敗しました:', paymentIntent.id);
        break;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Webhookの処理に失敗しました:', error);
    throw error;
  }
}

/**
 * 領収書のURLを生成する関数
 * @param sessionId 決済セッションのID
 * @returns 領収書のURL
 */
export async function generateReceiptUrl(sessionId: string): Promise<string | null> {
  try {
    const session = await getCheckoutSession(sessionId);
    
    if (session.payment_status !== 'paid') {
      return null;
    }
    
    const paymentIntentId = session.payment_intent as string;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent.latest_charge) {
      return null;
    }
    
    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
    
    return charge.receipt_url;
  } catch (error) {
    console.error('領収書URLの生成に失敗しました:', error);
    return null;
  }
} 
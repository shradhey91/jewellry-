
'use server';

import { z } from 'zod';
import { getSettings } from '@/lib/server/api';
import { randomUUID } from 'crypto';

const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg'; 

async function getCashfreeInstance() {
    const settings = await getSettings();
    const cashfreeSettings = settings.paymentGateways?.cashfree;

    if (!cashfreeSettings?.appId || !cashfreeSettings?.secretKey) {
        console.error("CRITICAL: Cashfree keys are not set in the admin settings.");
        return null;
    }

    return {
        appId: cashfreeSettings.appId,
        secretKey: cashfreeSettings.secretKey,
    };
}


export async function createCashfreeOrder(amount: number, customerDetails: { id: string, email: string, phone: string, name: string }) {
    const cashfree = await getCashfreeInstance();
    if (!cashfree) {
        return null;
    }

    const orderId = `order_${randomUUID()}`;

    try {
        const response = await fetch(`${CASHFREE_API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': cashfree.appId,
                'x-secret-key': cashfree.secretKey,
            },
            body: JSON.stringify({
                order_id: orderId,
                order_amount: amount,
                order_currency: "INR",
                customer_details: {
                    customer_id: customerDetails.id,
                    customer_email: customerDetails.email,
                    customer_phone: customerDetails.phone,
                    customer_name: customerDetails.name,
                },
                order_meta: {
                    // return_url is not used by this SDK flow but required by API in some cases.
                    return_url: `http://localhost:3000/checkout/order-confirmation/{order_id}`, 
                }
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Cashfree API Error:", errorBody);
            return null;
        }

        const order = await response.json();
        return {
            payment_session_id: order.payment_session_id,
            order_id: order.order_id
        };

    } catch (error) {
        console.error("Failed to create Cashfree order:", error);
        return null;
    }
}


export async function verifyCashfreePayment(orderId: string): Promise<boolean> {
     const cashfree = await getCashfreeInstance();
    if (!cashfree) {
        return false;
    }
    
    try {
        const response = await fetch(`${CASHFREE_API_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'x-api-version': '2023-08-01',
                'x-client-id': cashfree.appId,
                'x-secret-key': cashfree.secretKey,
            }
        });
        
        if (!response.ok) {
            return false;
        }

        const order = await response.json();
        return order.order_status === 'PAID';
    } catch (error) {
        console.error("Failed to verify Cashfree payment:", error);
        return false;
    }
}

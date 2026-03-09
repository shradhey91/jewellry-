
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSettings, saveSettings } from '@/lib/server/api';

const razorpaySchema = z.object({
  gateway: z.literal('razorpay'),
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
});

const cashfreeSchema = z.object({
    gateway: z.literal('cashfree'),
    appId: z.string().min(1, 'App ID is required'),
    secretKey: z.string().min(1, 'Secret Key is required'),
});

const paymentGatewaySchema = z.discriminatedUnion("gateway", [
    razorpaySchema,
    cashfreeSchema,
]);


export type PaymentGatewayFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function savePaymentGatewaySettings(
  prevState: PaymentGatewayFormState,
  formData: FormData
): Promise<PaymentGatewayFormState> {

  const gateway = formData.get('gateway') as string;
  let dataToValidate;

  if (gateway === 'razorpay') {
      dataToValidate = {
          gateway: 'razorpay',
          apiKey: formData.get('razorpay-apiKey') as string,
          apiSecret: formData.get('razorpay-apiSecret') as string,
      };
  } else if (gateway === 'cashfree') {
      dataToValidate = {
          gateway: 'cashfree',
          appId: formData.get('cashfree-appId') as string,
          secretKey: formData.get('cashfree-secretKey') as string,
      }
  } else {
      return { message: "Invalid payment gateway specified.", errors: { form: ["Invalid gateway."] } };
  }
  
  const validatedFields = paymentGatewaySchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      message: 'Failed to save settings. Invalid data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const currentSettings = await getSettings();
    
    if (!currentSettings.paymentGateways) {
        currentSettings.paymentGateways = {};
    }

    // @ts-ignore
    const { gateway: validatedGateway, ...rest } = validatedFields.data;

    currentSettings.paymentGateways[validatedGateway] = rest;

    await saveSettings(currentSettings);

  } catch(error) {
    console.error(error);
    return { message: 'Failed to save settings to the database.' };
  }
  
  revalidatePath('/admin/settings/payment');
  
  return { message: `${gateway.charAt(0).toUpperCase() + gateway.slice(1)} settings saved successfully.` };
}

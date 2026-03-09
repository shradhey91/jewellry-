
'use server';

import { getSettings } from "@/lib/server/api";

export async function checkDeliveryAvailability(pincode: string): Promise<{ available: boolean, message: string }> {
    if (!/^\d{6}$/.test(pincode)) {
        return { available: false, message: "Please enter a valid 6-digit pincode." };
    }

    try {
        const settings = await getSettings();
        const shippingSettings = settings.shipping || { blockedPincodes: [], blockedCities: [] };
        
        if (shippingSettings.blockedPincodes.includes(pincode)) {
            return { available: false, message: "Sorry, delivery is not available to this pincode." };
        }

        // This is a mock API call to get city from pincode. In a real app, you'd use a real service.
        const pincodeToCityMap: Record<string, string> = {
            '400001': 'mumbai',
            '110001': 'delhi',
            '560001': 'bangalore'
        }
        const city = (pincodeToCityMap[pincode] || 'unknown').toLowerCase();
        
        if (shippingSettings.blockedCities.includes(city)) {
            return { available: false, message: `Sorry, we do not deliver to ${city.charAt(0).toUpperCase() + city.slice(1)}.` };
        }

        return { available: true, message: "Great! Delivery is available to this pincode." };

    } catch (error) {
        console.error("Pincode check failed:", error);
        // Fail open: if there's an error, assume it's available
        return { available: true, message: "Delivery availability could not be confirmed, please proceed." };
    }
}

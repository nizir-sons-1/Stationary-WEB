/**
 * Shared Store Settings Hook
 *
 * Reads live store settings from Supabase (store_settings table) once per page session
 * using useSyncExternalStore so all components share the same reactive state.
 *
 * Exposes:
 *  - standardDeliveryFee (Rs)
 *  - goodsTransportMinFee (Rs)
 *  - isFreeShippingEnabled (boolean)
 *  - freeShippingThreshold (number | null)
 *  - contactPhone (e.g. '0320 2220001')
 *  - phoneE164 (e.g. '+923202220001')
 *  - contactWhatsapp (e.g. '923202220001')
 *  - whatsappUrl (e.g. 'https://wa.me/923202220001')
 *  - isAnnouncementEnabled (boolean)
 *  - announcementText (string)
 *  - hasAnnouncement (boolean)
 */

export { useSettings, useStoreSettings, DEFAULT_STORE_SETTINGS } from './useSupabase';

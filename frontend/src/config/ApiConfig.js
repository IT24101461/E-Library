/**
 * API Configuration
 * Detects environment and sets correct API base URL
 * - Web: http://localhost:8080/api
 * - Android Emulator: http://10.0.2.2:8080/api
 * - Android Device: http://{DEVICE_IP}:8080/api (requires manual setup)
 * - Production: process.env.REACT_APP_API_URL
 */

let isNativePlatform = false;
let platformName = 'web';

// Detect Capacitor immediately on load
try {
  // Method 1: Try Capacitor standard global
  if (window.Capacitor) {
    isNativePlatform = window.Capacitor.isNativePlatform?.();
    platformName = window.Capacitor.getPlatform?.();
    console.log(`[API Config] Method 1 - Detected platform via window.Capacitor: ${platformName}, isNative: ${isNativePlatform}`);
  }
  // Method 2: Try CapacitorGlobal
  else if (window.CapacitorGlobal?.['CapacitorCoreJS']) {
    const Cap = window.CapacitorGlobal['CapacitorCoreJS'];
    isNativePlatform = Cap.isNativePlatform();
    platformName = Cap.getPlatform();
    console.log(`[API Config] Method 2 - Detected platform via CapacitorGlobal: ${platformName}, isNative: ${isNativePlatform}`);
  }
  
  // If still not detected, check if running in Android WebView by user agent
  if (!isNativePlatform && window.navigator?.userAgent?.includes('Android')) {
    console.log('[API Config] Detected Android via user agent');
    isNativePlatform = true;
    platformName = 'android';
  }
} catch (e) {
  console.log('[API Config] Capacitor detection error:', e.message);
}

const isAndroid = () => {
  // Check if running in Capacitor (mobile app)
  const result = isNativePlatform && (platformName === 'android' || platformName?.toLowerCase?.()?.includes?.('android'));
  if (result) console.log('[API Config] Android detected');
  return result;
};

const isAndroidEmulator = () => {
  // Android emulator uses 10.0.2.2 to reach host machine
  // Check for Linux in user agent or emulator indicators
  const userAgent = window.navigator?.userAgent || '';
  const hasLinux = userAgent.includes('Linux');
  const isEmulator = userAgent.includes('emulator') || userAgent.includes('SDK');
  const result = isAndroid() && (hasLinux || isEmulator);
  if (result) console.log('[API Config] Android Emulator detected - using 10.0.2.2');
  return result;
};

export const getApiUrl = () => {
  const userAgent = window.navigator?.userAgent || '';
  const location = window.location?.protocol || '';
  
  // Log all detection info
  console.log(`[API Config] Detection info - isNative: ${isNativePlatform}, platform: ${platformName}, userAgent includes Android: ${userAgent.includes('Android')}, location: ${location}`);
  
  // Production environment - check for REACT_APP_API_BASE_URL or REACT_APP_API_URL
  if (process.env.REACT_APP_API_BASE_URL && !process.env.REACT_APP_API_BASE_URL.includes('localhost')) {
    const url = process.env.REACT_APP_API_BASE_URL.endsWith('/api') 
      ? process.env.REACT_APP_API_BASE_URL 
      : process.env.REACT_APP_API_BASE_URL + '/api';
    console.log(`[API Config] Using env REACT_APP_API_BASE_URL: ${url}`);
    return url;
  }
  if (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes('localhost')) {
    console.log(`[API Config] Using env REACT_APP_API_URL: ${process.env.REACT_APP_API_URL}`);
    return process.env.REACT_APP_API_URL;
  }

  // Android emulator - use 10.0.2.2 (host machine from emulator's perspective)
  if (isAndroidEmulator()) {
    console.log('[API Config] Using emulator URL: http://10.0.2.2:8080/api');
    return 'http://10.0.2.2:8080/api';
  }

  // Android physical device - needs to be configured
  if (isAndroid()) {
    // For physical devices, use environment variable or fallback
    const deviceIp = process.env.REACT_APP_DEVICE_IP || 'http://192.168.1.100:8080/api';
    console.warn(
      `[API Config] Android Physical Device detected. Using: ${deviceIp}. ` +
      `Set REACT_APP_DEVICE_IP environment variable if needed.`
    );
    return deviceIp;
  }

  // Web development
  console.log('[API Config] Using web URL: http://localhost:8080/api');
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiUrl();

export default {
  API_BASE_URL,
  getApiUrl,
  isAndroid,
  isAndroidEmulator
};

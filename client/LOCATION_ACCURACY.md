# Location Accuracy Guide for HowMuch

## Understanding GPS Location Accuracy

### How Browser Geolocation Works
The browser's `navigator.geolocation` API gets location from multiple sources:
1. **GPS** (Most accurate: 5-10 meters)
2. **WiFi Networks** (Moderate: 20-50 meters)
3. **Cell Towers** (Least accurate: 100-1000+ meters)
4. **IP Address** (Very inaccurate: city-level only)

The browser automatically selects the best available method.

---

## Why Your Location Might Be Inaccurate

### Common Issues:

1. **Indoor Location**
   - GPS signals are weak or blocked indoors
   - WiFi triangulation becomes primary source
   - Accuracy drops to 50-200 meters

2. **Device Settings**
   - Location services disabled or restricted
   - Browser doesn't have location permission
   - "High accuracy" mode is off (mobile)

3. **WiFi Database Issues**
   - Router location database is outdated
   - New buildings/areas not mapped
   - VPN can affect WiFi positioning

4. **Urban Environment**
   - Tall buildings block GPS signals ("urban canyon effect")
   - Signal reflections cause multipath errors
   - Metal structures interfere with GPS

5. **Device Limitations**
   - Laptop/desktop has no GPS chip (uses WiFi/IP only)
   - Low-quality GPS hardware on device
   - GPS chip is disabled to save battery

---

## How to Improve Location Accuracy

### On Desktop/Laptop:

1. **Enable Location Services (macOS)**
   ```
   System Preferences → Security & Privacy → Privacy → Location Services
   ✓ Enable Location Services
   ✓ Enable for your browser (Chrome/Safari/Firefox)
   ```

2. **Enable Location Services (Windows)**
   ```
   Settings → Privacy → Location
   ✓ Allow apps to access your location
   ✓ Enable for your browser
   ```

3. **Browser Permissions**
   - Chrome: `chrome://settings/content/location`
   - Safari: Preferences → Websites → Location
   - Firefox: `about:preferences#privacy` → Permissions → Location

4. **Connect to WiFi**
   - Desktop GPS is WiFi-based
   - More WiFi networks = better accuracy
   - Public WiFi spots are better mapped

5. **Move Near Windows**
   - Better GPS signal reception
   - More cell tower visibility

### On Mobile (iOS/Android):

1. **Enable High Accuracy Mode**
   
   **iOS:**
   ```
   Settings → Privacy & Security → Location Services
   ✓ Turn on Location Services
   → Safari (or your browser)
   → Select "While Using the App"
   → Turn on "Precise Location"
   ```

   **Android:**
   ```
   Settings → Location
   ✓ Turn on Location
   → Google Location Accuracy
   ✓ Turn on "Improve Location Accuracy"
   ```

2. **Go Outside**
   - Clear view of the sky improves GPS
   - Wait 30-60 seconds for GPS to lock

3. **Check Battery Saver**
   - Battery saver mode reduces GPS accuracy
   - Temporarily disable for better location

4. **Update System**
   - Outdated OS can have GPS bugs
   - Update for better accuracy

### For All Devices:

1. **Grant Browser Permissions**
   - Always click "Allow" when browser asks for location
   - Check "Remember this decision" for future visits

2. **Wait for GPS Lock**
   - First location fix can take 30-60 seconds
   - Accuracy improves over time
   - Look for "accuracy circle" to shrink on maps

3. **Verify Location in Google Maps**
   - Open Google Maps in browser
   - Check if your location is accurate there
   - If Maps is wrong, the issue is system-level

4. **Clear Browser Cache**
   - Old location cache can cause issues
   - Clear site data and try again

5. **Disable VPN/Proxy**
   - VPN masks your real location
   - Some VPNs break geolocation entirely

---

## Testing Your Location Accuracy

### Method 1: Use Our App
1. Go to the signup page
2. Watch the "Getting your location and address..." message
3. Compare detected city/address with your actual location
4. If wrong, try the fixes above

### Method 2: Test with Browser
Open browser console (F12) and run:
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('Latitude:', position.coords.latitude);
    console.log('Longitude:', position.coords.longitude);
    console.log('Accuracy:', position.coords.accuracy, 'meters');
  },
  (error) => console.error('Error:', error.message),
  { enableHighAccuracy: true, timeout: 30000 }
);
```

**Good accuracy:** < 50 meters
**Acceptable:** 50-200 meters
**Poor:** > 200 meters

### Method 3: Compare with Google Maps
1. Open https://maps.google.com
2. Click the location button (blue dot)
3. See the blue circle (accuracy radius)
4. Smaller circle = better accuracy

---

## Expected Accuracy in Nigeria

### Urban Areas (Lagos, Abuja, Port Harcourt):
- **With GPS:** 10-30 meters ✅
- **WiFi only:** 50-200 meters ⚠️
- **Cell towers:** 200-1000 meters ❌

### Suburban/Rural Areas:
- **With GPS:** 5-20 meters ✅
- **WiFi only:** 500+ meters ❌
- **Cell towers:** 1-5 km ❌

### Recommended:
- **Mobile users:** Use outside with GPS for best results
- **Desktop users:** Ensure WiFi is connected and location services enabled
- **Market vendors:** One-time accurate setup is crucial for customer discovery

---

## Troubleshooting Checklist

- [ ] Location services enabled (system level)
- [ ] Browser has location permission
- [ ] "High accuracy" / "Precise location" enabled (mobile)
- [ ] Not using VPN or proxy
- [ ] WiFi is connected (for desktop)
- [ ] Outside or near windows (for GPS)
- [ ] Waited 30+ seconds for GPS lock
- [ ] Browser is up to date
- [ ] System is up to date
- [ ] Tried a different browser
- [ ] Tested location on Google Maps first

---

## Technical Details for Developers

### Our Implementation:
```typescript
navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  {
    enableHighAccuracy: true,  // Request GPS, not just WiFi/Cell
    timeout: 30000,            // 30 seconds to get location
    maximumAge: 0              // Don't use cached location
  }
);
```

### Coordinate Precision:
- Frontend: 6 decimal places (~11cm accuracy)
- Backend: 7 decimal places (~1.1cm accuracy)
- GPS typically provides 7-8 decimal places

### Reverse Geocoding:
- **Service:** OpenStreetMap Nominatim
- **Accuracy:** Depends on GPS input
- **Coverage:** Good in Nigerian cities, limited in rural areas
- **Fallback:** Prioritizes city > town > village > state

---

## For Vendors: One-Time Setup

If you're a vendor setting up your store location:

1. **Do this once, accurately:**
   - Use your mobile phone
   - Go outside your shop/market
   - Wait for GPS to stabilize (30 seconds)
   - Complete signup

2. **If location is wrong:**
   - You can manually edit address during signup
   - Contact support to update location later
   - Consider using Google Maps to find exact coordinates

3. **Why accuracy matters:**
   - Customers find you based on proximity
   - Inaccurate location = lost customers
   - Market/neighborhood detection depends on coordinates

---

## Still Having Issues?

### Quick Fixes:
1. **Try mobile instead of desktop** (mobile has real GPS)
2. **Go outside** (better GPS signal)
3. **Use Chrome or Safari** (better geolocation support)
4. **Restart browser** (clear location cache)
5. **Check Google Maps first** (verify system-level location works)

### Need Help?
- Check browser console (F12) for error messages
- Share error message with support
- Include: device type, browser, OS version
- Test on Google Maps first to isolate the issue

---

## Summary: Best Practices

✅ **Do:**
- Use mobile for signup (has GPS)
- Allow location permissions
- Enable high accuracy mode
- Wait for GPS to stabilize
- Do setup outside or near windows
- Verify on Google Maps first

❌ **Don't:**
- Use VPN during signup
- Deny location permission
- Rush the GPS lock
- Signup in basements/windowless rooms
- Ignore "accuracy circle" size
- Use desktop if possible (no real GPS)

---

**Remember:** Good location = Better customer experience = More sales for vendors!

# API Configuration Guide

The mobile app is configured to connect to the backend server. Here's how to configure it for different scenarios:

## Current Configuration

- **Default URL**: `http://localhost:3001/api`
- **Backend Server**: Running on port `3001` (to avoid macOS AirPlay conflict)

## Configuration Options

### 1. iOS Simulator / Android Emulator

The default configuration works out of the box:
```
http://localhost:3001/api
```

No changes needed! ✅

### 2. Physical Devices (iPhone/Android)

You need to use your computer's IP address instead of `localhost`:

1. **Find your computer's IP address:**
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```
   
   Look for something like: `192.168.1.24`

2. **Create a `.env` file in the `mobile` directory:**
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.24:3001/api
   ```
   
   Replace `192.168.1.24` with your actual IP address.

3. **Restart your Expo development server:**
   ```bash
   npm start
   ```

### 3. Production

Set the production API URL:
```env
EXPO_PUBLIC_API_URL=https://your-production-api.com/api
```

## Quick Setup for Physical Devices

1. Find your IP (current detected: `192.168.1.24`)
2. Create `mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.24:3001/api
   ```
3. Restart Expo: `npm start`

## Testing the Connection

The app will log the API URL when it starts:
```
🔗 API Base URL: http://localhost:3001/api
```

## Troubleshooting

### Can't connect from physical device?

1. **Check your computer's IP address** - it may have changed
2. **Ensure both devices are on the same WiFi network**
3. **Check firewall settings** - make sure port 3001 is not blocked
4. **Verify backend is running**: `curl http://localhost:3001/health`

### Connection refused errors?

- Make sure the backend server is running
- Check that you're using the correct IP address
- Verify the port is `3001` (not `5000`)

## Current Backend Status

- **URL**: `http://localhost:3001`
- **Status**: ✅ Running
- **CORS**: ✅ Enabled (allows all origins)
- **MongoDB**: ✅ Connected


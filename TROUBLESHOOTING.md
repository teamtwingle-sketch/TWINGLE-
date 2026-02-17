# Troubleshooting: Server Not Found (twingle.online)

You are seeing a "Safari Can't Find the Server" error for `twingle.online`. This indicates a DNS or Connectivity issue.

## 1. If you are trying to access the Production Site
If you have deployed your application to a hosting provider (like Railway, Vercel, or Heroku) and want to use the domain `twingle.online`:

1.  **Check Domain Configuration**:
    *   Go to your Domain Registrar (where you bought `twingle.online`).
    *   Ensure you have added the correct **DNS Records** (A Record or CNAME) pointing to your hosting provider.
    *   *Note: DNS propagation can take up to 24-48 hours, but usually happens within minutes.*

2.  **Check Hosting Provider**:
    *   Go to your Railway/Vercel dashboard.
    *   Verify that the "Custom Domain" setting is configured for `twingle.online`.
    *   Check if the deployment itself is "Active" and "Healthy".

## 2. If you are running the app Locally (Recommended for Development)
If you are developing on your Mac, **you cannot use `twingle.online`** unless you have edited your system's host file (advanced).

Instead, you should use the **Localhost** URLs:

*   **Frontend (Web App)**: [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)
*   **Backend (API)**: [http://localhost:8000](http://localhost:8000)

### How to Run Locally
1.  Open your terminal.
2.  Run the helper script:
    ```bash
    python3 run_app.py
    ```
    *This starts both the Django backend and Vite frontend.*

### Connecting Mobile App Locally
The mobile app is currently hardcoded to use `https://twingle.online` in `mobile/lib/api/client.dart`.
To test the mobile app with your local server:

1.  Find your Mac's Local IP Address (e.g., `192.168.1.5`):
    *   Run `ipconfig getifaddr en0` in terminal.
2.  Update `mobile/lib/api/client.dart`:
    ```dart
    static String get baseUrl {
      // For local testing on Android Emulator use 10.0.2.2
      // For iOS Simulator use localhost
      // For Physical Device use your Mac's IP (e.g. 192.168.1.x)
      return 'http://192.168.1.17:8000/api'; 
    }
    ```

### Android Local Testing Note
If testing on a physical Android device with a local HTTP server, you might need to enable cleartext traffic in `mobile/android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:label="Twingle"
    android:name="${applicationName}"
    android:usesCleartextTraffic="true"  <!-- Add this line -->
    ...
>
```

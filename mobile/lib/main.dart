import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  if (Platform.isAndroid) {
    await InAppWebViewController.setWebContentsDebuggingEnabled(true);
  }
  
  runApp(const TwingleApp());
}

class TwingleApp extends StatelessWidget {
  const TwingleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Twingle',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFEC4899)),
        useMaterial3: true,
      ),
      home: const WebAppScreen(),
    );
  }
}

class WebAppScreen extends StatefulWidget {
  const WebAppScreen({super.key});

  @override
  State<WebAppScreen> createState() => _WebAppScreenState();
}

class _WebAppScreenState extends State<WebAppScreen> {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? webViewController;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _requestRequiredPermissions();
  }

  Future<void> _requestRequiredPermissions() async {
    await [
      Permission.camera,
      Permission.microphone,
      Permission.storage,
      Permission.mediaLibrary,
      Permission.photos,
    ].request();
  }

  Future<void> _saveBase64ToDownloads(String dataUrl, String fileName) async {
    try {
      final base64idx = dataUrl.indexOf("base64,");
      if (base64idx == -1) return;
      
      final base64String = dataUrl.substring(base64idx + 7);
      final bytes = base64Decode(base64String);

      // Save directly to internal Downloads folder on Android for easy access
      if (Platform.isAndroid) {
        String path = '/storage/emulated/0/Download/$fileName';
        File file = File(path);
        
        // Ensure path is unique so we don't overwrite if downloading quickly multiple times
        int counter = 1;
        while (await file.exists()) {
          final extIndex = fileName.lastIndexOf('.');
          final finalName = fileName.substring(0, extIndex) + ' ($counter)' + fileName.substring(extIndex);
          path = '/storage/emulated/0/Download/$finalName';
          file = File(path);
          counter++;
        }
        
        await file.writeAsBytes(bytes);
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Payment QR Code saved to Downloads!')),
          );
        }
      }
    } catch (e) {
      debugPrint("Download Base64 Error: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
           const SnackBar(content: Text('Failed to save Image')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const safeAreaColor = Color(0xFFEC4899); 
    
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            InAppWebView(
              key: webViewKey,
              initialUrlRequest: URLRequest(
                url: WebUri("https://twingle.online/"),
              ),
              initialSettings: InAppWebViewSettings(
                isInspectable: true,
                mediaPlaybackRequiresUserGesture: false,
                allowsInlineMediaPlayback: true,
                useShouldOverrideUrlLoading: true,
                useOnDownloadStart: true,            // VERY IMPORTANT TO ENABLE DOWNLOADS
                javaScriptEnabled: true,
                transparentBackground: true,
              ),
              onWebViewCreated: (controller) {
                webViewController = controller;
              },
              onLoadStart: (controller, url) {
                setState(() { _isLoading = true; });
              },
              onLoadStop: (controller, url) {
                setState(() { _isLoading = false; });
              },
              onProgressChanged: (controller, progress) {
                if (progress == 100) {
                  setState(() { _isLoading = false; });
                }
              },
              androidOnPermissionRequest: (controller, origin, resources) async {
                return PermissionRequestResponse(
                  resources: resources,
                  action: PermissionRequestResponseAction.GRANT,
                );
              },
              shouldOverrideUrlLoading: (controller, navigationAction) async {
                var uri = navigationAction.request.url!;
                
                // If it's an external URL scheme (e.g. upi://, whatsapp://) or standard internet
                if (![ "http", "https", "file", "chrome", "data", "javascript", "about" ].contains(uri.scheme)) {
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri);
                    return NavigationActionPolicy.CANCEL;
                  }
                }
                
                return NavigationActionPolicy.ALLOW;
              },
              
              // Handle Downloads! Specially for Data URLs (QR Code generation inside webapp)
              onDownloadStartRequest: (controller, downloadRequest) async {
                String urlAsString = downloadRequest.url.toString();
                String fileName = downloadRequest.suggestedFilename ?? "twingle-qr.jpg";
                
                if (urlAsString.startsWith("data:")) {
                   await _saveBase64ToDownloads(urlAsString, fileName);
                } else {
                   // Normal URLs -> send them to the browser or external downloader
                   if (await canLaunchUrl(downloadRequest.url)) {
                      await launchUrl(downloadRequest.url, mode: LaunchMode.externalApplication);
                   }
                }
              },
            ),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(
                  color: safeAreaColor,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

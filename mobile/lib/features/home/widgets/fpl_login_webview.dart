import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/theme/app_colors.dart';

/// Opens the PingOne OAuth login in a WebView and intercepts the redirect
/// to `premierleague.com/robots.txt?code=XXX`, returning the code automatically.
class FplLoginWebView extends StatefulWidget {
  final String authUrl;

  const FplLoginWebView({super.key, required this.authUrl});

  @override
  State<FplLoginWebView> createState() => _FplLoginWebViewState();
}

class _FplLoginWebViewState extends State<FplLoginWebView> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            final uri = Uri.tryParse(request.url);
            if (uri != null &&
                uri.host.contains('premierleague.com') &&
                uri.path.contains('robots.txt')) {
              final code = uri.queryParameters['code'];
              if (code != null && code.isNotEmpty) {
                Navigator.of(context).pop(code);
                return NavigationDecision.prevent;
              }
            }
            return NavigationDecision.navigate;
          },
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) => setState(() => _loading = false),
        ),
      )
      ..loadRequest(Uri.parse(widget.authUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Sign in to FPL'),
        backgroundColor: AppColors.card,
        foregroundColor: AppColors.text,
        elevation: 0,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loading)
            const LinearProgressIndicator(
              color: AppColors.primary,
              backgroundColor: AppColors.card,
            ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/dio_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/datasources/fpl_remote_datasource.dart';
import '../providers/squad_providers.dart';
import 'fpl_login_webview.dart';

class TeamIdInput extends ConsumerStatefulWidget {
  const TeamIdInput({super.key});

  @override
  ConsumerState<TeamIdInput> createState() => _TeamIdInputState();
}

class _TeamIdInputState extends ConsumerState<TeamIdInput> {
  final _controller = TextEditingController();
  bool _signingIn = false;
  String? _authError;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final id = int.tryParse(_controller.text.trim());
    if (id == null || id <= 0) return;
    ref.read(savedTeamIdProvider.notifier).set(id);
    FocusScope.of(context).unfocus();
  }

  Future<void> _startSignIn() async {
    setState(() {
      _authError = null;
      _signingIn = true;
    });

    try {
      final client = ref.read(dioClientProvider);
      final datasource = FplRemoteDatasource(client);
      final url = await datasource.getAuthUrl();

      if (!mounted) return;

      // Open WebView and wait for the code
      final code = await Navigator.of(context).push<String>(
        MaterialPageRoute(
          builder: (_) => FplLoginWebView(authUrl: url),
        ),
      );

      if (!mounted) return;

      if (code == null || code.isEmpty) {
        setState(() {
          _signingIn = false;
        });
        return;
      }

      // Exchange code for tokens
      final success =
          await ref.read(savedAuthTokenProvider.notifier).login(code);

      if (!mounted) return;

      setState(() {
        _signingIn = false;
        if (!success) {
          _authError = 'Login failed. Please try again.';
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _authError = 'Failed to start login.';
        _signingIn = false;
      });
    }
  }

  void _signOut() {
    ref.read(savedAuthTokenProvider.notifier).clear();
    setState(() => _authError = null);
  }

  @override
  Widget build(BuildContext context) {
    final authToken = ref.watch(savedAuthTokenProvider);
    final isSignedIn = authToken != null && authToken.isNotEmpty;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.sports_soccer, size: 64, color: AppColors.primary),
          const SizedBox(height: 24),
          const Text(
            'FPL Alpha',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Enter your FPL Team ID to get started',
            style: TextStyle(color: AppColors.textMuted),
          ),
          const SizedBox(height: 32),
          TextField(
            controller: _controller,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: const InputDecoration(
              labelText: 'Team ID',
              hintText: 'e.g. 1234567',
              prefixIcon: Icon(Icons.tag),
            ),
            onSubmitted: (_) => _submit(),
          ),
          const SizedBox(height: 12),
          // Auth section
          if (isSignedIn)
            _buildSignedInChip()
          else
            _buildSignInButton(),
          if (_authError != null) ...[
            const SizedBox(height: 8),
            Text(
              _authError!,
              style: const TextStyle(color: AppColors.danger, fontSize: 13),
            ),
          ],
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submit,
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('Load Squad'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSignedInChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.accent.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.check_circle, color: AppColors.accent, size: 18),
          const SizedBox(width: 8),
          const Text(
            'Signed in to FPL',
            style: TextStyle(
                color: AppColors.accent, fontWeight: FontWeight.w600),
          ),
          const Spacer(),
          TextButton(
            onPressed: _signOut,
            style: TextButton.styleFrom(
              foregroundColor: AppColors.textMuted,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
  }

  Widget _buildSignInButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _signingIn ? null : _startSignIn,
        icon: _signingIn
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.login),
        label: Text(_signingIn ? 'Signing in…' : 'Sign in with FPL'),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary),
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }
}

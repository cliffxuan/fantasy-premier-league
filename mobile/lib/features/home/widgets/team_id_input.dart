import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../providers/squad_providers.dart';

class TeamIdInput extends ConsumerStatefulWidget {
  const TeamIdInput({super.key});

  @override
  ConsumerState<TeamIdInput> createState() => _TeamIdInputState();
}

class _TeamIdInputState extends ConsumerState<TeamIdInput> {
  final _controller = TextEditingController();
  final _authController = TextEditingController();
  bool _showAuth = false;

  @override
  void dispose() {
    _controller.dispose();
    _authController.dispose();
    super.dispose();
  }

  void _submit() {
    final id = int.tryParse(_controller.text.trim());
    if (id == null || id <= 0) return;
    ref.read(savedTeamIdProvider.notifier).set(id);
    if (_authController.text.trim().isNotEmpty) {
      ref.read(savedAuthTokenProvider.notifier).set(_authController.text.trim());
    }
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
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
          if (_showAuth) ...[
            TextField(
              controller: _authController,
              decoration: const InputDecoration(
                labelText: 'Auth Token (optional)',
                hintText: 'For private team access',
                prefixIcon: Icon(Icons.lock_outline),
              ),
            ),
            const SizedBox(height: 12),
          ],
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: _submit,
                  child: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text('Load Squad'),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: Icon(
                  _showAuth ? Icons.lock_open : Icons.lock_outline,
                  color: AppColors.textMuted,
                ),
                onPressed: () => setState(() => _showAuth = !_showAuth),
                tooltip: 'Auth Token',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

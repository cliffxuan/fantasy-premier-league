import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../providers/solver_providers.dart';

class SolverForm extends ConsumerWidget {
  const SolverForm({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final params = ref.watch(solverParamsProvider);
    final result = ref.watch(solverResultProvider);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Optimization Settings',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            const SizedBox(height: 12),
            // Budget slider
            Row(
              children: [
                const Text('Budget:', style: TextStyle(fontSize: 13)),
                Expanded(
                  child: Slider(
                    value: params.budget,
                    min: 80,
                    max: 120,
                    divisions: 40,
                    label: '£${params.budget.toStringAsFixed(1)}m',
                    onChanged: (v) =>
                        ref.read(solverParamsProvider.notifier).setBudget(v),
                  ),
                ),
                Text(
                  '£${params.budget.toStringAsFixed(1)}m',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
            // Toggles
            SwitchListTile(
              dense: true,
              title: const Text('Exclude bench', style: TextStyle(fontSize: 13)),
              value: params.excludeBench,
              onChanged: (v) =>
                  ref.read(solverParamsProvider.notifier).setExcludeBench(v),
            ),
            SwitchListTile(
              dense: true,
              title: const Text('Exclude unavailable',
                  style: TextStyle(fontSize: 13)),
              value: params.excludeUnavailable,
              onChanged: (v) => ref
                  .read(solverParamsProvider.notifier)
                  .setExcludeUnavailable(v),
            ),
            SwitchListTile(
              dense: true,
              title: const Text('Use ML predictions',
                  style: TextStyle(fontSize: 13)),
              value: params.useMl,
              onChanged: (v) =>
                  ref.read(solverParamsProvider.notifier).setUseMl(v),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: result.isLoading
                    ? null
                    : () => ref.read(solverResultProvider.notifier).solve(),
                child: result.isLoading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.text,
                        ),
                      )
                    : const Text('Solve'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

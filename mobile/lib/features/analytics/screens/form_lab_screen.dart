import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../providers/form_providers.dart';
import '../widgets/form_player_card.dart';

class FormLabScreen extends ConsumerWidget {
  const FormLabScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formAsync = ref.watch(formAnalysisProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Form Lab')),
      body: formAsync.when(
        loading: () => const LoadingIndicator(message: 'Analyzing form...'),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(formAnalysisProvider),
        ),
        data: (players) {
          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(formAnalysisProvider),
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              itemCount: players.length,
              itemBuilder: (context, index) {
                return FormPlayerCard(player: players[index]);
              },
            ),
          );
        },
      ),
    );
  }
}

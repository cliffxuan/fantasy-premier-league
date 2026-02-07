import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../providers/player_comparison_providers.dart';
import '../providers/player_explorer_providers.dart';
import '../widgets/player_detail_sheet.dart';
import '../widgets/player_filter_bar.dart';
import '../widgets/player_list_tile.dart';
import 'player_comparison_screen.dart';

class PlayerExplorerScreen extends ConsumerWidget {
  const PlayerExplorerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playersAsync = ref.watch(filteredPlayersProvider);
    final comparisonMode = ref.watch(comparisonModeActiveProvider);
    final selection = ref.watch(playerComparisonSelectionProvider);

    return Stack(
      children: [
        Column(
          children: [
            const PlayerFilterBar(),
            const SizedBox(height: 4),
            if (comparisonMode)
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: Row(
                  children: [
                    Text(
                      '${selection.length} selected',
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 12,
                      ),
                    ),
                    const Spacer(),
                    if (selection.length >= 2)
                      TextButton(
                        onPressed: () {
                          Navigator.of(context, rootNavigator: true).push(
                            MaterialPageRoute(
                              builder: (_) => const PlayerComparisonScreen(),
                            ),
                          );
                        },
                        child: const Text('Compare'),
                      ),
                    TextButton(
                      onPressed: () {
                        ref
                            .read(playerComparisonSelectionProvider.notifier)
                            .clear();
                        ref
                            .read(comparisonModeActiveProvider.notifier)
                            .disable();
                      },
                      child: const Text(
                        'Cancel',
                        style: TextStyle(color: AppColors.textMuted),
                      ),
                    ),
                  ],
                ),
              ),
            Expanded(
              child: playersAsync.when(
                loading: () =>
                    const LoadingIndicator(message: 'Loading players...'),
                error: (e, _) => ErrorView(
                  message: e.toString(),
                  onRetry: () => ref.invalidate(aggregatedPlayersProvider),
                ),
                data: (players) {
                  return ListView.builder(
                    itemCount: players.length,
                    itemBuilder: (context, index) {
                      final player = players[index];
                      final isSelected = comparisonMode &&
                          ref
                              .read(playerComparisonSelectionProvider.notifier)
                              .isSelected(player.id);

                      return PlayerListTile(
                        player: player,
                        selectable: comparisonMode,
                        selected: isSelected,
                        onTap: comparisonMode
                            ? () => ref
                                .read(
                                    playerComparisonSelectionProvider.notifier)
                                .toggle(player)
                            : () => showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.transparent,
                                  builder: (_) =>
                                      PlayerDetailSheet(player: player),
                                ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
        if (!comparisonMode)
          Positioned(
            right: 16,
            bottom: 16,
            child: FloatingActionButton.small(
              backgroundColor: AppColors.primary,
              onPressed: () {
                ref.read(playerComparisonSelectionProvider.notifier).clear();
                ref.read(comparisonModeActiveProvider.notifier).toggle();
              },
              child: const Icon(Icons.compare_arrows, size: 20),
            ),
          ),
      ],
    );
  }
}

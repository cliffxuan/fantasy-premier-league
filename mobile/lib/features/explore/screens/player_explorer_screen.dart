import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../providers/player_explorer_providers.dart';
import '../widgets/player_detail_sheet.dart';
import '../widgets/player_filter_bar.dart';
import '../widgets/player_list_tile.dart';

class PlayerExplorerScreen extends ConsumerWidget {
  const PlayerExplorerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playersAsync = ref.watch(filteredPlayersProvider);

    return Column(
      children: [
        const PlayerFilterBar(),
        const SizedBox(height: 4),
        Expanded(
          child: playersAsync.when(
            loading: () => const LoadingIndicator(message: 'Loading players...'),
            error: (e, _) => ErrorView(
              message: e.toString(),
              onRetry: () => ref.invalidate(aggregatedPlayersProvider),
            ),
            data: (players) {
              return ListView.builder(
                itemCount: players.length,
                itemBuilder: (context, index) {
                  final player = players[index];
                  return PlayerListTile(
                    player: player,
                    onTap: () => showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => PlayerDetailSheet(player: player),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

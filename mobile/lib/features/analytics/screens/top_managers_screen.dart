import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/player_image.dart';
import '../../../core/widgets/player_quick_sheet.dart';
import '../../../core/widgets/team_badge.dart';
import '../providers/top_managers_providers.dart';

class TopManagersScreen extends ConsumerWidget {
  const TopManagersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dataAsync = ref.watch(topManagersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Top Managers')),
      body: dataAsync.when(
        loading: () => const LoadingIndicator(message: 'Loading...'),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(topManagersProvider),
        ),
        data: (data) {
          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(topManagersProvider),
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              itemCount: data.players.length,
              itemBuilder: (context, index) {
                final player = data.players[index];
                return Card(
                  child: ListTile(
                    onTap: () => PlayerQuickSheet.show(
                      context,
                      playerId: player.id,
                      playerCode: player.code,
                      playerName: player.webName,
                      playerTeam: player.teamShort,
                    ),
                    leading: PlayerImage(playerCode: player.code, size: 36),
                    title: Row(
                      children: [
                        Flexible(
                          child: Text(
                            player.webName,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        TeamBadge(teamCode: player.teamCode, size: 16),
                      ],
                    ),
                    subtitle: Text(
                      'Top 1K: ${player.ownershipTop1000.toStringAsFixed(1)}% | Global: ${player.globalOwnership.toStringAsFixed(1)}%',
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                      ),
                    ),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (player.captainTop1000 > 0)
                          Text(
                            'C: ${player.captainTop1000.toStringAsFixed(1)}%',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        Text(
                          '${player.rankDiff > 0 ? "+" : ""}${player.rankDiff.toStringAsFixed(1)}%',
                          style: TextStyle(
                            color: player.rankDiff > 0
                                ? AppColors.accent
                                : AppColors.danger,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

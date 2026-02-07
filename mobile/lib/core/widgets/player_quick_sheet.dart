import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../theme/app_colors.dart';
import '../../features/explore/providers/player_explorer_providers.dart';
import '../../features/home/widgets/next_fixtures_section.dart';
import '../../features/home/widgets/recent_form_section.dart';
import 'player_image.dart';

/// Lightweight player detail sheet that can be shown from any screen
/// given only a player ID, code, and name.
class PlayerQuickSheet extends ConsumerWidget {
  final int playerId;
  final int playerCode;
  final String playerName;
  final String? playerTeam;

  const PlayerQuickSheet({
    super.key,
    required this.playerId,
    required this.playerCode,
    required this.playerName,
    this.playerTeam,
  });

  static void show(
    BuildContext context, {
    required int playerId,
    required int playerCode,
    required String playerName,
    String? playerTeam,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => PlayerQuickSheet(
        playerId: playerId,
        playerCode: playerCode,
        playerName: playerName,
        playerTeam: playerTeam,
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(playerSummaryProvider(playerId));

    return DraggableScrollableSheet(
      initialChildSize: 0.55,
      minChildSize: 0.3,
      maxChildSize: 0.85,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: AppColors.textMuted.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Header — shown immediately (no async needed)
              Row(
                children: [
                  PlayerImage(playerCode: playerCode, size: 64),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          playerName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.text,
                          ),
                        ),
                        if (playerTeam != null && playerTeam!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              playerTeam!,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Async summary data
              summaryAsync.when(
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                error: (e, _) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Column(
                    children: [
                      const Text(
                        'Could not load details',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () => ref.invalidate(
                          playerSummaryProvider(playerId),
                        ),
                        child: const Text(
                          'Tap to retry',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                data: (summary) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (summary.history.isNotEmpty) ...[
                      RecentFormSection(history: summary.history),
                    ],
                    if (summary.fixtures.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      NextFixturesSection(fixtures: summary.fixtures),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

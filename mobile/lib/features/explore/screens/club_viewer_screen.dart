import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/fdr_badge.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/player_quick_sheet.dart';
import '../../../core/widgets/section_card.dart';
import '../../../core/widgets/team_badge.dart';
import '../providers/club_viewer_providers.dart';
import '../widgets/club_selector.dart';

class ClubViewerScreen extends ConsumerWidget {
  const ClubViewerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedId = ref.watch(selectedClubIdProvider);

    return Column(
      children: [
        const SizedBox(height: 8),
        const ClubSelector(),
        const SizedBox(height: 8),
        Expanded(
          child: selectedId == null
              ? const Center(
                  child: Text(
                    'Select a club to view details',
                    style: TextStyle(color: AppColors.textMuted),
                  ),
                )
              : _ClubDetails(clubId: selectedId),
        ),
      ],
    );
  }
}

class _ClubDetails extends ConsumerWidget {
  final int clubId;

  const _ClubDetails({required this.clubId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(clubSummaryProvider(clubId));

    return summaryAsync.when(
      loading: () => const LoadingIndicator(),
      error: (e, _) => ErrorView(
        message: e.toString(),
        onRetry: () => ref.invalidate(clubSummaryProvider(clubId)),
      ),
      data: (summary) {
        return ListView(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          children: [
            // Club header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    TeamBadge(
                      teamCode: summary.team['code'] as int? ?? 0,
                      size: 48,
                    ),
                    const SizedBox(width: 16),
                    Text(
                      summary.team['name'] as String? ?? 'Club',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Top players
            if (summary.topPlayers.isNotEmpty)
              SectionCard(
                title: 'Top Players',
                child: Column(
                  children: summary.topPlayers.map((p) {
                    return GestureDetector(
                      onTap: () => PlayerQuickSheet.show(
                        context,
                        playerId: p.id,
                        playerCode: p.code,
                        playerName: p.webName,
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                p.webName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Text(
                              '${p.totalPoints} pts',
                              style: const TextStyle(
                                color: AppColors.accent,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

            // Upcoming fixtures
            if (summary.upcomingFixtures.isNotEmpty)
              SectionCard(
                title: 'Upcoming Fixtures',
                child: Column(
                  children: summary.upcomingFixtures.map((f) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          FdrBadge(difficulty: f.difficulty),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${f.opponentShort} (${f.isHome ? "H" : "A"})',
                              style: const TextStyle(fontSize: 13),
                            ),
                          ),
                          Text(
                            'GW ${f.event ?? "-"}',
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),

            // Recent results
            if (summary.recentResults.isNotEmpty)
              SectionCard(
                title: 'Recent Results',
                child: Column(
                  children: summary.recentResults.map((f) {
                    final resultColor = switch (f.result) {
                      'W' => AppColors.accent,
                      'D' => AppColors.warning,
                      'L' => AppColors.danger,
                      _ => AppColors.textMuted,
                    };
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: resultColor.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              f.result ?? '-',
                              style: TextStyle(
                                color: resultColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${f.opponentShort} (${f.isHome ? "H" : "A"}) ${f.score ?? ""}',
                              style: const TextStyle(fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            const SizedBox(height: 16),
          ],
        );
      },
    );
  }
}

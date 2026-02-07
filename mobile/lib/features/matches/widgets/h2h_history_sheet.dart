import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../data/models/h2h_match.dart';
import '../providers/fixtures_providers.dart';

class H2hHistorySheet extends ConsumerStatefulWidget {
  final int teamHId;
  final int teamAId;
  final String? teamHName;
  final String? teamAName;

  const H2hHistorySheet({
    super.key,
    required this.teamHId,
    required this.teamAId,
    this.teamHName,
    this.teamAName,
  });

  @override
  ConsumerState<H2hHistorySheet> createState() => _H2hHistorySheetState();
}

class _H2hHistorySheetState extends ConsumerState<H2hHistorySheet> {
  bool _sameVenueOnly = false;

  @override
  Widget build(BuildContext context) {
    final historyAsync =
        ref.watch(h2hHistoryProvider(widget.teamHId, widget.teamAId));

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.3,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.only(top: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.textMuted,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  '${widget.teamHName ?? 'Home'} vs ${widget.teamAName ?? 'Away'}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Expanded(
                child: historyAsync.when(
                  loading: () => const LoadingIndicator(),
                  error: (e, _) => Center(
                    child: Text(
                      e.toString(),
                      style: const TextStyle(color: AppColors.danger),
                    ),
                  ),
                  data: (allMatches) {
                    if (allMatches.isEmpty) {
                      return const Center(
                        child: Text(
                          'No head-to-head history found',
                          style: TextStyle(color: AppColors.textMuted),
                        ),
                      );
                    }

                    final matches = _sameVenueOnly
                        ? allMatches
                            .where((m) => m.matchIsHome)
                            .toList()
                        : allMatches;

                    return ListView(
                      controller: scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      children: [
                        // Stats bar
                        _H2hStatsBar(
                          matches: matches,
                          teamHName: widget.teamHName,
                          teamAName: widget.teamAName,
                          teamHId: widget.teamHId,
                        ),
                        const SizedBox(height: 12),
                        // Venue filter
                        Row(
                          children: [
                            _FilterChip(
                              label: 'All Matches',
                              selected: !_sameVenueOnly,
                              onTap: () =>
                                  setState(() => _sameVenueOnly = false),
                            ),
                            const SizedBox(width: 8),
                            _FilterChip(
                              label: 'Same Venue',
                              selected: _sameVenueOnly,
                              onTap: () =>
                                  setState(() => _sameVenueOnly = true),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        if (matches.isEmpty)
                          const Padding(
                            padding: EdgeInsets.only(top: 24),
                            child: Center(
                              child: Text(
                                'No matches at this venue',
                                style: TextStyle(color: AppColors.textMuted),
                              ),
                            ),
                          )
                        else
                          ...matches.map((m) => _H2hMatchTile(
                                match: m,
                                teamHId: widget.teamHId,
                              )),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : AppColors.background,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
            color: selected ? AppColors.text : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

class _H2hStatsBar extends StatelessWidget {
  final List<H2hMatch> matches;
  final String? teamHName;
  final String? teamAName;
  final int teamHId;

  const _H2hStatsBar({
    required this.matches,
    this.teamHName,
    this.teamAName,
    required this.teamHId,
  });

  @override
  Widget build(BuildContext context) {
    int wins = 0, draws = 0, losses = 0;
    for (final m in matches) {
      final isTeamHHome = m.homeTeamId == teamHId;
      final hGoals = isTeamHHome ? m.scoreHome : m.scoreAway;
      final aGoals = isTeamHHome ? m.scoreAway : m.scoreHome;
      if (hGoals > aGoals) {
        wins++;
      } else if (hGoals == aGoals) {
        draws++;
      } else {
        losses++;
      }
    }
    final total = wins + draws + losses;
    if (total == 0) return const SizedBox.shrink();

    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: Row(
            children: [
              Expanded(
                flex: (wins * 100 ~/ total).clamp(1, 100),
                child: Container(height: 6, color: AppColors.primary),
              ),
              Expanded(
                flex: (draws * 100 ~/ total).clamp(1, 100),
                child: Container(height: 6, color: AppColors.textMuted),
              ),
              Expanded(
                flex: (losses * 100 ~/ total).clamp(1, 100),
                child: Container(height: 6, color: AppColors.danger),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${teamHName ?? 'Home'} $wins',
              style: const TextStyle(
                color: AppColors.primary,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              '$draws draws',
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 11,
              ),
            ),
            Text(
              '${teamAName ?? 'Away'} $losses',
              style: const TextStyle(
                color: AppColors.danger,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          'Based on $total meeting${total != 1 ? 's' : ''}',
          style: const TextStyle(
            color: AppColors.textMuted,
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}

class _H2hMatchTile extends StatelessWidget {
  final H2hMatch match;
  final int teamHId;

  const _H2hMatchTile({required this.match, required this.teamHId});

  @override
  Widget build(BuildContext context) {
    // Determine result from teamH perspective
    final isTeamHHome = match.homeTeamId == teamHId;
    final hGoals = isTeamHHome ? match.scoreHome : match.scoreAway;
    final aGoals = isTeamHHome ? match.scoreAway : match.scoreHome;

    Color? bgColor;
    if (hGoals > aGoals) {
      bgColor = AppColors.accent.withValues(alpha: 0.08);
    } else if (hGoals < aGoals) {
      bgColor = AppColors.danger.withValues(alpha: 0.08);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
      child: Column(
        children: [
          // Main score row
          Row(
            children: [
              SizedBox(
                width: 60,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      match.season,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                    Text(
                      'GW ${match.gameweek}',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Text(
                  match.homeTeam,
                  textAlign: TextAlign.end,
                  style: const TextStyle(fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                width: 56,
                alignment: Alignment.center,
                child: Text(
                  '${match.scoreHome} - ${match.scoreAway}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  match.awayTeam,
                  style: const TextStyle(fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          // Scorers & assists
          if (match.scorersHome.isNotEmpty || match.scorersAway.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(width: 60),
                  Expanded(
                    child: _buildGoalDetails(
                      match.scorersHome,
                      match.assistsHome,
                      TextAlign.end,
                    ),
                  ),
                  const SizedBox(width: 56),
                  Expanded(
                    child: _buildGoalDetails(
                      match.scorersAway,
                      match.assistsAway,
                      TextAlign.start,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildGoalDetails(
    List<String> scorers,
    List<String> assists,
    TextAlign align,
  ) {
    if (scorers.isEmpty) return const SizedBox.shrink();
    final lines = <String>[];
    for (int i = 0; i < scorers.length; i++) {
      final scorer = scorers[i];
      final assist = i < assists.length && assists[i].isNotEmpty
          ? ' (${assists[i]})'
          : '';
      lines.add('\u26BD $scorer$assist');
    }
    return Text(
      lines.join('\n'),
      textAlign: align,
      style: const TextStyle(
        fontSize: 10,
        color: AppColors.textMuted,
      ),
    );
  }
}

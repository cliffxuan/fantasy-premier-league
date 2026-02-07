import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/fdr_badge.dart';
import '../../../core/widgets/team_badge.dart';
import '../../../data/models/fixture.dart';
import '../../../data/models/polymarket_market.dart';

class MatchCard extends StatelessWidget {
  final Fixture fixture;
  final PolymarketMarket? market;
  final VoidCallback? onTap;

  const MatchCard({
    super.key,
    required this.fixture,
    this.market,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isLive = fixture.started && !fixture.finished;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              // Kickoff time
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (isLive)
                    Container(
                      margin: const EdgeInsets.only(right: 6),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'LIVE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  Text(
                    fixture.finished
                        ? 'FT'
                        : formatShortDate(fixture.kickoffTime),
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Teams & Score
              Row(
                children: [
                  // Home team
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Flexible(
                          child: Text(
                            fixture.teamHShort ?? 'HOME',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (fixture.teamHCode != null)
                          TeamBadge(teamCode: fixture.teamHCode!, size: 28),
                      ],
                    ),
                  ),
                  // Score or FDR
                  Container(
                    width: 70,
                    alignment: Alignment.center,
                    child: fixture.started || fixture.finished
                        ? Text(
                            '${fixture.teamHScore ?? 0} - ${fixture.teamAScore ?? 0}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              FdrBadge(difficulty: fixture.teamHDifficulty, width: 28),
                              const SizedBox(width: 4),
                              FdrBadge(difficulty: fixture.teamADifficulty, width: 28),
                            ],
                          ),
                  ),
                  // Away team
                  Expanded(
                    child: Row(
                      children: [
                        if (fixture.teamACode != null)
                          TeamBadge(teamCode: fixture.teamACode!, size: 28),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            fixture.teamAShort ?? 'AWAY',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              // Polymarket odds
              if (market != null && market!.outcomes.isNotEmpty) ...[
                const SizedBox(height: 8),
                const Divider(height: 1),
                const SizedBox(height: 6),
                Row(
                  children: market!.outcomes.map((o) {
                    final pct = (o.price * 100).round();
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            vertical: 4,
                            horizontal: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _oddsColor(pct),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${o.label} $pct%',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
              // H2H stats
              if (fixture.historyStats != null) ...[
                const SizedBox(height: 6),
                _buildH2hBar(fixture.historyStats!),
              ],
            ],
          ),
        ),
      ),
    );
  }

  static Color _oddsColor(int pct) {
    if (pct >= 60) return AppColors.accent.withValues(alpha: 0.25);
    if (pct >= 40) return AppColors.primary.withValues(alpha: 0.25);
    return AppColors.textMuted.withValues(alpha: 0.15);
  }

  Widget _buildH2hBar(Map<String, dynamic> stats) {
    final homeWin = (stats['team_h_win'] ?? 0).toDouble();
    final draw = (stats['draw'] ?? 0).toDouble();
    final awayWin = (stats['team_a_win'] ?? 0).toDouble();
    final total = homeWin + draw + awayWin;
    if (total == 0) return const SizedBox.shrink();

    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: Row(
            children: [
              Expanded(
                flex: (homeWin / total * 100).round().clamp(1, 100) as int,
                child: Container(height: 4, color: AppColors.primary),
              ),
              Expanded(
                flex: (draw / total * 100).round().clamp(1, 100) as int,
                child: Container(height: 4, color: AppColors.textMuted),
              ),
              Expanded(
                flex: (awayWin / total * 100).round().clamp(1, 100) as int,
                child: Container(height: 4, color: AppColors.danger),
              ),
            ],
          ),
        ),
        const SizedBox(height: 2),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${homeWin.toInt()}W',
              style: const TextStyle(
                color: AppColors.primary,
                fontSize: 10,
              ),
            ),
            Text(
              '${draw.toInt()}D',
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 10,
              ),
            ),
            Text(
              '${awayWin.toInt()}W',
              style: const TextStyle(
                color: AppColors.danger,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

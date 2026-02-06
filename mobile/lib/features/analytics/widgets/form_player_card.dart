import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/team_badge.dart';
import '../../../data/models/form_player.dart';

class FormPlayerCard extends StatelessWidget {
  final FormPlayer player;

  const FormPlayerCard({super.key, required this.player});

  Color get _classificationColor {
    if (player.classification.contains('Sustainable')) return AppColors.accent;
    if (player.classification.contains('Lucky') ||
        player.classification.contains('Over')) return AppColors.warning;
    return AppColors.danger;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                TeamBadge(teamCode: player.teamCode, size: 24),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    player.webName,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _classificationColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    player.classification,
                    style: TextStyle(
                      color: _classificationColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Stats row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _MiniStat('Streak', '${player.streakGames} GW'),
                _MiniStat('Points', '${player.streakPoints}'),
                _MiniStat('xG Delta', player.xgDelta.toStringAsFixed(2)),
                _MiniStat('Score', '${player.sustainabilityScore}/100'),
              ],
            ),
            // Reasons
            if (player.reasons.isNotEmpty) ...[
              const SizedBox(height: 8),
              ...player.reasons.take(2).map(
                    (r) => Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        '- $r',
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 11,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;

  const _MiniStat(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textMuted,
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/position_utils.dart';
import '../../../core/widgets/player_image.dart';
import '../../../core/widgets/team_badge.dart';
import '../../../data/models/solver_response.dart';

class SolverResultTable extends StatelessWidget {
  final SolverResponse result;

  const SolverResultTable({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Status: ${result.status}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: result.status == 'Optimal'
                        ? AppColors.accent
                        : AppColors.warning,
                  ),
                ),
                Text(
                  '${result.totalPoints.toStringAsFixed(1)} pts | £${result.budgetUsed.toStringAsFixed(1)}m',
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Divider(height: 1),
            ...result.squad.map((p) => _SolverPlayerRow(player: p)),
          ],
        ),
      ),
    );
  }
}

class _SolverPlayerRow extends StatelessWidget {
  final SolverPlayer player;

  const _SolverPlayerRow({required this.player});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          PlayerImage(playerCode: player.code, size: 32),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  player.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w500,
                    fontSize: 13,
                  ),
                ),
                Row(
                  children: [
                    TeamBadge(teamCode: player.teamCode, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      '${getPositionName(player.position)} | ${player.teamShort}',
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${player.points.toStringAsFixed(1)} pts',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: AppColors.accent,
                ),
              ),
              Text(
                '£${player.cost.toStringAsFixed(1)}m',
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

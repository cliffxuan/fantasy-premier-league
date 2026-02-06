import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/team_badge.dart';
import '../../../data/models/league_table_entry.dart';

class LeagueTableRow extends StatelessWidget {
  final LeagueTableEntry entry;

  const LeagueTableRow({super.key, required this.entry});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 24,
            child: Text(
              '${entry.position}',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(width: 8),
          TeamBadge(teamCode: entry.code, size: 24),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              entry.shortName,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
          SizedBox(
            width: 28,
            child: Text(
              '${entry.played}',
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            width: 28,
            child: Text(
              '${entry.won}',
              style: const TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            width: 28,
            child: Text(
              '${entry.drawn}',
              style: const TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            width: 28,
            child: Text(
              '${entry.lost}',
              style: const TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            width: 32,
            child: Text(
              '${entry.goalDifference > 0 ? "+" : ""}${entry.goalDifference}',
              style: TextStyle(
                fontSize: 12,
                color: entry.goalDifference > 0
                    ? AppColors.accent
                    : entry.goalDifference < 0
                        ? AppColors.danger
                        : AppColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            width: 32,
            child: Text(
              '${entry.points}',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}

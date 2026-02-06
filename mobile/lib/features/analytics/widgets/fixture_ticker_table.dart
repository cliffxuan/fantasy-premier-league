import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/fdr_utils.dart';
import '../../../core/widgets/team_badge.dart';
import '../../../data/models/fixture_ticker.dart';

class FixtureTickerTable extends StatelessWidget {
  final List<FixtureTickerTeam> teams;

  const FixtureTickerTable({super.key, required this.teams});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columnSpacing: 8,
        horizontalMargin: 12,
        headingRowHeight: 36,
        dataRowMinHeight: 36,
        dataRowMaxHeight: 36,
        columns: [
          const DataColumn(label: Text('Team', style: TextStyle(fontSize: 12))),
          ...List.generate(
            teams.isNotEmpty ? teams.first.next5.length : 0,
            (i) => DataColumn(
              label: Text(
                'GW ${teams.first.next5[i].gameweek}',
                style: const TextStyle(fontSize: 10),
              ),
            ),
          ),
          const DataColumn(
            label: Text('Avg', style: TextStyle(fontSize: 12)),
            numeric: true,
          ),
        ],
        rows: teams.map((team) {
          return DataRow(
            cells: [
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TeamBadge(teamCode: team.teamCode, size: 20),
                    const SizedBox(width: 4),
                    Text(
                      team.teamShort,
                      style: const TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
              ...team.next5.map((match) {
                return DataCell(
                  Container(
                    width: 48,
                    height: 28,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: fdrColor(match.fdrOfficial),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '${match.opponent}\n${match.isHome == true ? "H" : "A"}',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: fdrTextColor(match.fdrOfficial),
                        fontSize: 9,
                        fontWeight: FontWeight.w600,
                        height: 1.1,
                      ),
                    ),
                  ),
                );
              }),
              DataCell(
                Text(
                  team.avgDifficultyOfficial.toStringAsFixed(1),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: team.avgDifficultyOfficial < 3
                        ? AppColors.accent
                        : team.avgDifficultyOfficial > 3.5
                            ? AppColors.danger
                            : AppColors.textMuted,
                  ),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

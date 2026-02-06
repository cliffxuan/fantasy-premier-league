import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/player_image.dart';
import '../../../data/models/aggregated_player.dart';
import '../providers/player_explorer_providers.dart';

class PlayerDetailSheet extends ConsumerWidget {
  final AggregatedPlayer player;

  const PlayerDetailSheet({super.key, required this.player});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(playerSummaryProvider(player.id));

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(16),
            children: [
              // Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.textMuted,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Player header
              Row(
                children: [
                  PlayerImage(playerCode: player.code, size: 64),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          player.webName,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (player.fullName != null)
                          Text(
                            player.fullName!,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 13,
                            ),
                          ),
                        const SizedBox(height: 4),
                        Text(
                          '${player.teamShort} | ${player.totalPoints} total pts',
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Stats grid
              Row(
                children: [
                  _StatBox(label: 'Points', value: '${player.pointsInRange}'),
                  const SizedBox(width: 8),
                  _StatBox(
                    label: 'PPG',
                    value: player.pointsPerGame.toStringAsFixed(1),
                  ),
                  const SizedBox(width: 8),
                  _StatBox(label: 'Matches', value: '${player.matchesInRange}'),
                  const SizedBox(width: 8),
                  _StatBox(
                    label: 'Cost',
                    value: '£${player.nowCost.toStringAsFixed(1)}m',
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Points history chart
              summaryAsync.when(
                loading: () => const SizedBox(
                  height: 200,
                  child: LoadingIndicator(),
                ),
                error: (e, _) => Text(
                  'Failed to load details',
                  style: TextStyle(color: AppColors.danger),
                ),
                data: (summary) {
                  if (summary.history.isEmpty) {
                    return const Text(
                      'No match history available',
                      style: TextStyle(color: AppColors.textMuted),
                    );
                  }

                  final spots = summary.history
                      .map((h) => FlSpot(
                            h.round.toDouble(),
                            h.totalPoints.toDouble(),
                          ))
                      .toList();

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Points Per Gameweek',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 180,
                        child: BarChart(
                          BarChartData(
                            gridData: const FlGridData(show: false),
                            borderData: FlBorderData(show: false),
                            titlesData: FlTitlesData(
                              topTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                              rightTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (v, _) => Text(
                                    v.toInt().toString(),
                                    style: const TextStyle(
                                      fontSize: 9,
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                ),
                              ),
                              leftTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                            ),
                            barGroups: spots.map((s) {
                              return BarChartGroupData(
                                x: s.x.toInt(),
                                barRods: [
                                  BarChartRodData(
                                    toY: s.y,
                                    color: s.y > 5
                                        ? AppColors.accent
                                        : AppColors.primary,
                                    width: 8,
                                    borderRadius: const BorderRadius.vertical(
                                      top: Radius.circular(2),
                                    ),
                                  ),
                                ],
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;

  const _StatBox({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

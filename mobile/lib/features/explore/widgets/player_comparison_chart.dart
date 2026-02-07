import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/models/aggregated_player.dart';
import '../../../data/models/player_summary.dart';

const _lineColors = [
  AppColors.primary,
  AppColors.danger,
  AppColors.accent,
  Color(0xFFF59E0B), // amber
  Color(0xFF8B5CF6), // purple
];

class PlayerComparisonChart extends StatelessWidget {
  final Map<int, List<PlayerHistoryEntry>> histories;
  final List<AggregatedPlayer> players;
  final bool cumulative;

  const PlayerComparisonChart({
    super.key,
    required this.histories,
    required this.players,
    required this.cumulative,
  });

  @override
  Widget build(BuildContext context) {
    final bars = <LineChartBarData>[];
    double maxY = 0;
    double minX = double.infinity;
    double maxX = 0;

    for (int i = 0; i < players.length; i++) {
      final player = players[i];
      final history = histories[player.id];
      if (history == null || history.isEmpty) continue;

      final color = _lineColors[i % _lineColors.length];
      final spots = <FlSpot>[];
      int runningSum = 0;

      for (final entry in history) {
        final x = entry.round.toDouble();
        final y = cumulative
            ? (runningSum += entry.totalPoints).toDouble()
            : entry.totalPoints.toDouble();
        spots.add(FlSpot(x, y));
        if (y > maxY) maxY = y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }

      bars.add(LineChartBarData(
        spots: spots,
        isCurved: true,
        curveSmoothness: 0.2,
        color: color,
        barWidth: 2,
        dotData: const FlDotData(show: false),
      ));
    }

    if (bars.isEmpty) {
      return const SizedBox(
        height: 250,
        child: Center(
          child: Text(
            'No history data available',
            style: TextStyle(color: AppColors.textMuted),
          ),
        ),
      );
    }

    return SizedBox(
      height: 250,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: (maxY / 4).ceilToDouble().clamp(1, 500),
            getDrawingHorizontalLine: (value) => FlLine(
              color: AppColors.border,
              strokeWidth: 0.5,
            ),
          ),
          titlesData: FlTitlesData(
            topTitles:
                const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles:
                const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: ((maxX - minX) / 6).ceilToDouble().clamp(1, 10),
                getTitlesWidget: (value, meta) {
                  return Text(
                    value.toInt().toString(),
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10,
                    ),
                  );
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 36,
                getTitlesWidget: (value, meta) {
                  return Text(
                    value.toInt().toString(),
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10,
                    ),
                  );
                },
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          lineBarsData: bars,
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipColor: (_) => AppColors.card,
              getTooltipItems: (spots) {
                return spots.map((spot) {
                  final idx = spot.barIndex;
                  final name =
                      idx < players.length ? players[idx].webName : '?';
                  return LineTooltipItem(
                    '$name: ${spot.y.toInt()}',
                    TextStyle(
                      color: _lineColors[idx % _lineColors.length],
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  );
                }).toList();
              },
            ),
          ),
        ),
      ),
    );
  }
}

class ComparisonLegend extends StatelessWidget {
  final List<AggregatedPlayer> players;

  const ComparisonLegend({super.key, required this.players});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 16,
      runSpacing: 4,
      children: [
        for (int i = 0; i < players.length; i++)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: _lineColors[i % _lineColors.length],
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                players[i].webName,
                style: const TextStyle(fontSize: 12),
              ),
            ],
          ),
      ],
    );
  }
}

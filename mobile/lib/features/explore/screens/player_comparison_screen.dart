import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../data/models/aggregated_player.dart';
import '../../../data/models/player_summary.dart';
import '../providers/player_comparison_providers.dart';
import '../widgets/player_comparison_chart.dart';

class PlayerComparisonScreen extends ConsumerStatefulWidget {
  const PlayerComparisonScreen({super.key});

  @override
  ConsumerState<PlayerComparisonScreen> createState() =>
      _PlayerComparisonScreenState();
}

class _PlayerComparisonScreenState
    extends ConsumerState<PlayerComparisonScreen> {
  bool _cumulative = false;

  @override
  Widget build(BuildContext context) {
    final players = ref.watch(playerComparisonSelectionProvider);
    final historiesAsync = ref.watch(comparisonHistoriesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Compare Players')),
      body: historiesAsync.when(
        loading: () => const LoadingIndicator(message: 'Loading histories...'),
        error: (e, _) => Center(
          child: Text(e.toString(),
              style: const TextStyle(color: AppColors.danger)),
        ),
        data: (histories) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Mode toggle
                Row(
                  children: [
                    _ModeChip(
                      label: 'Weekly',
                      selected: !_cumulative,
                      onTap: () => setState(() => _cumulative = false),
                    ),
                    const SizedBox(width: 8),
                    _ModeChip(
                      label: 'Cumulative',
                      selected: _cumulative,
                      onTap: () => setState(() => _cumulative = true),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Chart
                PlayerComparisonChart(
                  histories: histories,
                  players: players,
                  cumulative: _cumulative,
                ),
                const SizedBox(height: 12),
                // Legend
                Center(
                  child: ComparisonLegend(players: players),
                ),
                const SizedBox(height: 20),
                // Stats table
                _StatsTable(players: players, histories: histories),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ModeChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _ModeChip({
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
          color: selected ? AppColors.primary : AppColors.card,
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

class _StatsTable extends StatelessWidget {
  final List<AggregatedPlayer> players;
  final Map<int, List<PlayerHistoryEntry>> histories;

  const _StatsTable({required this.players, required this.histories});

  @override
  Widget build(BuildContext context) {
    return Table(
      border: TableBorder.all(color: AppColors.border, width: 0.5),
      columnWidths: {
        0: const FixedColumnWidth(80),
        for (int i = 0; i < players.length; i++)
          i + 1: const FlexColumnWidth(),
      },
      children: [
        // Header
        TableRow(
          decoration: const BoxDecoration(color: AppColors.card),
          children: [
            const _Cell(text: '', header: true),
            ...players.map((p) => _Cell(text: p.webName, header: true)),
          ],
        ),
        // Points
        TableRow(children: [
          const _Cell(text: 'Points'),
          ...players.map((p) => _Cell(text: '${p.totalPoints}')),
        ]),
        // PPG
        TableRow(children: [
          const _Cell(text: 'PPG'),
          ...players
              .map((p) => _Cell(text: p.pointsPerGame.toStringAsFixed(1))),
        ]),
        // Goals
        TableRow(children: [
          const _Cell(text: 'Goals'),
          ...players.map((p) {
            final history = histories[p.id] ?? [];
            final goals = history.fold<int>(0, (sum, e) => sum + e.goalsScored);
            return _Cell(text: '$goals');
          }),
        ]),
        // Assists
        TableRow(children: [
          const _Cell(text: 'Assists'),
          ...players.map((p) {
            final history = histories[p.id] ?? [];
            final assists = history.fold<int>(0, (sum, e) => sum + e.assists);
            return _Cell(text: '$assists');
          }),
        ]),
        // Cost
        TableRow(children: [
          const _Cell(text: 'Cost'),
          ...players.map(
              (p) => _Cell(text: formatCost((p.nowCost * 10).round()))),
        ]),
      ],
    );
  }
}

class _Cell extends StatelessWidget {
  final String text;
  final bool header;

  const _Cell({required this.text, this.header = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 11,
          fontWeight: header ? FontWeight.w600 : FontWeight.normal,
          color: header ? AppColors.text : AppColors.textMuted,
        ),
        overflow: TextOverflow.ellipsis,
      ),
    );
  }
}

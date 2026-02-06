import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../providers/league_table_providers.dart';
import '../widgets/league_table_row.dart';

class LeagueTableScreen extends ConsumerWidget {
  const LeagueTableScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final range = ref.watch(gwRangeProvider);
    final maxGw = ref.watch(maxGameweekProvider);
    final tableAsync = ref.watch(leagueTableProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('League Table')),
      body: Column(
        children: [
          // GW Range Slider
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'GW RANGE',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textMuted,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Row(
                          children: [
                            _GwLabel(value: range.start.round()),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 6),
                              child: Text(
                                '-',
                                style: TextStyle(color: AppColors.textMuted),
                              ),
                            ),
                            _GwLabel(value: range.end.round()),
                          ],
                        ),
                      ],
                    ),
                    SliderTheme(
                      data: SliderThemeData(
                        activeTrackColor: AppColors.primary,
                        inactiveTrackColor: AppColors.border,
                        thumbColor: AppColors.primary,
                        overlayColor: AppColors.primary.withAlpha(40),
                        rangeThumbShape: const RoundRangeSliderThumbShape(
                          enabledThumbRadius: 8,
                        ),
                        rangeTrackShape:
                            const RoundedRectRangeSliderTrackShape(),
                      ),
                      child: RangeSlider(
                        values: range,
                        min: 1,
                        max: maxGw.toDouble(),
                        divisions: (maxGw - 1).clamp(1, 37),
                        onChanged: (newRange) {
                          ref.read(gwRangeProvider.notifier).set(newRange);
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                const SizedBox(width: 24), // pos
                const SizedBox(width: 8),
                const SizedBox(width: 24), // badge
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Team',
                    style: TextStyle(
                      fontSize: 10,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
                ...['P', 'W', 'D', 'L', 'GD', 'Pts'].map(
                  (h) => SizedBox(
                    width: h == 'GD' || h == 'Pts' ? 32 : 28,
                    child: Text(
                      h,
                      style: TextStyle(
                        fontSize: 10,
                        color: h == 'Pts' ? AppColors.primary : AppColors.textMuted,
                        fontWeight:
                            h == 'Pts' ? FontWeight.bold : FontWeight.normal,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Table
          Expanded(
            child: tableAsync.when(
              loading: () => const LoadingIndicator(),
              error: (e, _) => ErrorView(
                message: e.toString(),
                onRetry: () => ref.invalidate(leagueTableProvider),
              ),
              data: (entries) => RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async =>
                    ref.invalidate(leagueTableProvider),
                child: ListView.separated(
                  itemCount: entries.length,
                  separatorBuilder: (_, __) => const Divider(
                    height: 1,
                    indent: 12,
                    endIndent: 12,
                  ),
                  itemBuilder: (context, index) {
                    return LeagueTableRow(entry: entries[index]);
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GwLabel extends StatelessWidget {
  final int value;

  const _GwLabel({required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 28,
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(6),
      ),
      alignment: Alignment.center,
      child: Text(
        '$value',
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

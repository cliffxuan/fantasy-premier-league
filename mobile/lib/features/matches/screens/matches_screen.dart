import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/gameweek_navigator.dart';
import '../../../core/widgets/gameweek_swipe_detector.dart'; // Import the new swipe detector
import '../../../core/widgets/loading_indicator.dart';
import '../../../data/models/fixture.dart';
import '../../../data/models/polymarket_market.dart';
import '../../home/providers/squad_providers.dart';
import '../providers/fixtures_providers.dart';
import '../widgets/h2h_history_sheet.dart';
import '../widgets/match_card.dart';

class MatchesScreen extends ConsumerStatefulWidget {
  const MatchesScreen({super.key});

  @override
  ConsumerState<MatchesScreen> createState() => _MatchesScreenState();
}

class _MatchesScreenState extends ConsumerState<MatchesScreen> {
  int? _selectedGw;
  bool _sortByOdds = false;

  @override
  Widget build(BuildContext context) {
    final gwAsync = ref.watch(currentGameweekProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Matches')),
      body: gwAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(currentGameweekProvider),
        ),
        data: (gwStatus) {
          final currentGw = _selectedGw ?? gwStatus.gameweek;

          return GameweekSwipeDetector(
            currentGw: currentGw,
            onChanged: (gw) => setState(() => _selectedGw = gw),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: GameweekNavigator(
                    currentGw: currentGw,
                    onChanged: (gw) => setState(() => _selectedGw = gw),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Row(
                    children: [
                      _SortChip(
                        label: 'By Time',
                        selected: !_sortByOdds,
                        onTap: () => setState(() => _sortByOdds = false),
                      ),
                      const SizedBox(width: 8),
                      _SortChip(
                        label: 'By Odds',
                        selected: _sortByOdds,
                        onTap: () => setState(() => _sortByOdds = true),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Expanded(
                  child: _FixturesList(gw: currentGw, sortByOdds: _sortByOdds),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SortChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _SortChip({
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

class _FixturesList extends ConsumerWidget {
  final int gw;
  final bool sortByOdds;

  const _FixturesList({required this.gw, this.sortByOdds = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fixturesAsync = ref.watch(fixturesForGwProvider(gw));
    final polyAsync = ref.watch(polymarketDataProvider);

    return fixturesAsync.when(
      loading: () => const LoadingIndicator(),
      error: (e, _) => ErrorView(
        message: e.toString(),
        onRetry: () => ref.invalidate(fixturesForGwProvider(gw)),
      ),
      data: (fixtures) {
        final markets = polyAsync.valueOrNull ?? <PolymarketMarket>[];

        // Build fixture-market pairs and optionally sort by max odds
        var paired = fixtures.map((f) {
          return (fixture: f, market: _findMarket(f, markets));
        }).toList();

        if (sortByOdds) {
          paired.sort((a, b) {
            final aMax = _maxOdds(a.market);
            final bMax = _maxOdds(b.market);
            return bMax.compareTo(aMax);
          });
        }

        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            ref.invalidate(fixturesForGwProvider(gw));
            ref.invalidate(polymarketDataProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            itemCount: paired.length,
            itemBuilder: (context, index) {
              final item = paired[index];

              return MatchCard(
                fixture: item.fixture,
                market: item.market,
                onTap: () => _showH2h(context, item.fixture),
              );
            },
          ),
        );
      },
    );
  }

  double _maxOdds(PolymarketMarket? market) {
    if (market == null || market.outcomes.isEmpty) return 0;
    return market.outcomes
        .map((o) => o.price)
        .reduce((a, b) => a > b ? a : b);
  }

  PolymarketMarket? _findMarket(
      Fixture fixture, List<PolymarketMarket> markets) {
    for (final m in markets) {
      if (m.homeTeam?.code == fixture.teamHCode &&
          m.awayTeam?.code == fixture.teamACode) {
        return m;
      }
    }
    return null;
  }

  void _showH2h(BuildContext context, Fixture fixture) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => H2hHistorySheet(
        teamHId: fixture.teamH,
        teamAId: fixture.teamA,
        teamHName: fixture.teamHName,
        teamAName: fixture.teamAName,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/gameweek_navigator.dart';
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

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: GameweekNavigator(
                  currentGw: currentGw,
                  onChanged: (gw) => setState(() => _selectedGw = gw),
                ),
              ),
              Expanded(
                child: _FixturesList(gw: currentGw),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _FixturesList extends ConsumerWidget {
  final int gw;

  const _FixturesList({required this.gw});

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

        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            ref.invalidate(fixturesForGwProvider(gw));
            ref.invalidate(polymarketDataProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            itemCount: fixtures.length,
            itemBuilder: (context, index) {
              final fixture = fixtures[index];
              final market = _findMarket(fixture, markets);

              return MatchCard(
                fixture: fixture,
                market: market,
                onTap: () => _showH2h(context, fixture),
              );
            },
          ),
        );
      },
    );
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

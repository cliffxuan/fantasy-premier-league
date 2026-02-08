import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/models/squad_player.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/gameweek_navigator.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../explore/providers/club_viewer_providers.dart';
import '../providers/squad_providers.dart';
import '../widgets/analysis_result_card.dart';
import '../widgets/chip_row.dart';
import '../widgets/points_history_chart.dart';
import '../widgets/squad_list_view.dart';
import '../widgets/squad_pitch_view.dart';
import '../widgets/squad_player_sheet.dart';
import '../widgets/team_header.dart';
import '../widgets/team_id_input.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  PageController? _pageController;

  @override
  void dispose() {
    _pageController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final teamId = ref.watch(savedTeamIdProvider);

    if (teamId == null) {
      return const Scaffold(body: TeamIdInput());
    }

    // 1. Determine the target gameweek to show (from global state or current GW)
    final globalGw = ref.watch(selectedGameweekProvider);
    final currentGwAsync = ref.watch(currentGameweekProvider);

    // If we have a global selection, that takes precedence for the PageView.
    // If not, we wait for currentGwAsync to resolve so we know where to start.
    if (globalGw != null) {
      _initControllerIfNeeded(globalGw);
    } else if (currentGwAsync.hasValue) {
      _initControllerIfNeeded(currentGwAsync.value!.gameweek);
    }

    // If controller is ready (meaning we know where to start), show PageView.
    // Otherwise show loading.
    if (_pageController == null) {
       return const Scaffold(
        body: Center(child: LoadingIndicator(message: 'Loading gameweek...')),
      );
    }

    // Identify current focus for UI updates (syncing controller if external change happened)
    // If globalGw changed and doesn't match controller page, animate.
    // But be careful of infinite loops if onPageChanged triggers it.
    // We'll handle this synchronization in a listener or effect, but here in build is simple for now:
    // We can't animate in build. We rely on the key/controller initial page for first load,
    // and manual sync if needed, but PageView usually drives the state.
    // If external state changes (e.g. from a different tab?), we might need to jump.
    // For now, assume this screen is the main driver.

    // Correction: We must animate if ref.watch(selectedGameweekProvider) changes and distinct from page.
    ref.listen(selectedGameweekProvider, (prev, next) {
      if (next != null &&
          _pageController != null &&
          _pageController!.hasClients) {
        final currentPage = _pageController!.page?.round() ?? 0;
        final targetPage = next - 1;
        if (currentPage != targetPage) {
          _pageController!.animateToPage(
            targetPage,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
          );
        }
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Squad'),
        actions: [
          IconButton(
            icon: const Icon(Icons.list, color: AppColors.textMuted),
            onPressed: () {
              // Toggle logic potentially moved to provider or local state per page?
              // The original code had local state _showPitchView.
              // We'll pass this down to the page.
            },
            // We'll implement view toggle differently or keep it global for the screen.
            // Let's keep it simply for now, but _SquadPage needs to know.
          ),
        ],
      ),
      body: PageView.builder(
        controller: _pageController,
        onPageChanged: (index) {
          final gw = index + 1;
          // Defer update to avoid build conflicts
          Future.microtask(() {
             ref.read(selectedGameweekProvider.notifier).set(gw);
          });
        },
        itemBuilder: (context, index) {
          final gw = index + 1;
          return _SquadPage(
            gameweek: gw,
            teamId: teamId,
          );
        },
      ),
    );
  }

  void _initControllerIfNeeded(int gw) {
    _pageController ??= PageController(initialPage: gw - 1, viewportFraction: 0.95);
  }
}

class _SquadPage extends ConsumerStatefulWidget {
  final int gameweek;
  final int teamId;

  const _SquadPage({
    required this.gameweek,
    required this.teamId,
  });

  @override
  ConsumerState<_SquadPage> createState() => _SquadPageState();
}

class _SquadPageState extends ConsumerState<_SquadPage> {
  bool _showPitchView = true;

  @override
  Widget build(BuildContext context) {
    // Use squadForGameweekProvider
    final squadAsync = ref.watch(squadForGameweekProvider(widget.gameweek));
    final analysisState = ref.watch(analysisStateProvider);

    return squadAsync.when(
      loading: () => const LoadingIndicator(message: 'Loading squad...'),
      error: (e, _) => ErrorView(
        message: e.toString(),
        onRetry: () => ref.invalidate(squadForGameweekProvider(widget.gameweek)),
      ),
      data: (data) {
        // Build team ID → short name map
        final teams = ref.watch(allTeamsProvider).valueOrNull ?? [];
        final teamShortNames = {
          for (final t in teams) t.id: t.shortName,
        };

        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async => ref.invalidate(squadForGameweekProvider(widget.gameweek)),
          child: ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              // Gameweek navigator (inside the page for sliding effect)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: GameweekNavigator(
                  currentGw: widget.gameweek,
                  onChanged: (gw) {
                    // Update global state, which triggers PageView scroll via listener in HomeScreen
                    ref.read(selectedGameweekProvider.notifier).set(gw);
                  },
                ),
              ),

              // Team header
              TeamHeader(data: data),

              // Chips
              if (data.chips != null && data.chips!.isNotEmpty) ...[
                const SizedBox(height: 8),
                ChipRow(chips: data.chips!),
              ],

              // View Toggle
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                   mainAxisAlignment: MainAxisAlignment.end,
                   children: [
                     IconButton(
                       icon: Icon(_showPitchView ? Icons.list : Icons.grid_view),
                       onPressed: () => setState(() => _showPitchView = !_showPitchView),
                       color: AppColors.textMuted,
                     )
                   ],
                ),
              ),


              // Squad view
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _showPitchView
                    ? SquadPitchView(
                        squad: data.squad,
                        onPlayerTap: (player) => _showPlayerSheet(player),
                        teamShortNames: teamShortNames,
                      )
                    : SquadListView(
                        squad: data.squad,
                        onPlayerTap: (player) => _showPlayerSheet(player),
                      ),
              ),

              // Points history
              if (data.history != null && data.history!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: PointsHistoryChart(history: data.history!),
                ),
              ],

               // AI Analysis
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: analysisState.when(
                    loading: () => const Card(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: LoadingIndicator(message: 'Analyzing...'),
                      ),
                    ),
                    error: (e, _) => Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: ErrorView(
                          message: e.toString(),
                          onRetry: () => _runAnalysis(widget.teamId, data),
                        ),
                      ),
                    ),
                    data: (analysis) {
                      if (analysis != null) {
                        return AnalysisResultCard(analysis: analysis);
                      }
                      return _AnalyzeButton(
                        onPressed: () => _runAnalysis(widget.teamId, data),
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  void _showPlayerSheet(SquadPlayer player) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SquadPlayerSheet(player: player),
    );
  }

  void _runAnalysis(int teamId, dynamic data) {
    final bank = data.history?.isNotEmpty == true
        ? (data.history!.last.bank / 10) as double
        : 0.0;
    ref.read(analysisStateProvider.notifier).analyze(
          teamId: teamId,
          moneyInBank: bank,
          freeTransfers: (data.freeTransfers ?? 1) as int,
          authToken: ref.read(savedAuthTokenProvider),
        );
  }
}

class _AnalyzeButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _AnalyzeButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Icon(Icons.auto_awesome, color: AppColors.primary, size: 32),
            const SizedBox(height: 8),
            const Text(
              'AI Squad Analysis',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            const SizedBox(height: 4),
            const Text(
              'Get transfer recommendations & captaincy advice',
              style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: onPressed,
              child: const Text('Analyze My Team'),
            ),
          ],
        ),
      ),
    );
  }
}

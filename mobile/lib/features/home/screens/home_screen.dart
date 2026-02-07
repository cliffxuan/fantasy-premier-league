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
  bool _showPitchView = true;

  @override
  Widget build(BuildContext context) {
    final teamId = ref.watch(savedTeamIdProvider);

    if (teamId == null) {
      return const Scaffold(body: TeamIdInput());
    }

    final squadAsync = ref.watch(squadProvider);
    final analysisState = ref.watch(analysisStateProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Squad'),
        actions: [
          IconButton(
            icon: Icon(
              _showPitchView ? Icons.list : Icons.grid_view,
              color: AppColors.textMuted,
            ),
            onPressed: () => setState(() => _showPitchView = !_showPitchView),
            tooltip: _showPitchView ? 'List view' : 'Pitch view',
          ),
        ],
      ),
      body: squadAsync.when(
        loading: () => const LoadingIndicator(message: 'Loading squad...'),
        error: (e, _) => ErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(squadProvider),
        ),
        data: (data) {
          // Build team ID → short name map for fixture abbreviations
          final teams = ref.watch(allTeamsProvider).valueOrNull ?? [];
          final teamShortNames = {
            for (final t in teams) t.id: t.shortName,
          };

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(squadProvider),
            child: ListView(
              padding: const EdgeInsets.only(bottom: 24),
              children: [
                // Gameweek navigator
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: GameweekNavigator(
                    currentGw: data.gameweek,
                    onChanged: (gw) =>
                        ref.read(selectedGameweekProvider.notifier).set(gw),
                  ),
                ),

                // Team header
                TeamHeader(data: data),

                // Chips
                if (data.chips != null && data.chips!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  ChipRow(chips: data.chips!),
                ],

                // Squad view
                const SizedBox(height: 8),
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
                          onRetry: () => _runAnalysis(teamId, data),
                        ),
                      ),
                    ),
                    data: (analysis) {
                      if (analysis != null) {
                        return AnalysisResultCard(analysis: analysis);
                      }
                      return _AnalyzeButton(
                        onPressed: () => _runAnalysis(teamId, data),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
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
        ? (data.history!.last.bank / 10)
        : 0.0;
    ref.read(analysisStateProvider.notifier).analyze(
          teamId: teamId,
          moneyInBank: bank,
          freeTransfers: data.freeTransfers ?? 1,
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

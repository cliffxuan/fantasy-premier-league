import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/gameweek_navigator.dart';
import '../../../core/widgets/gameweek_swipe_detector.dart'; // Import swipe detector
import '../../../core/widgets/loading_indicator.dart';
import '../../home/providers/squad_providers.dart';
import '../providers/dream_team_providers.dart';
import '../widgets/dream_team_pitch.dart';

class DreamTeamScreen extends ConsumerStatefulWidget {
  const DreamTeamScreen({super.key});

  @override
  ConsumerState<DreamTeamScreen> createState() => _DreamTeamScreenState();
}

class _DreamTeamScreenState extends ConsumerState<DreamTeamScreen> {
  int? _selectedGw;

  @override
  Widget build(BuildContext context) {
    final gwAsync = ref.watch(currentGameweekProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Dream Team')),
      body: gwAsync.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(message: e.toString()),
        data: (gwStatus) {
          final gw = _selectedGw ?? gwStatus.gameweek;
          final dreamAsync = ref.watch(dreamTeamProvider(gw));

          return GameweekSwipeDetector(
            currentGw: gw,
            onChanged: (v) => setState(() => _selectedGw = v),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: GameweekNavigator(
                    currentGw: gw,
                    onChanged: (v) => setState(() => _selectedGw = v),
                  ),
                ),
                Expanded(
                  child: dreamAsync.when(
                    loading: () => const LoadingIndicator(),
                    error: (e, _) => ErrorView(
                      message: e.toString(),
                      onRetry: () =>
                          ref.invalidate(dreamTeamProvider(gw)),
                    ),
                    data: (data) {
                      return ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          // Total points header
                          Center(
                            child: Text(
                              '${data.totalPoints} points',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: AppColors.accent,
                              ),
                            ),
                          ),
                          if (data.topPlayer != null)
                            Center(
                              child: Text(
                                'Star: ${data.topPlayer!.name} (${data.topPlayer!.points} pts)',
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          const SizedBox(height: 16),
                          DreamTeamPitch(data: data),
                        ],
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
}

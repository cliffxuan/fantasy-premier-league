import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/gameweek_navigator.dart';
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
  PageController? _pageController;

  @override
  void dispose() {
    _pageController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gwAsync = ref.watch(currentGameweekProvider);
    final globalGw = ref.watch(selectedGameweekProvider);

    if (globalGw != null) {
      _initControllerIfNeeded(globalGw);
    } else if (gwAsync.hasValue) {
      _initControllerIfNeeded(gwAsync.value!.gameweek);
    }

    if (_pageController == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Dream Team')),
        body: const Center(child: LoadingIndicator()),
      );
    }

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

    final maxGw = gwAsync.valueOrNull?.gameweek ?? 38;

    return Scaffold(
      appBar: AppBar(title: const Text('Dream Team')),
      body: PageView.builder(
        controller: _pageController,
        itemCount: maxGw,
        onPageChanged: (index) {
          final gw = index + 1;
          Future.microtask(() {
             ref.read(selectedGameweekProvider.notifier).set(gw);
          });
        },
        itemBuilder: (context, index) {
          final gw = index + 1;
          return _DreamTeamPage(gw: gw, maxGw: maxGw);
        },
      ),
    );
  }

  void _initControllerIfNeeded(int gw) {
    _pageController ??= PageController(initialPage: gw - 1, viewportFraction: 0.95);
  }
}

class _DreamTeamPage extends ConsumerWidget {
  final int gw;
  final int maxGw;

  const _DreamTeamPage({
    required this.gw,
    required this.maxGw,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dreamAsync = ref.watch(dreamTeamProvider(gw));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: GameweekNavigator(
            currentGw: gw,
            maxGw: maxGw,
            onChanged: (v) => ref.read(selectedGameweekProvider.notifier).set(v),
          ),
        ),
        Expanded(
          child: dreamAsync.when(
            loading: () => const LoadingIndicator(),
            error: (e, _) => ErrorView(
              message: e.toString(),
              onRetry: () => ref.invalidate(dreamTeamProvider(gw)),
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
    );
  }
}

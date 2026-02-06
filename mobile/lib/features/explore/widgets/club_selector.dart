import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/team_badge.dart';
import '../providers/club_viewer_providers.dart';

class ClubSelector extends ConsumerWidget {
  const ClubSelector({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final teamsAsync = ref.watch(allTeamsProvider);
    final selectedId = ref.watch(selectedClubIdProvider);

    return teamsAsync.when(
      loading: () => const SizedBox(
        height: 60,
        child: LoadingIndicator(),
      ),
      error: (e, _) => Text(e.toString()),
      data: (teams) {
        return SizedBox(
          height: 48,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: teams.length,
            itemBuilder: (context, index) {
              final team = teams[index];
              final isSelected = team.id == selectedId;

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: GestureDetector(
                  onTap: () =>
                      ref.read(selectedClubIdProvider.notifier).set(team.id),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSelected
                            ? Theme.of(context).colorScheme.primary
                            : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: TeamBadge(teamCode: team.code, size: 32),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../providers/player_explorer_providers.dart';

class PlayerFilterBar extends ConsumerWidget {
  const PlayerFilterBar({super.key});

  static const _positions = [
    (label: 'All', value: null),
    (label: 'GKP', value: 1),
    (label: 'DEF', value: 2),
    (label: 'MID', value: 3),
    (label: 'FWD', value: 4),
  ];

  static const _venues = [
    (label: 'Both', value: 'both'),
    (label: 'Home', value: 'home'),
    (label: 'Away', value: 'away'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filters = ref.watch(playerExplorerFiltersProvider);

    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: TextField(
            decoration: const InputDecoration(
              hintText: 'Search players...',
              prefixIcon: Icon(Icons.search, size: 20),
              isDense: true,
              contentPadding: EdgeInsets.symmetric(vertical: 10),
            ),
            onChanged: (v) =>
                ref.read(playerExplorerFiltersProvider.notifier).setSearch(v),
          ),
        ),
        // Position chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              ..._positions.map((pos) {
                final selected = filters.positionFilter == pos.value;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(pos.label, style: const TextStyle(fontSize: 12)),
                    selected: selected,
                    onSelected: (_) => ref
                        .read(playerExplorerFiltersProvider.notifier)
                        .setPositionFilter(pos.value),
                  ),
                );
              }),
              const SizedBox(width: 8),
              ..._venues.map((v) {
                final selected = filters.venue == v.value;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(v.label, style: const TextStyle(fontSize: 12)),
                    selected: selected,
                    selectedColor: AppColors.accent.withValues(alpha: 0.2),
                    onSelected: (_) => ref
                        .read(playerExplorerFiltersProvider.notifier)
                        .setVenue(v.value),
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }
}

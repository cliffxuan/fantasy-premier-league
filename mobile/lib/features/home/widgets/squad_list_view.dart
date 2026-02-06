import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/models/squad_player.dart';
import 'player_card.dart';

class SquadListView extends StatelessWidget {
  final List<SquadPlayer> squad;
  final ValueChanged<SquadPlayer>? onPlayerTap;

  const SquadListView({
    super.key,
    required this.squad,
    this.onPlayerTap,
  });

  @override
  Widget build(BuildContext context) {
    final starters = squad.take(11).toList();
    final bench = squad.skip(11).toList();

    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...starters.map(
            (p) => PlayerCard(
              player: p,
              onTap: () => onPlayerTap?.call(p),
            ),
          ),
          if (bench.isNotEmpty) ...[
            const Divider(height: 1),
            const Padding(
              padding: EdgeInsets.fromLTRB(12, 8, 12, 4),
              child: Text(
                'BENCH',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textMuted,
                  letterSpacing: 1,
                ),
              ),
            ),
            ...bench.map(
              (p) => PlayerCard(
                player: p,
                onTap: () => onPlayerTap?.call(p),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/player_image.dart';
import '../../../data/models/squad_player.dart';

class SquadPitchView extends StatelessWidget {
  final List<SquadPlayer> squad;
  final ValueChanged<SquadPlayer>? onPlayerTap;

  const SquadPitchView({
    super.key,
    required this.squad,
    this.onPlayerTap,
  });

  @override
  Widget build(BuildContext context) {
    // First 11 starters, rest are bench
    final starters = squad.take(11).toList();
    final bench = squad.skip(11).toList();

    final gkps = starters.where((p) => p.position == 1).toList();
    final defs = starters.where((p) => p.position == 2).toList();
    final mids = starters.where((p) => p.position == 3).toList();
    final fwds = starters.where((p) => p.position == 4).toList();

    return Column(
      children: [
        // Pitch
        Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          child: Column(
            children: [
              _buildRow(fwds),
              const SizedBox(height: 8),
              _buildRow(mids),
              const SizedBox(height: 8),
              _buildRow(defs),
              const SizedBox(height: 8),
              _buildRow(gkps),
            ],
          ),
        ),
        // Bench
        if (bench.isNotEmpty) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'BENCH',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textMuted,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                _buildRow(bench),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildRow(List<SquadPlayer> players) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: players
          .map((p) => _PitchPlayer(player: p, onTap: () => onPlayerTap?.call(p)))
          .toList(),
    );
  }
}

class _PitchPlayer extends StatelessWidget {
  final SquadPlayer player;
  final VoidCallback? onTap;

  const _PitchPlayer({required this.player, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 70,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                PlayerImage(playerCode: player.code, size: 36),
                if (player.isCaptain)
                  Positioned(
                    right: -4,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Text(
                        'C',
                        style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 2),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(3),
              ),
              child: Text(
                player.name,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
            Text(
              '${player.eventPoints}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: player.eventPoints > 0
                    ? AppColors.accent
                    : Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

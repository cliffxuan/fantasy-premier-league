import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/constants/asset_urls.dart';
import '../../../core/constants/player_status.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/fdr_badge.dart';
import '../../../data/models/squad_player.dart';
import 'pitch_player_badges.dart';

class SquadPitchView extends StatelessWidget {
  final List<SquadPlayer> squad;
  final ValueChanged<SquadPlayer>? onPlayerTap;
  /// Map of team ID -> 3-letter short name (e.g. {1: "ARS", 21: "WHU"}).
  /// When provided, the fixture badge uses the abbreviation instead of the
  /// full name string from the backend.
  final Map<int, String> teamShortNames;

  const SquadPitchView({
    super.key,
    required this.squad,
    this.onPlayerTap,
    this.teamShortNames = const {},
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
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
              ),
            ),
            child: Stack(
              children: [
                // Pitch decorations
                const _PitchOverlay(),
                // Player rows -- GKP top, FWD bottom (matches React)
                Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                  child: Column(
                    children: [
                      _buildRow(gkps),
                      const SizedBox(height: 8),
                      _buildRow(defs),
                      const SizedBox(height: 8),
                      _buildRow(mids),
                      const SizedBox(height: 8),
                      _buildRow(fwds),
                    ],
                  ),
                ),
              ],
            ),
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
                  'Bench',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
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
          .map((p) => _PitchPlayer(
                player: p,
                onTap: () => onPlayerTap?.call(p),
                teamShortNames: teamShortNames,
              ))
          .toList(),
    );
  }
}

/// Decorative pitch markings: grid pattern, center circle, halfway line.
class _PitchOverlay extends StatelessWidget {
  const _PitchOverlay();

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: IgnorePointer(
        child: CustomPaint(painter: _PitchPainter()),
      ),
    );
  }
}

class _PitchPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // Halfway line
    final midY = size.height / 2;
    canvas.drawLine(Offset(0, midY), Offset(size.width, midY), paint);

    // Center circle
    canvas.drawCircle(
      Offset(size.width / 2, midY),
      math.min(size.width, size.height) * 0.12,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _PitchPlayer extends StatelessWidget {
  final SquadPlayer player;
  final VoidCallback? onTap;
  final Map<int, String> teamShortNames;

  const _PitchPlayer({
    required this.player,
    this.onTap,
    this.teamShortNames = const {},
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 74,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Player image with badges
            Stack(
              clipBehavior: Clip.none,
              children: [
                // Portrait-ratio image matching React (45x56)
                Image.network(
                  AssetUrls.playerImage(player.code),
                  width: 45,
                  height: 56,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Image.network(
                    AssetUrls.playerImageFallback(player.code),
                    width: 45,
                    height: 56,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      width: 45,
                      height: 56,
                      color: Colors.white10,
                      child: const Icon(Icons.person, color: Colors.white24),
                    ),
                  ),
                ),
                // Event points badge (top-left)
                if (player.eventPoints != 0 ||
                    player.minutes > 0 ||
                    player.matchFinished)
                  Positioned(
                    left: -8,
                    top: -2,
                    child: Container(
                      width: 20,
                      height: 18,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${player.eventPoints}',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                // Captain / vice-captain badge (top-right)
                if (player.isCaptain || player.isViceCaptain)
                  Positioned(
                    right: -8,
                    top: -2,
                    child: CaptainBadge(isCaptain: player.isCaptain),
                  ),
                // Status indicator (bottom-right)
                if (player.status != PlayerStatus.available)
                  Positioned(
                    right: -2,
                    bottom: -2,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: statusIndicatorColor(player.status),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        '!',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 3),
            // Name + fixture card
            Container(
              width: 74,
              padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.card.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(
                  color: AppColors.border,
                  width: 0.5,
                ),
              ),
              child: Column(
                children: [
                  Text(
                    player.name,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 2),
                  // Fixture difficulty badge
                  FdrBadge(
                    difficulty: player.fixtureDifficulty,
                    label: _fixtureLabel(),
                    width: 60,
                    height: 16,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Resolve fixture label: use 3-letter abbreviation if team map is available,
  /// otherwise fall back to the backend-provided fixture string.
  String _fixtureLabel() {
    if (player.opponentId != null && teamShortNames.containsKey(player.opponentId)) {
      final short = teamShortNames[player.opponentId]!;
      // Extract (H)/(A) suffix from original fixture string
      final venue = player.fixture.contains('(H)') ? ' (H)' : player.fixture.contains('(A)') ? ' (A)' : '';
      return '$short$venue';
    }
    return player.fixture;
  }
}

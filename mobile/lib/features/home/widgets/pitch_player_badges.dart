import 'package:flutter/material.dart';

import '../../../core/constants/player_status.dart';
import '../../../core/theme/app_colors.dart';

/// A circular badge shown on the top-right of a pitch player image
/// to indicate captain (C) or vice-captain (V) status.
class CaptainBadge extends StatelessWidget {
  /// Whether this is a captain badge; false means vice-captain.
  final bool isCaptain;

  const CaptainBadge({super.key, required this.isCaptain});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 18,
      height: 18,
      decoration: BoxDecoration(
        color: isCaptain ? Colors.black : const Color(0xFF374151),
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 1),
      ),
      alignment: Alignment.center,
      child: Text(
        isCaptain ? 'C' : 'V',
        style: const TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}

/// Returns the appropriate colour for a player availability status indicator.
Color statusIndicatorColor(String status) {
  switch (status) {
    case PlayerStatus.doubtful:
      return const Color(0xFFEAB308); // yellow
    case PlayerStatus.injured:
      return AppColors.danger;
    case PlayerStatus.unavailable:
      return const Color(0xFFF97316); // orange
    default:
      return const Color(0xFF6B7280); // gray
  }
}

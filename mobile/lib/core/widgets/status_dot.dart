import 'package:flutter/material.dart';
import '../constants/player_status.dart';
import '../theme/app_colors.dart';

class StatusDot extends StatelessWidget {
  final String status;
  final double size;

  const StatusDot({super.key, required this.status, this.size = 8});

  Color get _color {
    switch (status.toLowerCase()) {
      case PlayerStatus.available:
        return AppColors.accent;
      case PlayerStatus.injured:
        return AppColors.danger;
      case PlayerStatus.suspended:
        return AppColors.danger;
      case PlayerStatus.doubtful:
        return AppColors.warning;
      case PlayerStatus.unavailable:
        return AppColors.textMuted;
      default:
        return AppColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: _color,
        shape: BoxShape.circle,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class StatusDot extends StatelessWidget {
  final String status;
  final double size;

  const StatusDot({super.key, required this.status, this.size = 8});

  Color get _color {
    switch (status.toLowerCase()) {
      case 'a':
        return AppColors.accent;
      case 'i':
        return AppColors.danger;
      case 's':
        return AppColors.danger;
      case 'd':
        return AppColors.warning;
      case 'u':
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

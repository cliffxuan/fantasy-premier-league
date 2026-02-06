import 'dart:ui';

import '../theme/app_colors.dart';

Color fdrColor(int difficulty) {
  switch (difficulty) {
    case 1:
      return const Color(0xFF257D5A); // Dark green
    case 2:
      return AppColors.accent; // Green
    case 3:
      return AppColors.warning; // Amber
    case 4:
      return const Color(0xFFE05E3A); // Orange-red
    case 5:
      return AppColors.danger; // Red
    default:
      return AppColors.textMuted;
  }
}

Color fdrTextColor(int difficulty) {
  return const Color(0xFFFFFFFF);
}

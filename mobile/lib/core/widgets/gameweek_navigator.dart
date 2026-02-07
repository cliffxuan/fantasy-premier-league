import 'package:flutter/material.dart';
import '../constants/fpl_constants.dart';
import '../theme/app_colors.dart';

class GameweekNavigator extends StatelessWidget {
  final int currentGw;
  final int? maxGw;
  final ValueChanged<int> onChanged;

  const GameweekNavigator({
    super.key,
    required this.currentGw,
    this.maxGw = FplConstants.maxGameweek,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: const Icon(Icons.chevron_left),
          onPressed: currentGw > 1 ? () => onChanged(currentGw - 1) : null,
          color: AppColors.text,
          disabledColor: AppColors.textMuted.withValues(alpha: 0.3),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          child: Text(
            'GW $currentGw',
            style: const TextStyle(
              color: AppColors.text,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.chevron_right),
          onPressed:
              currentGw < (maxGw ?? 38) ? () => onChanged(currentGw + 1) : null,
          color: AppColors.text,
          disabledColor: AppColors.textMuted.withValues(alpha: 0.3),
        ),
      ],
    );
  }
}

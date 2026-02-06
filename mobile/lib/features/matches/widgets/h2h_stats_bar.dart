import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class H2hStatsBar extends StatelessWidget {
  final String label;
  final double homeValue;
  final double awayValue;
  final String? homeLabel;
  final String? awayLabel;

  const H2hStatsBar({
    super.key,
    required this.label,
    required this.homeValue,
    required this.awayValue,
    this.homeLabel,
    this.awayLabel,
  });

  @override
  Widget build(BuildContext context) {
    final total = homeValue + awayValue;
    final homePct = total > 0 ? homeValue / total : 0.5;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                homeLabel ?? homeValue.toStringAsFixed(0),
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 12,
                ),
              ),
              Text(
                awayLabel ?? awayValue.toStringAsFixed(0),
                style: const TextStyle(
                  color: AppColors.danger,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: Row(
              children: [
                Expanded(
                  flex: (homePct * 100).round().clamp(1, 99),
                  child: Container(height: 4, color: AppColors.primary),
                ),
                Expanded(
                  flex: ((1 - homePct) * 100).round().clamp(1, 99),
                  child: Container(height: 4, color: AppColors.danger),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

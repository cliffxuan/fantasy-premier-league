import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/models/squad_response.dart';

class ChipRow extends StatelessWidget {
  final List<ChipStatus> chips;

  const ChipRow({super.key, required this.chips});

  IconData _chipIcon(String name) {
    switch (name) {
      case 'bboost':
        return Icons.airline_seat_recline_extra;
      case '3xc':
        return Icons.looks_3;
      case 'wildcard':
        return Icons.auto_awesome;
      case 'freehit':
        return Icons.bolt;
      default:
        return Icons.star;
    }
  }

  Color _chipColor(String status) {
    switch (status) {
      case 'active':
        return AppColors.accent;
      case 'played':
        return AppColors.textMuted;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: chips.map((chip) {
          final isUsed = chip.status == 'played' || chip.status == 'active';
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              avatar: Icon(
                _chipIcon(chip.name),
                size: 16,
                color: isUsed ? AppColors.textMuted : _chipColor(chip.status),
              ),
              label: Text(
                chip.label,
                style: TextStyle(
                  fontSize: 12,
                  color: isUsed ? AppColors.textMuted : AppColors.text,
                  decoration: chip.status == 'played'
                      ? TextDecoration.lineThrough
                      : null,
                ),
              ),
              selected: chip.status == 'active',
              onSelected: (_) {},
              selectedColor: AppColors.accent.withValues(alpha: 0.2),
            ),
          );
        }).toList(),
      ),
    );
  }
}

import 'dart:math';

import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/models/player_summary.dart';

/// Displays the "Recent Form" section with paginated history entries.
class RecentFormSection extends StatefulWidget {
  final List<PlayerHistoryEntry> history;
  final int pageSize;

  const RecentFormSection({
    super.key,
    required this.history,
    this.pageSize = 5,
  });

  @override
  State<RecentFormSection> createState() => _RecentFormSectionState();
}

class _RecentFormSectionState extends State<RecentFormSection> {
  int _formPage = 0;

  @override
  Widget build(BuildContext context) {
    final reversed = widget.history.reversed.toList();
    final totalPages = (reversed.length / widget.pageSize).ceil();
    final int page = _formPage.clamp(0, max<int>(0, totalPages - 1));
    final int start = page * widget.pageSize;
    final int end = min<int>(start + widget.pageSize, reversed.length);
    final pageEntries = reversed.sublist(start, end);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'Recent Form',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.text,
              ),
            ),
            const Spacer(),
            if (totalPages > 1) ...[
              GestureDetector(
                onTap: page > 0
                    ? () => setState(() => _formPage = page - 1)
                    : null,
                child: Icon(
                  Icons.chevron_left,
                  size: 20,
                  color: page > 0
                      ? AppColors.text
                      : AppColors.textMuted.withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 4),
              GestureDetector(
                onTap: page < totalPages - 1
                    ? () => setState(() => _formPage = page + 1)
                    : null,
                child: Icon(
                  Icons.chevron_right,
                  size: 20,
                  color: page < totalPages - 1
                      ? AppColors.text
                      : AppColors.textMuted.withValues(alpha: 0.3),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: pageEntries.map((entry) {
            return Expanded(
              child: _FormCell(entry: entry),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _FormCell extends StatelessWidget {
  final PlayerHistoryEntry entry;

  const _FormCell({required this.entry});

  Color get _pointsColor {
    if (entry.totalPoints >= 6) return AppColors.accent;
    if (entry.totalPoints >= 3) return AppColors.text;
    return AppColors.textMuted;
  }

  @override
  Widget build(BuildContext context) {
    final venue = entry.wasHome ? '(H)' : '(A)';
    final opponent = entry.opponentShortName ?? '???';

    return Column(
      children: [
        Text(
          'GW${entry.round}',
          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
        ),
        const SizedBox(height: 2),
        Text(
          '${entry.totalPoints}',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: _pointsColor,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          '$opponent $venue',
          style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

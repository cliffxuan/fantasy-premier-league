import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/fdr_badge.dart';
import '../../../data/models/player_summary.dart';

/// Displays the "Next Fixtures" section showing upcoming opponent rows.
class NextFixturesSection extends StatelessWidget {
  final List<PlayerFixtureEntry> fixtures;

  const NextFixturesSection({
    super.key,
    required this.fixtures,
  });

  @override
  Widget build(BuildContext context) {
    final upcoming = fixtures.where((f) => !f.finished).take(3).toList();
    if (upcoming.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Next Fixtures',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.text,
          ),
        ),
        const SizedBox(height: 8),
        ...upcoming.map((f) => _FixtureRow(fixture: f)),
      ],
    );
  }
}

class _FixtureRow extends StatelessWidget {
  final PlayerFixtureEntry fixture;

  const _FixtureRow({required this.fixture});

  @override
  Widget build(BuildContext context) {
    final isHome = fixture.isHome ?? true;
    final venue = isHome ? '(H)' : '(A)';
    final opponent =
        isHome ? fixture.teamAShort ?? '???' : fixture.teamHShort ?? '???';

    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(
            width: 44,
            child: Text(
              'GW${fixture.event ?? '?'}',
              style:
                  const TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
          ),
          Text(
            '$venue  vs  $opponent',
            style: const TextStyle(fontSize: 13, color: AppColors.text),
          ),
          const Spacer(),
          if (fixture.difficulty != null)
            FdrBadge(difficulty: fixture.difficulty!),
        ],
      ),
    );
  }
}

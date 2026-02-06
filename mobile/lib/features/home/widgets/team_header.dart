import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/team_badge.dart';
import '../../../data/models/squad_response.dart';
import '../providers/squad_providers.dart';

class TeamHeader extends ConsumerWidget {
  final SquadResponse data;

  const TeamHeader({super.key, required this.data});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final entry = data.entry;
    final history = data.history;
    final latestGw = history?.isNotEmpty == true ? history!.last : null;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: _buildBadge(entry),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        entry?.name ?? 'Team',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (entry != null)
                        Text(
                          '${entry.playerFirstName} ${entry.playerLastName}',
                          style: const TextStyle(color: AppColors.textMuted),
                        ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.logout, color: AppColors.textMuted),
                  onPressed: () {
                    ref.read(savedTeamIdProvider.notifier).clear();
                    ref.read(savedAuthTokenProvider.notifier).clear();
                  },
                  tooltip: 'Change team',
                ),
              ],
            ),
            if (latestGw != null) ...[
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _StatItem(
                    label: 'GW ${latestGw.event}',
                    value: '${latestGw.points} pts',
                  ),
                  _StatItem(
                    label: 'Total',
                    value: '${latestGw.totalPoints} pts',
                  ),
                  _StatItem(
                    label: 'Overall Rank',
                    value: latestGw.overallRank != null
                        ? _formatRank(latestGw.overallRank!)
                        : '-',
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(EntryInfo? entry) {
    // Show custom FPL team badge if available
    if (entry?.clubBadgeSrc != null) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Image.network(
          entry!.clubBadgeSrc!,
          width: 48,
          height: 48,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) =>
              _fallbackBadge(entry),
        ),
      );
    }
    return _fallbackBadge(entry);
  }

  Widget _fallbackBadge(EntryInfo? entry) {
    // Fall back to favourite PL team badge
    if (entry?.favouriteTeamCode != null) {
      return TeamBadge(teamCode: entry!.favouriteTeamCode!, size: 48);
    }
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.border,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(Icons.shield_outlined, color: AppColors.textMuted),
    );
  }

  String _formatRank(int rank) {
    if (rank >= 1000000) return '${(rank / 1000000).toStringAsFixed(1)}M';
    if (rank >= 1000) return '${(rank / 1000).toStringAsFixed(1)}K';
    return rank.toString();
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _AnalyticsTile(
            icon: Icons.local_fire_department,
            title: 'Form Lab',
            subtitle: 'Streak sustainability analysis',
            color: AppColors.warning,
            onTap: () => context.push('/analytics/form-lab'),
          ),
          _AnalyticsTile(
            icon: Icons.psychology,
            title: 'AI Solver',
            subtitle: 'Optimize your squad with LP solver',
            color: AppColors.primary,
            onTap: () => context.push('/analytics/solver'),
          ),
          _AnalyticsTile(
            icon: Icons.leaderboard,
            title: 'Top Managers',
            subtitle: 'Top 1K ownership & captaincy',
            color: AppColors.accent,
            onTap: () => context.push('/analytics/top-managers'),
          ),
          _AnalyticsTile(
            icon: Icons.star,
            title: 'Dream Team',
            subtitle: 'Best XI for each gameweek',
            color: AppColors.danger,
            onTap: () => context.push('/analytics/dream-team'),
          ),
        ],
      ),
    );
  }
}

class _AnalyticsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _AnalyticsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
        ),
        trailing: const Icon(
          Icons.chevron_right,
          color: AppColors.textMuted,
        ),
      ),
    );
  }
}

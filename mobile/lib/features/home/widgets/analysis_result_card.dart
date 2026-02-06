import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/section_card.dart';
import '../../../data/models/analysis_response.dart';

class AnalysisResultCard extends StatelessWidget {
  final AnalysisResponse analysis;

  const AnalysisResultCard({super.key, required this.analysis});

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'AI Analysis',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (analysis.immediateAction != null)
            _AnalysisSection(
              icon: Icons.flash_on,
              title: 'Immediate Action',
              content: analysis.immediateAction!,
              color: AppColors.warning,
            ),
          if (analysis.captaincy != null)
            _AnalysisSection(
              icon: Icons.star,
              title: 'Captaincy',
              content: analysis.captaincy!,
              color: AppColors.primary,
            ),
          if (analysis.transferPlan != null) ...[
            if (analysis.transferPlan!['conservative'] != null)
              _AnalysisSection(
                icon: Icons.swap_horiz,
                title: 'Conservative',
                content: analysis.transferPlan!['conservative']!,
                color: AppColors.accent,
              ),
            if (analysis.transferPlan!['aggressive'] != null)
              _AnalysisSection(
                icon: Icons.trending_up,
                title: 'Aggressive',
                content: analysis.transferPlan!['aggressive']!,
                color: AppColors.danger,
              ),
          ],
          if (analysis.futureWatch != null)
            _AnalysisSection(
              icon: Icons.visibility,
              title: 'Future Watch',
              content: analysis.futureWatch!,
              color: AppColors.textMuted,
            ),
        ],
      ),
    );
  }
}

class _AnalysisSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final String content;
  final Color color;

  const _AnalysisSection({
    required this.icon,
    required this.title,
    required this.content,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: color,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  content,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.text,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../../core/constants/player_status.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/position_utils.dart';
import '../../../core/widgets/player_image.dart';
import '../../../core/widgets/status_dot.dart';
import '../../../core/widgets/team_badge.dart';
import '../../../data/models/aggregated_player.dart';

class PlayerListTile extends StatelessWidget {
  final AggregatedPlayer player;
  final VoidCallback? onTap;
  final bool selectable;
  final bool selected;

  const PlayerListTile({
    super.key,
    required this.player,
    this.onTap,
    this.selectable = false,
    this.selected = false,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: selectable
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  selected ? Icons.check_box : Icons.check_box_outline_blank,
                  color: selected ? AppColors.primary : AppColors.textMuted,
                  size: 20,
                ),
                const SizedBox(width: 6),
                PlayerImage(playerCode: player.code, size: 36),
              ],
            )
          : PlayerImage(playerCode: player.code, size: 40),
      title: Row(
        children: [
          Flexible(
            child: Text(
              player.webName,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (player.status != PlayerStatus.available) ...[
            const SizedBox(width: 4),
            StatusDot(status: player.status),
          ],
        ],
      ),
      subtitle: Row(
        children: [
          TeamBadge(teamCode: player.teamCode, size: 14),
          const SizedBox(width: 4),
          Text(
            '${getPositionName(player.elementType)} | ${player.teamShort} | ${formatCost((player.nowCost * 10).round())}',
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 12,
            ),
          ),
        ],
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            '${player.pointsInRange} pts',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: AppColors.accent,
              fontSize: 14,
            ),
          ),
          Text(
            '${player.pointsPerGame.toStringAsFixed(1)} ppg',
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}

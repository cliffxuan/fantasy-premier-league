import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/fdr_badge.dart';
import '../../../core/widgets/player_image.dart';
import '../../../data/models/player_summary.dart';
import '../../../data/models/squad_player.dart';
import '../../explore/providers/player_explorer_providers.dart';

class SquadPlayerSheet extends ConsumerStatefulWidget {
  final SquadPlayer player;

  const SquadPlayerSheet({super.key, required this.player});

  @override
  ConsumerState<SquadPlayerSheet> createState() => _SquadPlayerSheetState();
}

class _SquadPlayerSheetState extends ConsumerState<SquadPlayerSheet> {
  int _formPage = 0;
  int _vsPage = 0;
  static const int _pageSize = 5;

  @override
  Widget build(BuildContext context) {
    final player = widget.player;
    final summaryAsync = ref.watch(
      playerSummaryProvider(player.id, opponentId: player.opponentId),
    );

    return DraggableScrollableSheet(
      initialChildSize: 0.55,
      minChildSize: 0.3,
      maxChildSize: 0.85,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: AppColors.textMuted.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Header
              _buildHeader(player),

              // News
              if (player.news.isNotEmpty) ...[
                const SizedBox(height: 12),
                _buildNews(player.news),
              ],

              // Prices
              const SizedBox(height: 16),
              _buildPrices(player),

              // Summary data (form + fixtures)
              summaryAsync.when(
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                error: (e, _) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Column(
                    children: [
                      Text(
                        'Could not load details',
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        e.toString(),
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 11,
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () => ref.invalidate(
                          playerSummaryProvider(player.id, opponentId: player.opponentId),
                        ),
                        child: const Text(
                          'Tap to retry',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                data: (summary) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (summary.history.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      _buildRecentForm(summary.history),
                    ],
                    if (summary.historyVsOpponent != null &&
                        summary.historyVsOpponent!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      _buildHistoryVsOpponent(
                        summary.historyVsOpponent!,
                        summary.nextOpponentName,
                      ),
                    ],
                    if (summary.fixtures.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      _buildNextFixtures(summary.fixtures),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(SquadPlayer player) {
    return Row(
      children: [
        PlayerImage(playerCode: player.code, size: 64),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                player.fullName ?? player.name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '${player.team}  ·  ${player.positionName}',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
        ),
        Column(
          children: [
            Text(
              '${player.totalPoints}',
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const Text(
              'pts',
              style: TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildNews(String news) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded,
              color: AppColors.warning, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              news,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.warning,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrices(SquadPlayer player) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          _priceColumn('Purchase', player.purchasePrice),
          _priceColumn('Current', player.cost, highlight: true),
          _priceColumn('Sell', player.sellingPrice),
        ],
      ),
    );
  }

  Widget _priceColumn(String label, double? price, {bool highlight = false}) {
    final formatted = price != null ? '£${price.toStringAsFixed(1)}m' : '—';
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
          ),
          const SizedBox(height: 2),
          Text(
            formatted,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: highlight ? AppColors.primary : AppColors.text,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentForm(List<PlayerHistoryEntry> history) {
    final reversed = history.reversed.toList();
    final totalPages = (reversed.length / _pageSize).ceil();
    // Clamp page to valid range
    final int page = _formPage.clamp(0, max<int>(0, totalPages - 1));
    final int start = page * _pageSize;
    final int end = min<int>(start + _pageSize, reversed.length);
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

  Widget _buildHistoryVsOpponent(
    List<PlayerVsOpponentEntry> entries,
    String? opponentName,
  ) {
    final totalPages = (entries.length / _pageSize).ceil();
    final int page = _vsPage.clamp(0, max<int>(0, totalPages - 1));
    final int start = page * _pageSize;
    final int end = min<int>(start + _pageSize, entries.length);
    final pageEntries = entries.sublist(start, end);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'History vs ${opponentName ?? 'Opponent'}',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.text,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (totalPages > 1) ...[
              GestureDetector(
                onTap: page > 0
                    ? () => setState(() => _vsPage = page - 1)
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
                    ? () => setState(() => _vsPage = page + 1)
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
            return Expanded(child: _VsCell(entry: entry));
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildNextFixtures(List<PlayerFixtureEntry> fixtures) {
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

class _VsCell extends StatelessWidget {
  final PlayerVsOpponentEntry entry;

  const _VsCell({required this.entry});

  Color get _pointsColor {
    if (entry.points >= 6) return AppColors.accent;
    if (entry.points >= 3) return AppColors.text;
    return AppColors.textMuted;
  }

  @override
  Widget build(BuildContext context) {
    final venue = entry.wasHome ? '(H)' : '(A)';
    // Extract 2-digit season year from e.g. "2024-25"
    final seasonLabel = entry.season.length >= 5
        ? entry.season.substring(entry.season.length - 2)
        : entry.season;

    return Column(
      children: [
        Text(
          seasonLabel,
          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
        ),
        const SizedBox(height: 2),
        Text(
          '${entry.points}',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: _pointsColor,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          venue,
          style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
        ),
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

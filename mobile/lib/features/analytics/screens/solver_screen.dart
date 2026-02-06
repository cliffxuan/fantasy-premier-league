import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/error_view.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/section_card.dart';
import '../providers/solver_providers.dart';
import '../widgets/fixture_ticker_table.dart';
import '../widgets/solver_form.dart';
import '../widgets/solver_result_table.dart';

class SolverScreen extends ConsumerWidget {
  const SolverScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final solverResult = ref.watch(solverResultProvider);
    final fixturesAsync = ref.watch(advancedFixturesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('AI Solver')),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        children: [
          const SolverForm(),
          const SizedBox(height: 8),
          solverResult.when(
            loading: () => const Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: LoadingIndicator(message: 'Solving...'),
              ),
            ),
            error: (e, _) => Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ErrorView(message: e.toString()),
              ),
            ),
            data: (result) {
              if (result == null) return const SizedBox.shrink();
              return SolverResultTable(result: result);
            },
          ),
          const SizedBox(height: 16),
          // Fixture ticker
          fixturesAsync.when(
            loading: () => const LoadingIndicator(),
            error: (e, _) => ErrorView(
              message: e.toString(),
              onRetry: () => ref.invalidate(advancedFixturesProvider),
            ),
            data: (teams) {
              if (teams.isEmpty) return const SizedBox.shrink();
              return SectionCard(
                title: 'Fixture Ticker',
                padding: const EdgeInsets.all(8),
                child: FixtureTickerTable(teams: teams),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

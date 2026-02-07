import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/constants/fpl_constants.dart';
import '../../../data/models/fixture_ticker.dart';
import '../../../data/models/solver_response.dart';
import '../../../data/repositories/fixture_repository.dart';
import '../../../data/repositories/optimization_repository.dart';

part 'solver_providers.g.dart';

@Riverpod(keepAlive: true)
class SolverParams extends _$SolverParams {
  @override
  ({double budget, bool excludeBench, bool excludeUnavailable, bool useMl})
      build() {
    return (
      budget: FplConstants.defaultBudget,
      excludeBench: false,
      excludeUnavailable: false,
      useMl: false,
    );
  }

  void setBudget(double v) =>
      state = (budget: v, excludeBench: state.excludeBench, excludeUnavailable: state.excludeUnavailable, useMl: state.useMl);

  void setExcludeBench(bool v) =>
      state = (budget: state.budget, excludeBench: v, excludeUnavailable: state.excludeUnavailable, useMl: state.useMl);

  void setExcludeUnavailable(bool v) =>
      state = (budget: state.budget, excludeBench: state.excludeBench, excludeUnavailable: v, useMl: state.useMl);

  void setUseMl(bool v) =>
      state = (budget: state.budget, excludeBench: state.excludeBench, excludeUnavailable: state.excludeUnavailable, useMl: v);
}

@riverpod
class SolverResult extends _$SolverResult {
  @override
  AsyncValue<SolverResponse?> build() => const AsyncData(null);

  Future<void> solve() async {
    state = const AsyncLoading();
    try {
      final params = ref.read(solverParamsProvider);
      final repo = ref.read(optimizationRepositoryProvider);
      final result = await repo.solve(
        budget: params.budget,
        excludeBench: params.excludeBench,
        excludeUnavailable: params.excludeUnavailable,
        useMl: params.useMl,
      );
      state = AsyncData(result);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }
}

@riverpod
Future<List<FixtureTickerTeam>> advancedFixtures(Ref ref) {
  final repo = ref.watch(fixtureRepositoryProvider);
  return repo.getAdvancedFixtures();
}

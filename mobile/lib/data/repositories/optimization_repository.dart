import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../core/providers/dio_provider.dart';
import '../datasources/fpl_remote_datasource.dart';
import '../models/dream_team_response.dart';
import '../models/solver_response.dart';

part 'optimization_repository.g.dart';

class OptimizationRepository {
  final FplRemoteDatasource _datasource;

  OptimizationRepository(this._datasource);

  Future<SolverResponse> solve({
    double budget = 100.0,
    int? minGw,
    int? maxGw,
    bool excludeBench = false,
    bool excludeUnavailable = false,
    bool useMl = false,
  }) {
    return _datasource.solvOptimization(
      budget: budget,
      minGw: minGw,
      maxGw: maxGw,
      excludeBench: excludeBench,
      excludeUnavailable: excludeUnavailable,
      useMl: useMl,
    );
  }

  Future<DreamTeamResponse> getDreamTeam(int gw) {
    return _datasource.getDreamTeam(gw);
  }
}

@Riverpod(keepAlive: true)
OptimizationRepository optimizationRepository(Ref ref) {
  final client = ref.watch(dioClientProvider);
  return OptimizationRepository(FplRemoteDatasource(client));
}

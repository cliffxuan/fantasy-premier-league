import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../core/providers/dio_provider.dart';
import '../datasources/fpl_remote_datasource.dart';
import '../models/analysis_request.dart';
import '../models/analysis_response.dart';
import '../models/form_player.dart';
import '../models/top_managers_response.dart';

part 'analysis_repository.g.dart';

class AnalysisRepository {
  final FplRemoteDatasource _datasource;

  AnalysisRepository(this._datasource);

  Future<AnalysisResponse> analyzeTeam(AnalysisRequest request) {
    return _datasource.analyzeTeam(request);
  }

  Future<List<FormPlayer>> getFormAnalysis() {
    return _datasource.getFormAnalysis();
  }

  Future<TopManagersResponse> getTopManagers({int? gw, int count = 1000}) {
    return _datasource.getTopManagers(gw: gw, count: count);
  }
}

@Riverpod(keepAlive: true)
AnalysisRepository analysisRepository(Ref ref) {
  final client = ref.watch(dioClientProvider);
  return AnalysisRepository(FplRemoteDatasource(client));
}

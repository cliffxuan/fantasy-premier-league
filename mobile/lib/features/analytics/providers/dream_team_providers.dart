import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/dream_team_response.dart';
import '../../../data/repositories/optimization_repository.dart';

part 'dream_team_providers.g.dart';

@riverpod
Future<DreamTeamResponse> dreamTeam(Ref ref, int gw) {
  final repo = ref.watch(optimizationRepositoryProvider);
  return repo.getDreamTeam(gw);
}

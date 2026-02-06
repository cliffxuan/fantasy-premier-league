import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/top_managers_response.dart';
import '../../../data/repositories/analysis_repository.dart';

part 'top_managers_providers.g.dart';

@riverpod
Future<TopManagersResponse> topManagers(Ref ref) {
  final repo = ref.watch(analysisRepositoryProvider);
  return repo.getTopManagers();
}

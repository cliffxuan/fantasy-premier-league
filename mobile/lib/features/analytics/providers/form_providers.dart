import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/form_player.dart';
import '../../../data/repositories/analysis_repository.dart';

part 'form_providers.g.dart';

@riverpod
Future<List<FormPlayer>> formAnalysis(Ref ref) {
  final repo = ref.watch(analysisRepositoryProvider);
  return repo.getFormAnalysis();
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../core/providers/dio_provider.dart';
import '../datasources/fpl_remote_datasource.dart';
import '../models/squad_response.dart';

part 'squad_repository.g.dart';

class SquadRepository {
  final FplRemoteDatasource _datasource;

  SquadRepository(this._datasource);

  Future<SquadResponse> getSquad(
    int teamId, {
    int? gw,
    String? authToken,
  }) {
    return _datasource.getSquad(teamId, gw: gw, authToken: authToken);
  }
}

@Riverpod(keepAlive: true)
SquadRepository squadRepository(Ref ref) {
  final client = ref.watch(dioClientProvider);
  return SquadRepository(FplRemoteDatasource(client));
}

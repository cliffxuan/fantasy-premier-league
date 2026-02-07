import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/dream_team_response.dart';
import '../../explore/providers/club_viewer_providers.dart';
import '../../home/widgets/squad_pitch_view.dart';

class DreamTeamPitch extends ConsumerWidget {
  final DreamTeamResponse data;

  const DreamTeamPitch({super.key, required this.data});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final teams = ref.watch(allTeamsProvider).valueOrNull ?? [];
    final teamShortNames = {
      for (final t in teams) t.id: t.shortName,
    };

    return SquadPitchView(
      squad: data.squad,
      teamShortNames: teamShortNames,
    );
  }
}

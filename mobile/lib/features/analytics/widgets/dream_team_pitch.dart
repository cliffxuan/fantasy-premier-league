import 'package:flutter/material.dart';

import '../../../data/models/dream_team_response.dart';
import '../../home/widgets/squad_pitch_view.dart';

class DreamTeamPitch extends StatelessWidget {
  final DreamTeamResponse data;

  const DreamTeamPitch({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return SquadPitchView(squad: data.squad);
  }
}

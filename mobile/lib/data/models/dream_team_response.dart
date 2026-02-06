import 'package:json_annotation/json_annotation.dart';
import 'squad_player.dart';

part 'dream_team_response.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class DreamTeamTopPlayer {
  final String name;
  final int points;
  final int code;
  final int teamCode;

  const DreamTeamTopPlayer({
    required this.name,
    required this.points,
    required this.code,
    required this.teamCode,
  });

  factory DreamTeamTopPlayer.fromJson(Map<String, dynamic> json) =>
      _$DreamTeamTopPlayerFromJson(json);
  Map<String, dynamic> toJson() => _$DreamTeamTopPlayerToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class DreamTeamResponse {
  final List<SquadPlayer> squad;
  final DreamTeamTopPlayer? topPlayer;
  final int totalPoints;
  final int gameweek;

  const DreamTeamResponse({
    required this.squad,
    this.topPlayer,
    required this.totalPoints,
    required this.gameweek,
  });

  factory DreamTeamResponse.fromJson(Map<String, dynamic> json) =>
      _$DreamTeamResponseFromJson(json);
  Map<String, dynamic> toJson() => _$DreamTeamResponseToJson(this);
}

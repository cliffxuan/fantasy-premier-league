import 'package:json_annotation/json_annotation.dart';

part 'form_player.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class FormPlayer {
  final int id;
  @JsonKey(defaultValue: 0)
  final int code;
  final String webName;
  final int teamCode;
  @JsonKey(defaultValue: '')
  final String teamShort;
  final int position;
  final int streakGames;
  final int streakPoints;
  final double xgDelta;
  final int goals;
  final double expectedGoals;
  final String classification;
  final int sustainabilityScore;
  final List<String> reasons;
  final int lastMatchGw;
  final String predictedEndGw;

  const FormPlayer({
    required this.id,
    this.code = 0,
    required this.webName,
    required this.teamCode,
    this.teamShort = '',
    required this.position,
    required this.streakGames,
    required this.streakPoints,
    required this.xgDelta,
    required this.goals,
    required this.expectedGoals,
    required this.classification,
    required this.sustainabilityScore,
    required this.reasons,
    required this.lastMatchGw,
    required this.predictedEndGw,
  });

  factory FormPlayer.fromJson(Map<String, dynamic> json) =>
      _$FormPlayerFromJson(json);
  Map<String, dynamic> toJson() => _$FormPlayerToJson(this);
}

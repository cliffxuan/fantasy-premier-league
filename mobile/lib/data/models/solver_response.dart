import 'package:json_annotation/json_annotation.dart';

part 'solver_response.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class SolverPlayer {
  final int id;
  final String name;
  final String? fullName;
  final int position;
  final int team;
  final double cost;
  final double points;
  final double form;
  final String status;
  final String news;
  final int code;
  final String teamShort;
  final int teamCode;
  final String? fullTeamName;
  final bool? isStarter;

  const SolverPlayer({
    required this.id,
    required this.name,
    this.fullName,
    required this.position,
    required this.team,
    required this.cost,
    required this.points,
    required this.form,
    required this.status,
    required this.news,
    required this.code,
    required this.teamShort,
    required this.teamCode,
    this.fullTeamName,
    this.isStarter,
  });

  factory SolverPlayer.fromJson(Map<String, dynamic> json) =>
      _$SolverPlayerFromJson(json);
  Map<String, dynamic> toJson() => _$SolverPlayerToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class SolverResponse {
  final List<SolverPlayer> squad;
  final double totalPoints;
  final double totalCost;
  final String status;
  final double budgetUsed;
  final String gameweekRange;

  const SolverResponse({
    required this.squad,
    required this.totalPoints,
    required this.totalCost,
    required this.status,
    required this.budgetUsed,
    required this.gameweekRange,
  });

  factory SolverResponse.fromJson(Map<String, dynamic> json) =>
      _$SolverResponseFromJson(json);
  Map<String, dynamic> toJson() => _$SolverResponseToJson(this);
}

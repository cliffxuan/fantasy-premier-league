import 'package:json_annotation/json_annotation.dart';

part 'player.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class Player {
  final int id;
  final String webName;
  final int elementType;
  final int team;
  final int nowCost;
  final int totalPoints;
  final String form;
  final String pointsPerGame;
  final String selectedByPercent;
  final String? news;
  final String? status;
  final String? teamName;
  final String? positionName;

  const Player({
    required this.id,
    required this.webName,
    required this.elementType,
    required this.team,
    required this.nowCost,
    required this.totalPoints,
    required this.form,
    required this.pointsPerGame,
    required this.selectedByPercent,
    this.news,
    this.status,
    this.teamName,
    this.positionName,
  });

  factory Player.fromJson(Map<String, dynamic> json) => _$PlayerFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerToJson(this);
}

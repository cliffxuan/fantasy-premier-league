import 'package:json_annotation/json_annotation.dart';

part 'aggregated_player.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class AggregatedPlayer {
  final int id;
  final String webName;
  final String? fullName;
  final int teamCode;
  final String teamShort;
  final int elementType;
  final double nowCost;
  final int totalPoints;
  final int pointsInRange;
  final int matchesInRange;
  final double pointsPerGame;
  final String news;
  final String status;
  final String? photo;
  final int code;
  final int? chanceOfPlayingNextRound;

  const AggregatedPlayer({
    required this.id,
    required this.webName,
    this.fullName,
    required this.teamCode,
    required this.teamShort,
    required this.elementType,
    required this.nowCost,
    required this.totalPoints,
    required this.pointsInRange,
    required this.matchesInRange,
    required this.pointsPerGame,
    required this.news,
    required this.status,
    this.photo,
    required this.code,
    this.chanceOfPlayingNextRound,
  });

  factory AggregatedPlayer.fromJson(Map<String, dynamic> json) =>
      _$AggregatedPlayerFromJson(json);
  Map<String, dynamic> toJson() => _$AggregatedPlayerToJson(this);
}

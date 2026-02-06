import 'package:json_annotation/json_annotation.dart';

part 'top_managers_response.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class TopManagerPlayer {
  final int id;
  final String webName;
  final String? fullName;
  final String teamShort;
  final int teamCode;
  final int elementType;
  final double cost;
  final int totalPoints;
  final int code;
  final String news;
  @JsonKey(name: 'ownership_top_1000')
  final double ownershipTop1000;
  @JsonKey(name: 'captain_top_1000')
  final double captainTop1000;
  final double globalOwnership;
  final double rankDiff;

  const TopManagerPlayer({
    required this.id,
    required this.webName,
    this.fullName,
    required this.teamShort,
    required this.teamCode,
    required this.elementType,
    required this.cost,
    required this.totalPoints,
    required this.code,
    required this.news,
    required this.ownershipTop1000,
    required this.captainTop1000,
    required this.globalOwnership,
    required this.rankDiff,
  });

  factory TopManagerPlayer.fromJson(Map<String, dynamic> json) =>
      _$TopManagerPlayerFromJson(json);
  Map<String, dynamic> toJson() => _$TopManagerPlayerToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class TopManagersResponse {
  final List<TopManagerPlayer> players;
  final Map<String, int> chips;
  final int sampleSize;
  final int gameweek;

  const TopManagersResponse({
    required this.players,
    required this.chips,
    required this.sampleSize,
    required this.gameweek,
  });

  factory TopManagersResponse.fromJson(Map<String, dynamic> json) =>
      _$TopManagersResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TopManagersResponseToJson(this);
}

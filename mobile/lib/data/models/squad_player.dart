import 'package:json_annotation/json_annotation.dart';

part 'squad_player.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class SquadPlayer {
  final int id;
  final String name;
  final String? fullName;
  final int position;
  final String team;
  final String teamShort;
  final int teamCode;
  final double cost;
  final double? purchasePrice;
  final double? sellingPrice;
  final String status;
  final String news;
  final bool isCaptain;
  final bool isViceCaptain;
  final String form;
  final int eventPoints;
  final int minutes;
  final bool matchStarted;
  final bool matchFinished;
  final int totalPoints;
  final String fixture;
  final int fixtureDifficulty;
  final int? chanceOfPlaying;
  final int code;
  final int? opponentId;

  const SquadPlayer({
    required this.id,
    required this.name,
    this.fullName,
    required this.position,
    required this.team,
    required this.teamShort,
    required this.teamCode,
    required this.cost,
    this.purchasePrice,
    this.sellingPrice,
    required this.status,
    required this.news,
    this.isCaptain = false,
    this.isViceCaptain = false,
    required this.form,
    this.eventPoints = 0,
    this.minutes = 0,
    this.matchStarted = false,
    this.matchFinished = false,
    this.totalPoints = 0,
    required this.fixture,
    this.fixtureDifficulty = 3,
    this.chanceOfPlaying,
    required this.code,
    this.opponentId,
  });

  String get positionName {
    switch (position) {
      case 1:
        return 'GKP';
      case 2:
        return 'DEF';
      case 3:
        return 'MID';
      case 4:
        return 'FWD';
      default:
        return 'UNK';
    }
  }

  factory SquadPlayer.fromJson(Map<String, dynamic> json) =>
      _$SquadPlayerFromJson(json);
  Map<String, dynamic> toJson() => _$SquadPlayerToJson(this);
}

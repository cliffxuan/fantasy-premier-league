import 'package:json_annotation/json_annotation.dart';

part 'fixture_ticker.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class FixtureTickerMatch {
  final int gameweek;
  final String opponent;
  final int? opponentId;
  final bool? isHome;
  final int fdrOfficial;
  final double? fdrAttack;
  final double? fdrDefend;
  final double? fdrMarket;
  final double? winProb;
  final String? sourceType;
  final String? kickoff;
  final bool? isDouble;

  const FixtureTickerMatch({
    required this.gameweek,
    required this.opponent,
    this.opponentId,
    this.isHome,
    required this.fdrOfficial,
    this.fdrAttack,
    this.fdrDefend,
    this.fdrMarket,
    this.winProb,
    this.sourceType,
    this.kickoff,
    this.isDouble,
  });

  factory FixtureTickerMatch.fromJson(Map<String, dynamic> json) =>
      _$FixtureTickerMatchFromJson(json);
  Map<String, dynamic> toJson() => _$FixtureTickerMatchToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class FixtureTickerTeam {
  final int teamId;
  final String teamName;
  final String teamShort;
  final int teamCode;
  @JsonKey(name: 'next_5')
  final List<FixtureTickerMatch> next5;
  final double avgDifficultyOfficial;
  final double? avgDifficultyAttack;
  final double? avgDifficultyDefend;
  final double? avgDifficultyMarket;

  const FixtureTickerTeam({
    required this.teamId,
    required this.teamName,
    required this.teamShort,
    required this.teamCode,
    required this.next5,
    required this.avgDifficultyOfficial,
    this.avgDifficultyAttack,
    this.avgDifficultyDefend,
    this.avgDifficultyMarket,
  });

  factory FixtureTickerTeam.fromJson(Map<String, dynamic> json) =>
      _$FixtureTickerTeamFromJson(json);
  Map<String, dynamic> toJson() => _$FixtureTickerTeamToJson(this);
}

import 'package:json_annotation/json_annotation.dart';

part 'h2h_match.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class H2hMatch {
  final String season;
  final String date;
  final int gameweek;
  final String homeTeam;
  final String awayTeam;
  final int scoreHome;
  final int scoreAway;
  final int homeTeamId;
  final int awayTeamId;
  final bool matchIsHome;
  final List<String> scorersHome;
  final List<String> scorersAway;
  final List<String> assistsHome;
  final List<String> assistsAway;

  const H2hMatch({
    required this.season,
    required this.date,
    required this.gameweek,
    required this.homeTeam,
    required this.awayTeam,
    required this.scoreHome,
    required this.scoreAway,
    required this.homeTeamId,
    required this.awayTeamId,
    required this.matchIsHome,
    this.scorersHome = const [],
    this.scorersAway = const [],
    this.assistsHome = const [],
    this.assistsAway = const [],
  });

  factory H2hMatch.fromJson(Map<String, dynamic> json) =>
      _$H2hMatchFromJson(json);
  Map<String, dynamic> toJson() => _$H2hMatchToJson(this);
}

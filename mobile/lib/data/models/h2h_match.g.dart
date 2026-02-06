// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'h2h_match.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

H2hMatch _$H2hMatchFromJson(Map<String, dynamic> json) => H2hMatch(
  season: json['season'] as String,
  date: json['date'] as String,
  gameweek: (json['gameweek'] as num).toInt(),
  homeTeam: json['home_team'] as String,
  awayTeam: json['away_team'] as String,
  scoreHome: (json['score_home'] as num).toInt(),
  scoreAway: (json['score_away'] as num).toInt(),
  homeTeamId: (json['home_team_id'] as num).toInt(),
  awayTeamId: (json['away_team_id'] as num).toInt(),
  matchIsHome: json['match_is_home'] as bool,
  scorersHome:
      (json['scorers_home'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  scorersAway:
      (json['scorers_away'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  assistsHome:
      (json['assists_home'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  assistsAway:
      (json['assists_away'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
);

Map<String, dynamic> _$H2hMatchToJson(H2hMatch instance) => <String, dynamic>{
  'season': instance.season,
  'date': instance.date,
  'gameweek': instance.gameweek,
  'home_team': instance.homeTeam,
  'away_team': instance.awayTeam,
  'score_home': instance.scoreHome,
  'score_away': instance.scoreAway,
  'home_team_id': instance.homeTeamId,
  'away_team_id': instance.awayTeamId,
  'match_is_home': instance.matchIsHome,
  'scorers_home': instance.scorersHome,
  'scorers_away': instance.scorersAway,
  'assists_home': instance.assistsHome,
  'assists_away': instance.assistsAway,
};

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fixture.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Fixture _$FixtureFromJson(Map<String, dynamic> json) => Fixture(
  id: (json['id'] as num).toInt(),
  code: (json['code'] as num).toInt(),
  event: (json['event'] as num?)?.toInt(),
  teamH: (json['team_h'] as num).toInt(),
  teamA: (json['team_a'] as num).toInt(),
  teamHScore: (json['team_h_score'] as num?)?.toInt(),
  teamAScore: (json['team_a_score'] as num?)?.toInt(),
  finished: json['finished'] as bool? ?? false,
  kickoffTime: json['kickoff_time'] as String?,
  minutes: (json['minutes'] as num?)?.toInt() ?? 0,
  started: json['started'] as bool? ?? false,
  finishedProvisional: json['finished_provisional'] as bool? ?? false,
  teamHDifficulty: (json['team_h_difficulty'] as num).toInt(),
  teamADifficulty: (json['team_a_difficulty'] as num).toInt(),
  teamHName: json['team_h_name'] as String?,
  teamAName: json['team_a_name'] as String?,
  teamHShort: json['team_h_short'] as String?,
  teamAShort: json['team_a_short'] as String?,
  teamHCode: (json['team_h_code'] as num?)?.toInt(),
  teamACode: (json['team_a_code'] as num?)?.toInt(),
  historyStats: json['history_stats'] as Map<String, dynamic>?,
  historyStatsVenue: json['history_stats_venue'] as Map<String, dynamic>?,
);

Map<String, dynamic> _$FixtureToJson(Fixture instance) => <String, dynamic>{
  'id': instance.id,
  'code': instance.code,
  'event': instance.event,
  'team_h': instance.teamH,
  'team_a': instance.teamA,
  'team_h_score': instance.teamHScore,
  'team_a_score': instance.teamAScore,
  'finished': instance.finished,
  'kickoff_time': instance.kickoffTime,
  'minutes': instance.minutes,
  'started': instance.started,
  'finished_provisional': instance.finishedProvisional,
  'team_h_difficulty': instance.teamHDifficulty,
  'team_a_difficulty': instance.teamADifficulty,
  'team_h_name': instance.teamHName,
  'team_a_name': instance.teamAName,
  'team_h_short': instance.teamHShort,
  'team_a_short': instance.teamAShort,
  'team_h_code': instance.teamHCode,
  'team_a_code': instance.teamACode,
  'history_stats': instance.historyStats,
  'history_stats_venue': instance.historyStatsVenue,
};

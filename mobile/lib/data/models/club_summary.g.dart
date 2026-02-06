// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'club_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClubFixtureEntry _$ClubFixtureEntryFromJson(Map<String, dynamic> json) =>
    ClubFixtureEntry(
      id: (json['id'] as num?)?.toInt(),
      event: (json['event'] as num?)?.toInt(),
      opponentName: json['opponent_name'] as String,
      opponentShort: json['opponent_short'] as String,
      opponentCode: (json['opponent_code'] as num?)?.toInt(),
      isHome: json['is_home'] as bool,
      difficulty: (json['difficulty'] as num).toInt(),
      kickoffTime: json['kickoff_time'] as String?,
      finished: json['finished'] as bool?,
      score: json['score'] as String?,
      result: json['result'] as String?,
    );

Map<String, dynamic> _$ClubFixtureEntryToJson(ClubFixtureEntry instance) =>
    <String, dynamic>{
      'id': instance.id,
      'event': instance.event,
      'opponent_name': instance.opponentName,
      'opponent_short': instance.opponentShort,
      'opponent_code': instance.opponentCode,
      'is_home': instance.isHome,
      'difficulty': instance.difficulty,
      'kickoff_time': instance.kickoffTime,
      'finished': instance.finished,
      'score': instance.score,
      'result': instance.result,
    };

ClubTopPlayer _$ClubTopPlayerFromJson(Map<String, dynamic> json) =>
    ClubTopPlayer(
      id: (json['id'] as num).toInt(),
      webName: json['web_name'] as String,
      totalPoints: (json['total_points'] as num).toInt(),
      elementType: (json['element_type'] as num).toInt(),
      cost: (json['cost'] as num).toDouble(),
      photo: json['photo'] as String?,
    );

Map<String, dynamic> _$ClubTopPlayerToJson(ClubTopPlayer instance) =>
    <String, dynamic>{
      'id': instance.id,
      'web_name': instance.webName,
      'total_points': instance.totalPoints,
      'element_type': instance.elementType,
      'cost': instance.cost,
      'photo': instance.photo,
    };

ClubSummary _$ClubSummaryFromJson(Map<String, dynamic> json) => ClubSummary(
  team: json['team'] as Map<String, dynamic>,
  topPlayers: (json['top_players'] as List<dynamic>)
      .map((e) => ClubTopPlayer.fromJson(e as Map<String, dynamic>))
      .toList(),
  upcomingFixtures: (json['upcoming_fixtures'] as List<dynamic>)
      .map((e) => ClubFixtureEntry.fromJson(e as Map<String, dynamic>))
      .toList(),
  recentResults: (json['recent_results'] as List<dynamic>)
      .map((e) => ClubFixtureEntry.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$ClubSummaryToJson(ClubSummary instance) =>
    <String, dynamic>{
      'team': instance.team,
      'top_players': instance.topPlayers.map((e) => e.toJson()).toList(),
      'upcoming_fixtures': instance.upcomingFixtures
          .map((e) => e.toJson())
          .toList(),
      'recent_results': instance.recentResults.map((e) => e.toJson()).toList(),
    };

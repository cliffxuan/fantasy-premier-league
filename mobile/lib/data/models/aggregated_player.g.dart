// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'aggregated_player.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AggregatedPlayer _$AggregatedPlayerFromJson(Map<String, dynamic> json) =>
    AggregatedPlayer(
      id: (json['id'] as num).toInt(),
      webName: json['web_name'] as String,
      fullName: json['full_name'] as String?,
      teamCode: (json['team_code'] as num).toInt(),
      teamShort: json['team_short'] as String,
      elementType: (json['element_type'] as num).toInt(),
      nowCost: (json['now_cost'] as num).toDouble(),
      totalPoints: (json['total_points'] as num).toInt(),
      pointsInRange: (json['points_in_range'] as num).toInt(),
      matchesInRange: (json['matches_in_range'] as num).toInt(),
      pointsPerGame: (json['points_per_game'] as num).toDouble(),
      news: json['news'] as String,
      status: json['status'] as String,
      photo: json['photo'] as String?,
      code: (json['code'] as num).toInt(),
      chanceOfPlayingNextRound: (json['chance_of_playing_next_round'] as num?)
          ?.toInt(),
    );

Map<String, dynamic> _$AggregatedPlayerToJson(AggregatedPlayer instance) =>
    <String, dynamic>{
      'id': instance.id,
      'web_name': instance.webName,
      'full_name': instance.fullName,
      'team_code': instance.teamCode,
      'team_short': instance.teamShort,
      'element_type': instance.elementType,
      'now_cost': instance.nowCost,
      'total_points': instance.totalPoints,
      'points_in_range': instance.pointsInRange,
      'matches_in_range': instance.matchesInRange,
      'points_per_game': instance.pointsPerGame,
      'news': instance.news,
      'status': instance.status,
      'photo': instance.photo,
      'code': instance.code,
      'chance_of_playing_next_round': instance.chanceOfPlayingNextRound,
    };

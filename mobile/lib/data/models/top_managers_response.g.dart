// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'top_managers_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TopManagerPlayer _$TopManagerPlayerFromJson(Map<String, dynamic> json) =>
    TopManagerPlayer(
      id: (json['id'] as num).toInt(),
      webName: json['web_name'] as String,
      fullName: json['full_name'] as String?,
      teamShort: json['team_short'] as String,
      teamCode: (json['team_code'] as num).toInt(),
      elementType: (json['element_type'] as num).toInt(),
      cost: (json['cost'] as num).toDouble(),
      totalPoints: (json['total_points'] as num).toInt(),
      code: (json['code'] as num).toInt(),
      news: json['news'] as String,
      ownershipTop1000: (json['ownership_top_1000'] as num).toDouble(),
      captainTop1000: (json['captain_top_1000'] as num).toDouble(),
      globalOwnership: (json['global_ownership'] as num).toDouble(),
      rankDiff: (json['rank_diff'] as num).toDouble(),
    );

Map<String, dynamic> _$TopManagerPlayerToJson(TopManagerPlayer instance) =>
    <String, dynamic>{
      'id': instance.id,
      'web_name': instance.webName,
      'full_name': instance.fullName,
      'team_short': instance.teamShort,
      'team_code': instance.teamCode,
      'element_type': instance.elementType,
      'cost': instance.cost,
      'total_points': instance.totalPoints,
      'code': instance.code,
      'news': instance.news,
      'ownership_top_1000': instance.ownershipTop1000,
      'captain_top_1000': instance.captainTop1000,
      'global_ownership': instance.globalOwnership,
      'rank_diff': instance.rankDiff,
    };

TopManagersResponse _$TopManagersResponseFromJson(Map<String, dynamic> json) =>
    TopManagersResponse(
      players: (json['players'] as List<dynamic>)
          .map((e) => TopManagerPlayer.fromJson(e as Map<String, dynamic>))
          .toList(),
      chips: Map<String, int>.from(json['chips'] as Map),
      sampleSize: (json['sample_size'] as num).toInt(),
      gameweek: (json['gameweek'] as num).toInt(),
    );

Map<String, dynamic> _$TopManagersResponseToJson(
  TopManagersResponse instance,
) => <String, dynamic>{
  'players': instance.players.map((e) => e.toJson()).toList(),
  'chips': instance.chips,
  'sample_size': instance.sampleSize,
  'gameweek': instance.gameweek,
};

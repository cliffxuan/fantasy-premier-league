// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dream_team_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DreamTeamTopPlayer _$DreamTeamTopPlayerFromJson(Map<String, dynamic> json) =>
    DreamTeamTopPlayer(
      name: json['name'] as String,
      points: (json['points'] as num).toInt(),
      code: (json['code'] as num).toInt(),
      teamCode: (json['team_code'] as num).toInt(),
    );

Map<String, dynamic> _$DreamTeamTopPlayerToJson(DreamTeamTopPlayer instance) =>
    <String, dynamic>{
      'name': instance.name,
      'points': instance.points,
      'code': instance.code,
      'team_code': instance.teamCode,
    };

DreamTeamResponse _$DreamTeamResponseFromJson(Map<String, dynamic> json) =>
    DreamTeamResponse(
      squad: (json['squad'] as List<dynamic>)
          .map((e) => SquadPlayer.fromJson(e as Map<String, dynamic>))
          .toList(),
      topPlayer: json['top_player'] == null
          ? null
          : DreamTeamTopPlayer.fromJson(
              json['top_player'] as Map<String, dynamic>,
            ),
      totalPoints: (json['total_points'] as num).toInt(),
      gameweek: (json['gameweek'] as num).toInt(),
    );

Map<String, dynamic> _$DreamTeamResponseToJson(DreamTeamResponse instance) =>
    <String, dynamic>{
      'squad': instance.squad.map((e) => e.toJson()).toList(),
      'top_player': instance.topPlayer?.toJson(),
      'total_points': instance.totalPoints,
      'gameweek': instance.gameweek,
    };

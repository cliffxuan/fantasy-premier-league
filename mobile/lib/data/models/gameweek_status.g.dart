// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'gameweek_status.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GameweekStatusInfo _$GameweekStatusInfoFromJson(Map<String, dynamic> json) =>
    GameweekStatusInfo(
      id: (json['id'] as num).toInt(),
      finished: json['finished'] as bool,
      dataChecked: json['data_checked'] as bool,
      started: json['started'] as bool,
    );

Map<String, dynamic> _$GameweekStatusInfoToJson(GameweekStatusInfo instance) =>
    <String, dynamic>{
      'id': instance.id,
      'finished': instance.finished,
      'data_checked': instance.dataChecked,
      'started': instance.started,
    };

GameweekStatus _$GameweekStatusFromJson(Map<String, dynamic> json) =>
    GameweekStatus(
      gameweek: (json['gameweek'] as num).toInt(),
      status: GameweekStatusInfo.fromJson(
        json['status'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$GameweekStatusToJson(GameweekStatus instance) =>
    <String, dynamic>{
      'gameweek': instance.gameweek,
      'status': instance.status.toJson(),
    };

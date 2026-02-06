// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'player.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Player _$PlayerFromJson(Map<String, dynamic> json) => Player(
  id: (json['id'] as num).toInt(),
  webName: json['web_name'] as String,
  elementType: (json['element_type'] as num).toInt(),
  team: (json['team'] as num).toInt(),
  nowCost: (json['now_cost'] as num).toInt(),
  totalPoints: (json['total_points'] as num).toInt(),
  form: json['form'] as String,
  pointsPerGame: json['points_per_game'] as String,
  selectedByPercent: json['selected_by_percent'] as String,
  news: json['news'] as String?,
  status: json['status'] as String?,
  teamName: json['team_name'] as String?,
  positionName: json['position_name'] as String?,
);

Map<String, dynamic> _$PlayerToJson(Player instance) => <String, dynamic>{
  'id': instance.id,
  'web_name': instance.webName,
  'element_type': instance.elementType,
  'team': instance.team,
  'now_cost': instance.nowCost,
  'total_points': instance.totalPoints,
  'form': instance.form,
  'points_per_game': instance.pointsPerGame,
  'selected_by_percent': instance.selectedByPercent,
  'news': instance.news,
  'status': instance.status,
  'team_name': instance.teamName,
  'position_name': instance.positionName,
};

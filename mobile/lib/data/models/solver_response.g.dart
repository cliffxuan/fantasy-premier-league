// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'solver_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SolverPlayer _$SolverPlayerFromJson(Map<String, dynamic> json) => SolverPlayer(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  fullName: json['full_name'] as String?,
  position: (json['position'] as num).toInt(),
  team: (json['team'] as num).toInt(),
  cost: (json['cost'] as num).toDouble(),
  points: (json['points'] as num).toDouble(),
  form: (json['form'] as num).toDouble(),
  status: json['status'] as String,
  news: json['news'] as String,
  code: (json['code'] as num).toInt(),
  teamShort: json['team_short'] as String,
  teamCode: (json['team_code'] as num).toInt(),
  fullTeamName: json['full_team_name'] as String?,
  isStarter: json['is_starter'] as bool?,
);

Map<String, dynamic> _$SolverPlayerToJson(SolverPlayer instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'full_name': instance.fullName,
      'position': instance.position,
      'team': instance.team,
      'cost': instance.cost,
      'points': instance.points,
      'form': instance.form,
      'status': instance.status,
      'news': instance.news,
      'code': instance.code,
      'team_short': instance.teamShort,
      'team_code': instance.teamCode,
      'full_team_name': instance.fullTeamName,
      'is_starter': instance.isStarter,
    };

SolverResponse _$SolverResponseFromJson(Map<String, dynamic> json) =>
    SolverResponse(
      squad: (json['squad'] as List<dynamic>)
          .map((e) => SolverPlayer.fromJson(e as Map<String, dynamic>))
          .toList(),
      totalPoints: (json['total_points'] as num).toDouble(),
      totalCost: (json['total_cost'] as num).toDouble(),
      status: json['status'] as String,
      budgetUsed: (json['budget_used'] as num).toDouble(),
      gameweekRange: json['gameweek_range'] as String,
    );

Map<String, dynamic> _$SolverResponseToJson(SolverResponse instance) =>
    <String, dynamic>{
      'squad': instance.squad.map((e) => e.toJson()).toList(),
      'total_points': instance.totalPoints,
      'total_cost': instance.totalCost,
      'status': instance.status,
      'budget_used': instance.budgetUsed,
      'gameweek_range': instance.gameweekRange,
    };

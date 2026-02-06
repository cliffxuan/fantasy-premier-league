// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'league_table_entry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LeagueTableEntry _$LeagueTableEntryFromJson(Map<String, dynamic> json) =>
    LeagueTableEntry(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      shortName: json['short_name'] as String,
      code: (json['code'] as num).toInt(),
      played: (json['played'] as num).toInt(),
      won: (json['won'] as num).toInt(),
      drawn: (json['drawn'] as num).toInt(),
      lost: (json['lost'] as num).toInt(),
      points: (json['points'] as num).toInt(),
      goalsFor: (json['goals_for'] as num).toInt(),
      goalsAgainst: (json['goals_against'] as num).toInt(),
      goalDifference: (json['goal_difference'] as num).toInt(),
      form: json['form'] as String?,
      position: (json['position'] as num).toInt(),
    );

Map<String, dynamic> _$LeagueTableEntryToJson(LeagueTableEntry instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'short_name': instance.shortName,
      'code': instance.code,
      'played': instance.played,
      'won': instance.won,
      'drawn': instance.drawn,
      'lost': instance.lost,
      'points': instance.points,
      'goals_for': instance.goalsFor,
      'goals_against': instance.goalsAgainst,
      'goal_difference': instance.goalDifference,
      'form': instance.form,
      'position': instance.position,
    };

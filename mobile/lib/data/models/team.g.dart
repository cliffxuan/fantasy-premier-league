// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'team.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Team _$TeamFromJson(Map<String, dynamic> json) => Team(
  id: (json['id'] as num).toInt(),
  code: (json['code'] as num).toInt(),
  name: json['name'] as String,
  shortName: json['short_name'] as String,
  fullName: json['full_name'] as String,
  strength: (json['strength'] as num).toInt(),
);

Map<String, dynamic> _$TeamToJson(Team instance) => <String, dynamic>{
  'id': instance.id,
  'code': instance.code,
  'name': instance.name,
  'short_name': instance.shortName,
  'full_name': instance.fullName,
  'strength': instance.strength,
};

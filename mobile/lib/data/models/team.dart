import 'package:json_annotation/json_annotation.dart';

part 'team.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class Team {
  final int id;
  final int code;
  final String name;
  final String shortName;
  final String fullName;
  final int strength;

  const Team({
    required this.id,
    required this.code,
    required this.name,
    required this.shortName,
    required this.fullName,
    required this.strength,
  });

  factory Team.fromJson(Map<String, dynamic> json) => _$TeamFromJson(json);
  Map<String, dynamic> toJson() => _$TeamToJson(this);
}

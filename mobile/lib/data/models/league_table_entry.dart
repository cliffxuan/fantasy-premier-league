import 'package:json_annotation/json_annotation.dart';

part 'league_table_entry.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class LeagueTableEntry {
  final int id;
  final String name;
  final String shortName;
  final int code;
  final int played;
  final int won;
  final int drawn;
  final int lost;
  final int points;
  final int goalsFor;
  final int goalsAgainst;
  final int goalDifference;
  final String? form;
  final int position;

  const LeagueTableEntry({
    required this.id,
    required this.name,
    required this.shortName,
    required this.code,
    required this.played,
    required this.won,
    required this.drawn,
    required this.lost,
    required this.points,
    required this.goalsFor,
    required this.goalsAgainst,
    required this.goalDifference,
    this.form,
    required this.position,
  });

  factory LeagueTableEntry.fromJson(Map<String, dynamic> json) =>
      _$LeagueTableEntryFromJson(json);
  Map<String, dynamic> toJson() => _$LeagueTableEntryToJson(this);
}

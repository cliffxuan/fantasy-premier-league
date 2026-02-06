import 'package:json_annotation/json_annotation.dart';

part 'gameweek_status.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class GameweekStatusInfo {
  final int id;
  final bool finished;
  final bool dataChecked;
  final bool started;

  const GameweekStatusInfo({
    required this.id,
    required this.finished,
    required this.dataChecked,
    required this.started,
  });

  factory GameweekStatusInfo.fromJson(Map<String, dynamic> json) =>
      _$GameweekStatusInfoFromJson(json);
  Map<String, dynamic> toJson() => _$GameweekStatusInfoToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class GameweekStatus {
  final int gameweek;
  final GameweekStatusInfo status;

  const GameweekStatus({
    required this.gameweek,
    required this.status,
  });

  factory GameweekStatus.fromJson(Map<String, dynamic> json) =>
      _$GameweekStatusFromJson(json);
  Map<String, dynamic> toJson() => _$GameweekStatusToJson(this);
}

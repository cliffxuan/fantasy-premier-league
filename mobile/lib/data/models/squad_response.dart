import 'package:json_annotation/json_annotation.dart';
import 'squad_player.dart';

part 'squad_response.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class ChipStatus {
  final String name;
  final String label;
  final String status;
  final List<int> events;

  const ChipStatus({
    required this.name,
    required this.label,
    required this.status,
    this.events = const [],
  });

  factory ChipStatus.fromJson(Map<String, dynamic> json) =>
      _$ChipStatusFromJson(json);
  Map<String, dynamic> toJson() => _$ChipStatusToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class GwHistory {
  final int event;
  final int points;
  final int totalPoints;
  final int? rank;
  final int? overallRank;
  final int bank;
  final int value;
  final int eventTransfers;
  final int eventTransfersCost;
  final int pointsOnBench;

  const GwHistory({
    required this.event,
    required this.points,
    required this.totalPoints,
    this.rank,
    this.overallRank,
    required this.bank,
    required this.value,
    this.eventTransfers = 0,
    this.eventTransfersCost = 0,
    this.pointsOnBench = 0,
  });

  factory GwHistory.fromJson(Map<String, dynamic> json) =>
      _$GwHistoryFromJson(json);
  Map<String, dynamic> toJson() => _$GwHistoryToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class EntryInfo {
  final int id;
  final String name;
  final String playerFirstName;
  final String playerLastName;
  final int? favouriteTeam;
  final int? favouriteTeamCode;
  final String? favouriteTeamName;
  final String? clubBadgeSrc;
  final String? playerRegionIsoCodeShort;

  const EntryInfo({
    required this.id,
    required this.name,
    required this.playerFirstName,
    required this.playerLastName,
    this.favouriteTeam,
    this.favouriteTeamCode,
    this.favouriteTeamName,
    this.clubBadgeSrc,
    this.playerRegionIsoCodeShort,
  });

  factory EntryInfo.fromJson(Map<String, dynamic> json) =>
      _$EntryInfoFromJson(json);
  Map<String, dynamic> toJson() => _$EntryInfoToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class TransferInfo {
  final String time;
  final int elementIn;
  final String elementInName;
  final int elementInCost;
  final int elementOut;
  final String elementOutName;
  final int elementOutCost;

  const TransferInfo({
    required this.time,
    required this.elementIn,
    required this.elementInName,
    required this.elementInCost,
    required this.elementOut,
    required this.elementOutName,
    required this.elementOutCost,
  });

  factory TransferInfo.fromJson(Map<String, dynamic> json) =>
      _$TransferInfoFromJson(json);
  Map<String, dynamic> toJson() => _$TransferInfoToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class SquadResponse {
  final List<SquadPlayer> squad;
  final List<ChipStatus>? chips;
  final List<GwHistory>? history;
  final EntryInfo? entry;
  final int? freeTransfers;
  final List<TransferInfo>? transfers;
  final int gameweek;
  final bool? isPrivate;

  const SquadResponse({
    required this.squad,
    this.chips,
    this.history,
    this.entry,
    this.freeTransfers,
    this.transfers,
    required this.gameweek,
    this.isPrivate,
  });

  factory SquadResponse.fromJson(Map<String, dynamic> json) =>
      _$SquadResponseFromJson(json);
  Map<String, dynamic> toJson() => _$SquadResponseToJson(this);
}

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'squad_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChipStatus _$ChipStatusFromJson(Map<String, dynamic> json) => ChipStatus(
  name: json['name'] as String,
  label: json['label'] as String,
  status: json['status'] as String,
  events:
      (json['events'] as List<dynamic>?)
          ?.map((e) => (e as num).toInt())
          .toList() ??
      const [],
);

Map<String, dynamic> _$ChipStatusToJson(ChipStatus instance) =>
    <String, dynamic>{
      'name': instance.name,
      'label': instance.label,
      'status': instance.status,
      'events': instance.events,
    };

GwHistory _$GwHistoryFromJson(Map<String, dynamic> json) => GwHistory(
  event: (json['event'] as num).toInt(),
  points: (json['points'] as num).toInt(),
  totalPoints: (json['total_points'] as num).toInt(),
  rank: (json['rank'] as num?)?.toInt(),
  overallRank: (json['overall_rank'] as num?)?.toInt(),
  bank: (json['bank'] as num).toInt(),
  value: (json['value'] as num).toInt(),
  eventTransfers: (json['event_transfers'] as num?)?.toInt() ?? 0,
  eventTransfersCost: (json['event_transfers_cost'] as num?)?.toInt() ?? 0,
  pointsOnBench: (json['points_on_bench'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$GwHistoryToJson(GwHistory instance) => <String, dynamic>{
  'event': instance.event,
  'points': instance.points,
  'total_points': instance.totalPoints,
  'rank': instance.rank,
  'overall_rank': instance.overallRank,
  'bank': instance.bank,
  'value': instance.value,
  'event_transfers': instance.eventTransfers,
  'event_transfers_cost': instance.eventTransfersCost,
  'points_on_bench': instance.pointsOnBench,
};

EntryInfo _$EntryInfoFromJson(Map<String, dynamic> json) => EntryInfo(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  playerFirstName: json['player_first_name'] as String,
  playerLastName: json['player_last_name'] as String,
  favouriteTeam: (json['favourite_team'] as num?)?.toInt(),
  favouriteTeamCode: (json['favourite_team_code'] as num?)?.toInt(),
  favouriteTeamName: json['favourite_team_name'] as String?,
  clubBadgeSrc: json['club_badge_src'] as String?,
  playerRegionIsoCodeShort: json['player_region_iso_code_short'] as String?,
);

Map<String, dynamic> _$EntryInfoToJson(EntryInfo instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'player_first_name': instance.playerFirstName,
  'player_last_name': instance.playerLastName,
  'favourite_team': instance.favouriteTeam,
  'favourite_team_code': instance.favouriteTeamCode,
  'favourite_team_name': instance.favouriteTeamName,
  'club_badge_src': instance.clubBadgeSrc,
  'player_region_iso_code_short': instance.playerRegionIsoCodeShort,
};

TransferInfo _$TransferInfoFromJson(Map<String, dynamic> json) => TransferInfo(
  time: json['time'] as String,
  elementIn: (json['element_in'] as num).toInt(),
  elementInName: json['element_in_name'] as String,
  elementInCost: (json['element_in_cost'] as num).toInt(),
  elementOut: (json['element_out'] as num).toInt(),
  elementOutName: json['element_out_name'] as String,
  elementOutCost: (json['element_out_cost'] as num).toInt(),
);

Map<String, dynamic> _$TransferInfoToJson(TransferInfo instance) =>
    <String, dynamic>{
      'time': instance.time,
      'element_in': instance.elementIn,
      'element_in_name': instance.elementInName,
      'element_in_cost': instance.elementInCost,
      'element_out': instance.elementOut,
      'element_out_name': instance.elementOutName,
      'element_out_cost': instance.elementOutCost,
    };

SquadResponse _$SquadResponseFromJson(Map<String, dynamic> json) =>
    SquadResponse(
      squad: (json['squad'] as List<dynamic>)
          .map((e) => SquadPlayer.fromJson(e as Map<String, dynamic>))
          .toList(),
      chips: (json['chips'] as List<dynamic>?)
          ?.map((e) => ChipStatus.fromJson(e as Map<String, dynamic>))
          .toList(),
      history: (json['history'] as List<dynamic>?)
          ?.map((e) => GwHistory.fromJson(e as Map<String, dynamic>))
          .toList(),
      entry: json['entry'] == null
          ? null
          : EntryInfo.fromJson(json['entry'] as Map<String, dynamic>),
      freeTransfers: (json['free_transfers'] as num?)?.toInt(),
      transfers: (json['transfers'] as List<dynamic>?)
          ?.map((e) => TransferInfo.fromJson(e as Map<String, dynamic>))
          .toList(),
      gameweek: (json['gameweek'] as num).toInt(),
      isPrivate: json['is_private'] as bool?,
    );

Map<String, dynamic> _$SquadResponseToJson(SquadResponse instance) =>
    <String, dynamic>{
      'squad': instance.squad.map((e) => e.toJson()).toList(),
      'chips': instance.chips?.map((e) => e.toJson()).toList(),
      'history': instance.history?.map((e) => e.toJson()).toList(),
      'entry': instance.entry?.toJson(),
      'free_transfers': instance.freeTransfers,
      'transfers': instance.transfers?.map((e) => e.toJson()).toList(),
      'gameweek': instance.gameweek,
      'is_private': instance.isPrivate,
    };

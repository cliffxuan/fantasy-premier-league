// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'squad_player.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SquadPlayer _$SquadPlayerFromJson(Map<String, dynamic> json) => SquadPlayer(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  fullName: json['full_name'] as String?,
  position: (json['position'] as num).toInt(),
  team: json['team'] as String,
  teamShort: json['team_short'] as String,
  teamCode: (json['team_code'] as num).toInt(),
  cost: (json['cost'] as num).toDouble(),
  purchasePrice: (json['purchase_price'] as num?)?.toDouble(),
  sellingPrice: (json['selling_price'] as num?)?.toDouble(),
  status: json['status'] as String,
  news: json['news'] as String,
  isCaptain: json['is_captain'] as bool? ?? false,
  isViceCaptain: json['is_vice_captain'] as bool? ?? false,
  form: json['form'] as String,
  eventPoints: (json['event_points'] as num?)?.toInt() ?? 0,
  minutes: (json['minutes'] as num?)?.toInt() ?? 0,
  matchStarted: json['match_started'] as bool? ?? false,
  matchFinished: json['match_finished'] as bool? ?? false,
  totalPoints: (json['total_points'] as num?)?.toInt() ?? 0,
  fixture: json['fixture'] as String,
  fixtureDifficulty: (json['fixture_difficulty'] as num?)?.toInt() ?? 3,
  chanceOfPlaying: (json['chance_of_playing'] as num?)?.toInt(),
  code: (json['code'] as num).toInt(),
  opponentId: (json['opponent_id'] as num?)?.toInt(),
);

Map<String, dynamic> _$SquadPlayerToJson(SquadPlayer instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'full_name': instance.fullName,
      'position': instance.position,
      'team': instance.team,
      'team_short': instance.teamShort,
      'team_code': instance.teamCode,
      'cost': instance.cost,
      'purchase_price': instance.purchasePrice,
      'selling_price': instance.sellingPrice,
      'status': instance.status,
      'news': instance.news,
      'is_captain': instance.isCaptain,
      'is_vice_captain': instance.isViceCaptain,
      'form': instance.form,
      'event_points': instance.eventPoints,
      'minutes': instance.minutes,
      'match_started': instance.matchStarted,
      'match_finished': instance.matchFinished,
      'total_points': instance.totalPoints,
      'fixture': instance.fixture,
      'fixture_difficulty': instance.fixtureDifficulty,
      'chance_of_playing': instance.chanceOfPlaying,
      'code': instance.code,
      'opponent_id': instance.opponentId,
    };

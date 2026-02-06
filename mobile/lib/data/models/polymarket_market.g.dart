// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'polymarket_market.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PolymarketOutcome _$PolymarketOutcomeFromJson(Map<String, dynamic> json) =>
    PolymarketOutcome(
      label: json['label'] as String,
      price: (json['price'] as num).toDouble(),
    );

Map<String, dynamic> _$PolymarketOutcomeToJson(PolymarketOutcome instance) =>
    <String, dynamic>{'label': instance.label, 'price': instance.price};

PolymarketTeamInfo _$PolymarketTeamInfoFromJson(Map<String, dynamic> json) =>
    PolymarketTeamInfo(
      name: json['name'] as String,
      shortName: json['short_name'] as String,
      code: (json['code'] as num?)?.toInt(),
    );

Map<String, dynamic> _$PolymarketTeamInfoToJson(PolymarketTeamInfo instance) =>
    <String, dynamic>{
      'name': instance.name,
      'short_name': instance.shortName,
      'code': instance.code,
    };

PolymarketMarket _$PolymarketMarketFromJson(
  Map<String, dynamic> json,
) => PolymarketMarket(
  id: json['id'] as String,
  question: json['question'] as String,
  slug: json['slug'] as String,
  outcomes: (json['outcomes'] as List<dynamic>)
      .map((e) => PolymarketOutcome.fromJson(e as Map<String, dynamic>))
      .toList(),
  volume: (json['volume'] as num).toDouble(),
  endDate: json['end_date'] as String?,
  image: json['image'] as String?,
  group: json['group'] as String?,
  homeTeam: json['home_team'] == null
      ? null
      : PolymarketTeamInfo.fromJson(json['home_team'] as Map<String, dynamic>),
  awayTeam: json['away_team'] == null
      ? null
      : PolymarketTeamInfo.fromJson(json['away_team'] as Map<String, dynamic>),
  gameweek: (json['gameweek'] as num?)?.toInt(),
);

Map<String, dynamic> _$PolymarketMarketToJson(PolymarketMarket instance) =>
    <String, dynamic>{
      'id': instance.id,
      'question': instance.question,
      'slug': instance.slug,
      'outcomes': instance.outcomes.map((e) => e.toJson()).toList(),
      'volume': instance.volume,
      'end_date': instance.endDate,
      'image': instance.image,
      'group': instance.group,
      'home_team': instance.homeTeam?.toJson(),
      'away_team': instance.awayTeam?.toJson(),
      'gameweek': instance.gameweek,
    };

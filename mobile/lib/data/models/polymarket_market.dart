import 'package:json_annotation/json_annotation.dart';

part 'polymarket_market.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class PolymarketOutcome {
  final String label;
  final double price;

  const PolymarketOutcome({
    required this.label,
    required this.price,
  });

  factory PolymarketOutcome.fromJson(Map<String, dynamic> json) =>
      _$PolymarketOutcomeFromJson(json);
  Map<String, dynamic> toJson() => _$PolymarketOutcomeToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class PolymarketTeamInfo {
  final String name;
  final String shortName;
  final int? code;

  const PolymarketTeamInfo({
    required this.name,
    required this.shortName,
    this.code,
  });

  factory PolymarketTeamInfo.fromJson(Map<String, dynamic> json) =>
      _$PolymarketTeamInfoFromJson(json);
  Map<String, dynamic> toJson() => _$PolymarketTeamInfoToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class PolymarketMarket {
  final String id;
  final String question;
  final String slug;
  final List<PolymarketOutcome> outcomes;
  final double volume;
  final String? endDate;
  final String? image;
  final String? group;
  final PolymarketTeamInfo? homeTeam;
  final PolymarketTeamInfo? awayTeam;
  final int? gameweek;

  const PolymarketMarket({
    required this.id,
    required this.question,
    required this.slug,
    required this.outcomes,
    required this.volume,
    this.endDate,
    this.image,
    this.group,
    this.homeTeam,
    this.awayTeam,
    this.gameweek,
  });

  factory PolymarketMarket.fromJson(Map<String, dynamic> json) =>
      _$PolymarketMarketFromJson(json);
  Map<String, dynamic> toJson() => _$PolymarketMarketToJson(this);
}

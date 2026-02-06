// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fixture_ticker.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FixtureTickerMatch _$FixtureTickerMatchFromJson(Map<String, dynamic> json) =>
    FixtureTickerMatch(
      gameweek: (json['gameweek'] as num).toInt(),
      opponent: json['opponent'] as String,
      opponentId: (json['opponent_id'] as num?)?.toInt(),
      isHome: json['is_home'] as bool?,
      fdrOfficial: (json['fdr_official'] as num).toInt(),
      fdrAttack: (json['fdr_attack'] as num?)?.toDouble(),
      fdrDefend: (json['fdr_defend'] as num?)?.toDouble(),
      fdrMarket: (json['fdr_market'] as num?)?.toDouble(),
      winProb: (json['win_prob'] as num?)?.toDouble(),
      sourceType: json['source_type'] as String?,
      kickoff: json['kickoff'] as String?,
      isDouble: json['is_double'] as bool?,
    );

Map<String, dynamic> _$FixtureTickerMatchToJson(FixtureTickerMatch instance) =>
    <String, dynamic>{
      'gameweek': instance.gameweek,
      'opponent': instance.opponent,
      'opponent_id': instance.opponentId,
      'is_home': instance.isHome,
      'fdr_official': instance.fdrOfficial,
      'fdr_attack': instance.fdrAttack,
      'fdr_defend': instance.fdrDefend,
      'fdr_market': instance.fdrMarket,
      'win_prob': instance.winProb,
      'source_type': instance.sourceType,
      'kickoff': instance.kickoff,
      'is_double': instance.isDouble,
    };

FixtureTickerTeam _$FixtureTickerTeamFromJson(Map<String, dynamic> json) =>
    FixtureTickerTeam(
      teamId: (json['team_id'] as num).toInt(),
      teamName: json['team_name'] as String,
      teamShort: json['team_short'] as String,
      teamCode: (json['team_code'] as num).toInt(),
      next5: (json['next_5'] as List<dynamic>)
          .map((e) => FixtureTickerMatch.fromJson(e as Map<String, dynamic>))
          .toList(),
      avgDifficultyOfficial: (json['avg_difficulty_official'] as num)
          .toDouble(),
      avgDifficultyAttack: (json['avg_difficulty_attack'] as num?)?.toDouble(),
      avgDifficultyDefend: (json['avg_difficulty_defend'] as num?)?.toDouble(),
      avgDifficultyMarket: (json['avg_difficulty_market'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$FixtureTickerTeamToJson(FixtureTickerTeam instance) =>
    <String, dynamic>{
      'team_id': instance.teamId,
      'team_name': instance.teamName,
      'team_short': instance.teamShort,
      'team_code': instance.teamCode,
      'next_5': instance.next5.map((e) => e.toJson()).toList(),
      'avg_difficulty_official': instance.avgDifficultyOfficial,
      'avg_difficulty_attack': instance.avgDifficultyAttack,
      'avg_difficulty_defend': instance.avgDifficultyDefend,
      'avg_difficulty_market': instance.avgDifficultyMarket,
    };

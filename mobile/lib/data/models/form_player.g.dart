// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'form_player.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FormPlayer _$FormPlayerFromJson(Map<String, dynamic> json) => FormPlayer(
  id: (json['id'] as num).toInt(),
  webName: json['web_name'] as String,
  teamCode: (json['team_code'] as num).toInt(),
  position: (json['position'] as num).toInt(),
  streakGames: (json['streak_games'] as num).toInt(),
  streakPoints: (json['streak_points'] as num).toInt(),
  xgDelta: (json['xg_delta'] as num).toDouble(),
  goals: (json['goals'] as num).toInt(),
  expectedGoals: (json['expected_goals'] as num).toDouble(),
  classification: json['classification'] as String,
  sustainabilityScore: (json['sustainability_score'] as num).toInt(),
  reasons: (json['reasons'] as List<dynamic>).map((e) => e as String).toList(),
  lastMatchGw: (json['last_match_gw'] as num).toInt(),
  predictedEndGw: json['predicted_end_gw'] as String,
);

Map<String, dynamic> _$FormPlayerToJson(FormPlayer instance) =>
    <String, dynamic>{
      'id': instance.id,
      'web_name': instance.webName,
      'team_code': instance.teamCode,
      'position': instance.position,
      'streak_games': instance.streakGames,
      'streak_points': instance.streakPoints,
      'xg_delta': instance.xgDelta,
      'goals': instance.goals,
      'expected_goals': instance.expectedGoals,
      'classification': instance.classification,
      'sustainability_score': instance.sustainabilityScore,
      'reasons': instance.reasons,
      'last_match_gw': instance.lastMatchGw,
      'predicted_end_gw': instance.predictedEndGw,
    };

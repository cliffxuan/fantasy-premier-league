// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'player_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PlayerHistoryEntry _$PlayerHistoryEntryFromJson(Map<String, dynamic> json) =>
    PlayerHistoryEntry(
      element: (json['element'] as num).toInt(),
      fixture: (json['fixture'] as num).toInt(),
      opponentTeam: (json['opponent_team'] as num).toInt(),
      opponentShortName: json['opponent_short_name'] as String?,
      totalPoints: (json['total_points'] as num).toInt(),
      wasHome: json['was_home'] as bool,
      kickoffTime: json['kickoff_time'] as String?,
      teamHScore: (json['team_h_score'] as num?)?.toInt(),
      teamAScore: (json['team_a_score'] as num?)?.toInt(),
      round: (json['round'] as num).toInt(),
      minutes: (json['minutes'] as num).toInt(),
      goalsScored: (json['goals_scored'] as num?)?.toInt() ?? 0,
      assists: (json['assists'] as num?)?.toInt() ?? 0,
      cleanSheets: (json['clean_sheets'] as num?)?.toInt() ?? 0,
      goalsConceded: (json['goals_conceded'] as num?)?.toInt() ?? 0,
      ownGoals: (json['own_goals'] as num?)?.toInt() ?? 0,
      penaltiesSaved: (json['penalties_saved'] as num?)?.toInt() ?? 0,
      penaltiesMissed: (json['penalties_missed'] as num?)?.toInt() ?? 0,
      yellowCards: (json['yellow_cards'] as num?)?.toInt() ?? 0,
      redCards: (json['red_cards'] as num?)?.toInt() ?? 0,
      saves: (json['saves'] as num?)?.toInt() ?? 0,
      bonus: (json['bonus'] as num?)?.toInt() ?? 0,
      bps: (json['bps'] as num?)?.toInt() ?? 0,
      influence: _toStr(json['influence']),
      creativity: _toStr(json['creativity']),
      threat: _toStr(json['threat']),
      ictIndex: _toStr(json['ict_index']),
      value: (json['value'] as num?)?.toInt() ?? 0,
      expectedGoals: _toStr(json['expected_goals']),
      expectedAssists: _toStr(json['expected_assists']),
      expectedGoalInvolvements: _toStr(json['expected_goal_involvements']),
      expectedGoalsConceded: _toStr(json['expected_goals_conceded']),
    );

Map<String, dynamic> _$PlayerHistoryEntryToJson(PlayerHistoryEntry instance) =>
    <String, dynamic>{
      'element': instance.element,
      'fixture': instance.fixture,
      'opponent_team': instance.opponentTeam,
      'opponent_short_name': instance.opponentShortName,
      'total_points': instance.totalPoints,
      'was_home': instance.wasHome,
      'kickoff_time': instance.kickoffTime,
      'team_h_score': instance.teamHScore,
      'team_a_score': instance.teamAScore,
      'round': instance.round,
      'minutes': instance.minutes,
      'goals_scored': instance.goalsScored,
      'assists': instance.assists,
      'clean_sheets': instance.cleanSheets,
      'goals_conceded': instance.goalsConceded,
      'own_goals': instance.ownGoals,
      'penalties_saved': instance.penaltiesSaved,
      'penalties_missed': instance.penaltiesMissed,
      'yellow_cards': instance.yellowCards,
      'red_cards': instance.redCards,
      'saves': instance.saves,
      'bonus': instance.bonus,
      'bps': instance.bps,
      'influence': instance.influence,
      'creativity': instance.creativity,
      'threat': instance.threat,
      'ict_index': instance.ictIndex,
      'value': instance.value,
      'expected_goals': instance.expectedGoals,
      'expected_assists': instance.expectedAssists,
      'expected_goal_involvements': instance.expectedGoalInvolvements,
      'expected_goals_conceded': instance.expectedGoalsConceded,
    };

PlayerFixtureEntry _$PlayerFixtureEntryFromJson(Map<String, dynamic> json) =>
    PlayerFixtureEntry(
      id: (json['id'] as num).toInt(),
      code: (json['code'] as num?)?.toInt(),
      teamH: (json['team_h'] as num).toInt(),
      teamA: (json['team_a'] as num).toInt(),
      teamHShort: json['team_h_short'] as String?,
      teamAShort: json['team_a_short'] as String?,
      event: (json['event'] as num?)?.toInt(),
      finished: json['finished'] as bool? ?? false,
      minutes: (json['minutes'] as num?)?.toInt() ?? 0,
      kickoffTime: json['kickoff_time'] as String?,
      isHome: json['is_home'] as bool?,
      difficulty: (json['difficulty'] as num?)?.toInt(),
    );

Map<String, dynamic> _$PlayerFixtureEntryToJson(PlayerFixtureEntry instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': instance.code,
      'team_h': instance.teamH,
      'team_a': instance.teamA,
      'team_h_short': instance.teamHShort,
      'team_a_short': instance.teamAShort,
      'event': instance.event,
      'finished': instance.finished,
      'minutes': instance.minutes,
      'kickoff_time': instance.kickoffTime,
      'is_home': instance.isHome,
      'difficulty': instance.difficulty,
    };

PlayerVsOpponentEntry _$PlayerVsOpponentEntryFromJson(
  Map<String, dynamic> json,
) => PlayerVsOpponentEntry(
  season: json['season'] as String,
  date: _toStr(json['date']),
  gameweek: (json['gameweek'] as num).toInt(),
  points: (json['points'] as num).toInt(),
  fixture: _toStr(json['fixture']),
  minutes: (json['minutes'] as num).toInt(),
  goalsScored: (json['goals_scored'] as num?)?.toInt() ?? 0,
  assists: (json['assists'] as num?)?.toInt() ?? 0,
  bonus: (json['bonus'] as num?)?.toInt() ?? 0,
  bps: (json['bps'] as num?)?.toInt() ?? 0,
  saves: (json['saves'] as num?)?.toInt() ?? 0,
  wasHome: json['was_home'] as bool,
  opponentName: json['opponent_name'] as String?,
);

Map<String, dynamic> _$PlayerVsOpponentEntryToJson(
  PlayerVsOpponentEntry instance,
) => <String, dynamic>{
  'season': instance.season,
  'date': instance.date,
  'gameweek': instance.gameweek,
  'points': instance.points,
  'fixture': instance.fixture,
  'minutes': instance.minutes,
  'goals_scored': instance.goalsScored,
  'assists': instance.assists,
  'bonus': instance.bonus,
  'bps': instance.bps,
  'saves': instance.saves,
  'was_home': instance.wasHome,
  'opponent_name': instance.opponentName,
};

PlayerSummary _$PlayerSummaryFromJson(Map<String, dynamic> json) =>
    PlayerSummary(
      history: (json['history'] as List<dynamic>)
          .map((e) => PlayerHistoryEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
      fixtures: (json['fixtures'] as List<dynamic>)
          .map((e) => PlayerFixtureEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
      historyPast: json['history_past'] as List<dynamic>?,
      historyVsOpponent: (json['history_vs_opponent'] as List<dynamic>?)
          ?.map(
            (e) => PlayerVsOpponentEntry.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
      nextOpponentName: json['next_opponent_name'] as String?,
    );

Map<String, dynamic> _$PlayerSummaryToJson(PlayerSummary instance) =>
    <String, dynamic>{
      'history': instance.history.map((e) => e.toJson()).toList(),
      'fixtures': instance.fixtures.map((e) => e.toJson()).toList(),
      'history_past': instance.historyPast,
      'history_vs_opponent': instance.historyVsOpponent
          ?.map((e) => e.toJson())
          .toList(),
      'next_opponent_name': instance.nextOpponentName,
    };

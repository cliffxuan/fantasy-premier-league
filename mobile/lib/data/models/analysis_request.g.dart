// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'analysis_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

KnowledgeGapInput _$KnowledgeGapInputFromJson(Map<String, dynamic> json) =>
    KnowledgeGapInput(
      moneyInBank: (json['money_in_bank'] as num).toDouble(),
      freeTransfers: (json['free_transfers'] as num).toInt(),
      transfersRolled: json['transfers_rolled'] as bool? ?? false,
    );

Map<String, dynamic> _$KnowledgeGapInputToJson(KnowledgeGapInput instance) =>
    <String, dynamic>{
      'money_in_bank': instance.moneyInBank,
      'free_transfers': instance.freeTransfers,
      'transfers_rolled': instance.transfersRolled,
    };

AnalysisRequest _$AnalysisRequestFromJson(Map<String, dynamic> json) =>
    AnalysisRequest(
      teamId: (json['team_id'] as num).toInt(),
      gameweek: (json['gameweek'] as num?)?.toInt(),
      knowledgeGap: KnowledgeGapInput.fromJson(
        json['knowledge_gap'] as Map<String, dynamic>,
      ),
      authToken: json['auth_token'] as String?,
      returnPrompt: json['return_prompt'] as bool? ?? false,
    );

Map<String, dynamic> _$AnalysisRequestToJson(AnalysisRequest instance) =>
    <String, dynamic>{
      'team_id': instance.teamId,
      'gameweek': instance.gameweek,
      'knowledge_gap': instance.knowledgeGap.toJson(),
      'auth_token': instance.authToken,
      'return_prompt': instance.returnPrompt,
    };

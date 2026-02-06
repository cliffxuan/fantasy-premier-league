// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'analysis_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AnalysisResponse _$AnalysisResponseFromJson(Map<String, dynamic> json) =>
    AnalysisResponse(
      immediateAction: json['immediate_action'] as String?,
      transferPlan: (json['transfer_plan'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, e as String),
      ),
      captaincy: json['captaincy'] as String?,
      futureWatch: json['future_watch'] as String?,
      squad: (json['squad'] as List<dynamic>)
          .map((e) => e as Map<String, dynamic>)
          .toList(),
      rawAnalysis: json['raw_analysis'] as String?,
      generatedPrompt: json['generated_prompt'] as String?,
    );

Map<String, dynamic> _$AnalysisResponseToJson(AnalysisResponse instance) =>
    <String, dynamic>{
      'immediate_action': instance.immediateAction,
      'transfer_plan': instance.transferPlan,
      'captaincy': instance.captaincy,
      'future_watch': instance.futureWatch,
      'squad': instance.squad,
      'raw_analysis': instance.rawAnalysis,
      'generated_prompt': instance.generatedPrompt,
    };

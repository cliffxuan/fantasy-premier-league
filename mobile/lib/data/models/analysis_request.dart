import 'package:json_annotation/json_annotation.dart';

part 'analysis_request.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class KnowledgeGapInput {
  final double moneyInBank;
  final int freeTransfers;
  final bool transfersRolled;

  const KnowledgeGapInput({
    required this.moneyInBank,
    required this.freeTransfers,
    this.transfersRolled = false,
  });

  factory KnowledgeGapInput.fromJson(Map<String, dynamic> json) =>
      _$KnowledgeGapInputFromJson(json);
  Map<String, dynamic> toJson() => _$KnowledgeGapInputToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class AnalysisRequest {
  final int teamId;
  final int? gameweek;
  final KnowledgeGapInput knowledgeGap;
  final String? authToken;
  final bool returnPrompt;

  const AnalysisRequest({
    required this.teamId,
    this.gameweek,
    required this.knowledgeGap,
    this.authToken,
    this.returnPrompt = false,
  });

  factory AnalysisRequest.fromJson(Map<String, dynamic> json) =>
      _$AnalysisRequestFromJson(json);
  Map<String, dynamic> toJson() => _$AnalysisRequestToJson(this);
}

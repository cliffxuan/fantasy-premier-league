import 'package:json_annotation/json_annotation.dart';

part 'analysis_response.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class AnalysisResponse {
  final String? immediateAction;
  final Map<String, String>? transferPlan;
  final String? captaincy;
  final String? futureWatch;
  final List<Map<String, dynamic>> squad;
  final String? rawAnalysis;
  final String? generatedPrompt;

  const AnalysisResponse({
    this.immediateAction,
    this.transferPlan,
    this.captaincy,
    this.futureWatch,
    required this.squad,
    this.rawAnalysis,
    this.generatedPrompt,
  });

  factory AnalysisResponse.fromJson(Map<String, dynamic> json) =>
      _$AnalysisResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AnalysisResponseToJson(this);
}

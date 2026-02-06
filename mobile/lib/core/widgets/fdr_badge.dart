import 'package:flutter/material.dart';
import '../utils/fdr_utils.dart';

class FdrBadge extends StatelessWidget {
  final int difficulty;
  final String? label;
  final double width;
  final double height;

  const FdrBadge({
    super.key,
    required this.difficulty,
    this.label,
    this.width = 40,
    this.height = 24,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: fdrColor(difficulty),
        borderRadius: BorderRadius.circular(4),
      ),
      alignment: Alignment.center,
      child: Text(
        label ?? difficulty.toString(),
        style: TextStyle(
          color: fdrTextColor(difficulty),
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

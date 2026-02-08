import 'package:flutter/material.dart';
import '../constants/fpl_constants.dart';

class GameweekSwipeDetector extends StatelessWidget {
  final Widget child;
  final int currentGw;
  final int? maxGw;
  final ValueChanged<int> onChanged;

  const GameweekSwipeDetector({
    super.key,
    required this.child,
    required this.currentGw,
    this.maxGw = FplConstants.maxGameweek,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onHorizontalDragEnd: (details) {
        if (details.primaryVelocity == null) return;

        // Swipe Right -> Previous GW
        if (details.primaryVelocity! > 300) {
          if (currentGw > 1) {
            onChanged(currentGw - 1);
          }
        }
        // Swipe Left -> Next GW
        else if (details.primaryVelocity! < -300) {
          if (currentGw < (maxGw ?? FplConstants.maxGameweek)) {
            onChanged(currentGw + 1);
          }
        }
      },
      child: child,
    );
  }
}

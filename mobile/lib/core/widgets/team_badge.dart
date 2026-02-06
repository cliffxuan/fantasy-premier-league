import 'package:flutter/material.dart';
import '../constants/asset_urls.dart';

class TeamBadge extends StatelessWidget {
  final int teamCode;
  final double size;

  const TeamBadge({super.key, required this.teamCode, this.size = 32});

  @override
  Widget build(BuildContext context) {
    return Image.network(
      AssetUrls.teamBadge(teamCode),
      width: size,
      height: size,
      errorBuilder: (context, error, stackTrace) => SizedBox(
        width: size,
        height: size,
        child: const Icon(Icons.shield_outlined, color: Colors.white24),
      ),
    );
  }
}

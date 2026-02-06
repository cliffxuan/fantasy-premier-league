import 'package:flutter/material.dart';
import '../constants/asset_urls.dart';

class PlayerImage extends StatelessWidget {
  final int playerCode;
  final double size;

  const PlayerImage({super.key, required this.playerCode, this.size = 48});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(size / 2),
      child: Image.network(
        AssetUrls.playerImage(playerCode),
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Image.network(
          AssetUrls.playerImageFallback(playerCode),
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => Container(
            width: size,
            height: size,
            color: Colors.white10,
            child: const Icon(Icons.person, color: Colors.white24),
          ),
        ),
      ),
    );
  }
}

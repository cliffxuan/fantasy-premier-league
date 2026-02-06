class AssetUrls {
  AssetUrls._();

  static const String _plBase =
      'https://resources.premierleague.com/premierleague';

  static const String _plBase25 =
      'https://resources.premierleague.com/premierleague25';

  /// Primary player image URL (premierleague25, no "p" prefix)
  static String playerImage(int code) =>
      '$_plBase25/photos/players/110x140/$code.png';

  /// Fallback player image URL (premierleague, with "p" prefix)
  static String playerImageFallback(int code) =>
      '$_plBase/photos/players/110x140/p$code.png';

  static String teamBadge(int code) =>
      '$_plBase/badges/100/t$code.png';

  static String teamBadgeSmall(int code) =>
      '$_plBase/badges/25/t$code.png';

  static const String defaultPlayerImage =
      '$_plBase/photos/players/110x140/Photo-Missing.png';
}

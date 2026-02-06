// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'player_explorer_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$aggregatedPlayersHash() => r'0ce03dd2af64f2e354cec5edf95c3e074d59b414';

/// See also [aggregatedPlayers].
@ProviderFor(aggregatedPlayers)
final aggregatedPlayersProvider =
    AutoDisposeFutureProvider<List<AggregatedPlayer>>.internal(
      aggregatedPlayers,
      name: r'aggregatedPlayersProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$aggregatedPlayersHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef AggregatedPlayersRef =
    AutoDisposeFutureProviderRef<List<AggregatedPlayer>>;
String _$filteredPlayersHash() => r'16f5a8a775c1425603ac66b27ba8ccdc008c5d6b';

/// See also [filteredPlayers].
@ProviderFor(filteredPlayers)
final filteredPlayersProvider =
    AutoDisposeFutureProvider<List<AggregatedPlayer>>.internal(
      filteredPlayers,
      name: r'filteredPlayersProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$filteredPlayersHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef FilteredPlayersRef =
    AutoDisposeFutureProviderRef<List<AggregatedPlayer>>;
String _$playerSummaryHash() => r'73efdf133a1cc68e6c40deab13918b8cea6c10ff';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

/// See also [playerSummary].
@ProviderFor(playerSummary)
const playerSummaryProvider = PlayerSummaryFamily();

/// See also [playerSummary].
class PlayerSummaryFamily extends Family<AsyncValue<PlayerSummary>> {
  /// See also [playerSummary].
  const PlayerSummaryFamily();

  /// See also [playerSummary].
  PlayerSummaryProvider call(int playerId, {int? opponentId}) {
    return PlayerSummaryProvider(playerId, opponentId: opponentId);
  }

  @override
  PlayerSummaryProvider getProviderOverride(
    covariant PlayerSummaryProvider provider,
  ) {
    return call(provider.playerId, opponentId: provider.opponentId);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'playerSummaryProvider';
}

/// See also [playerSummary].
class PlayerSummaryProvider extends AutoDisposeFutureProvider<PlayerSummary> {
  /// See also [playerSummary].
  PlayerSummaryProvider(int playerId, {int? opponentId})
    : this._internal(
        (ref) => playerSummary(
          ref as PlayerSummaryRef,
          playerId,
          opponentId: opponentId,
        ),
        from: playerSummaryProvider,
        name: r'playerSummaryProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$playerSummaryHash,
        dependencies: PlayerSummaryFamily._dependencies,
        allTransitiveDependencies:
            PlayerSummaryFamily._allTransitiveDependencies,
        playerId: playerId,
        opponentId: opponentId,
      );

  PlayerSummaryProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.playerId,
    required this.opponentId,
  }) : super.internal();

  final int playerId;
  final int? opponentId;

  @override
  Override overrideWith(
    FutureOr<PlayerSummary> Function(PlayerSummaryRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: PlayerSummaryProvider._internal(
        (ref) => create(ref as PlayerSummaryRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        playerId: playerId,
        opponentId: opponentId,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<PlayerSummary> createElement() {
    return _PlayerSummaryProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is PlayerSummaryProvider &&
        other.playerId == playerId &&
        other.opponentId == opponentId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, playerId.hashCode);
    hash = _SystemHash.combine(hash, opponentId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin PlayerSummaryRef on AutoDisposeFutureProviderRef<PlayerSummary> {
  /// The parameter `playerId` of this provider.
  int get playerId;

  /// The parameter `opponentId` of this provider.
  int? get opponentId;
}

class _PlayerSummaryProviderElement
    extends AutoDisposeFutureProviderElement<PlayerSummary>
    with PlayerSummaryRef {
  _PlayerSummaryProviderElement(super.provider);

  @override
  int get playerId => (origin as PlayerSummaryProvider).playerId;
  @override
  int? get opponentId => (origin as PlayerSummaryProvider).opponentId;
}

String _$playerExplorerFiltersHash() =>
    r'd74cd16c61acc4c91271d6059e039c1b65a7c9b5';

/// See also [PlayerExplorerFilters].
@ProviderFor(PlayerExplorerFilters)
final playerExplorerFiltersProvider =
    NotifierProvider<
      PlayerExplorerFilters,
      ({
        int minGw,
        int maxGw,
        String venue,
        int? positionFilter,
        String? search,
      })
    >.internal(
      PlayerExplorerFilters.new,
      name: r'playerExplorerFiltersProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$playerExplorerFiltersHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$PlayerExplorerFilters =
    Notifier<
      ({
        int minGw,
        int maxGw,
        String venue,
        int? positionFilter,
        String? search,
      })
    >;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

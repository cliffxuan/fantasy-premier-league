// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'player_comparison_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$comparisonHistoriesHash() =>
    r'f26fa5e6be24a14d9ce8472174b9a76ae5749bc1';

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

/// See also [comparisonHistories].
@ProviderFor(comparisonHistories)
const comparisonHistoriesProvider = ComparisonHistoriesFamily();

/// See also [comparisonHistories].
class ComparisonHistoriesFamily
    extends Family<AsyncValue<Map<int, List<PlayerHistoryEntry>>>> {
  /// See also [comparisonHistories].
  const ComparisonHistoriesFamily();

  /// See also [comparisonHistories].
  ComparisonHistoriesProvider call(List<int> playerIds) {
    return ComparisonHistoriesProvider(playerIds);
  }

  @override
  ComparisonHistoriesProvider getProviderOverride(
    covariant ComparisonHistoriesProvider provider,
  ) {
    return call(provider.playerIds);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'comparisonHistoriesProvider';
}

/// See also [comparisonHistories].
class ComparisonHistoriesProvider
    extends AutoDisposeFutureProvider<Map<int, List<PlayerHistoryEntry>>> {
  /// See also [comparisonHistories].
  ComparisonHistoriesProvider(List<int> playerIds)
    : this._internal(
        (ref) => comparisonHistories(ref as ComparisonHistoriesRef, playerIds),
        from: comparisonHistoriesProvider,
        name: r'comparisonHistoriesProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$comparisonHistoriesHash,
        dependencies: ComparisonHistoriesFamily._dependencies,
        allTransitiveDependencies:
            ComparisonHistoriesFamily._allTransitiveDependencies,
        playerIds: playerIds,
      );

  ComparisonHistoriesProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.playerIds,
  }) : super.internal();

  final List<int> playerIds;

  @override
  Override overrideWith(
    FutureOr<Map<int, List<PlayerHistoryEntry>>> Function(
      ComparisonHistoriesRef provider,
    )
    create,
  ) {
    return ProviderOverride(
      origin: this,
      override: ComparisonHistoriesProvider._internal(
        (ref) => create(ref as ComparisonHistoriesRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        playerIds: playerIds,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<Map<int, List<PlayerHistoryEntry>>>
  createElement() {
    return _ComparisonHistoriesProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is ComparisonHistoriesProvider && other.playerIds == playerIds;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, playerIds.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin ComparisonHistoriesRef
    on AutoDisposeFutureProviderRef<Map<int, List<PlayerHistoryEntry>>> {
  /// The parameter `playerIds` of this provider.
  List<int> get playerIds;
}

class _ComparisonHistoriesProviderElement
    extends AutoDisposeFutureProviderElement<Map<int, List<PlayerHistoryEntry>>>
    with ComparisonHistoriesRef {
  _ComparisonHistoriesProviderElement(super.provider);

  @override
  List<int> get playerIds => (origin as ComparisonHistoriesProvider).playerIds;
}

String _$playerComparisonSelectionHash() =>
    r'58ec4d6262c368e1596796d241cacc58a755ff11';

/// See also [PlayerComparisonSelection].
@ProviderFor(PlayerComparisonSelection)
final playerComparisonSelectionProvider =
    NotifierProvider<
      PlayerComparisonSelection,
      List<AggregatedPlayer>
    >.internal(
      PlayerComparisonSelection.new,
      name: r'playerComparisonSelectionProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$playerComparisonSelectionHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$PlayerComparisonSelection = Notifier<List<AggregatedPlayer>>;
String _$comparisonModeActiveHash() =>
    r'71b8c916cbd48ed647657d1687b60474d1692447';

/// See also [ComparisonModeActive].
@ProviderFor(ComparisonModeActive)
final comparisonModeActiveProvider =
    NotifierProvider<ComparisonModeActive, bool>.internal(
      ComparisonModeActive.new,
      name: r'comparisonModeActiveProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$comparisonModeActiveHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$ComparisonModeActive = Notifier<bool>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

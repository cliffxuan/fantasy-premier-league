// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fixtures_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$fixturesHash() => r'359bfc4c81d7b8ce9f0de2b051c726e04bd549c2';

/// See also [fixtures].
@ProviderFor(fixtures)
final fixturesProvider = AutoDisposeFutureProvider<List<Fixture>>.internal(
  fixtures,
  name: r'fixturesProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$fixturesHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef FixturesRef = AutoDisposeFutureProviderRef<List<Fixture>>;
String _$fixturesForGwHash() => r'574907d0fa7ebc1fff39321bf72daf761f30b6b1';

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

/// See also [fixturesForGw].
@ProviderFor(fixturesForGw)
const fixturesForGwProvider = FixturesForGwFamily();

/// See also [fixturesForGw].
class FixturesForGwFamily extends Family<AsyncValue<List<Fixture>>> {
  /// See also [fixturesForGw].
  const FixturesForGwFamily();

  /// See also [fixturesForGw].
  FixturesForGwProvider call(int gw) {
    return FixturesForGwProvider(gw);
  }

  @override
  FixturesForGwProvider getProviderOverride(
    covariant FixturesForGwProvider provider,
  ) {
    return call(provider.gw);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'fixturesForGwProvider';
}

/// See also [fixturesForGw].
class FixturesForGwProvider extends AutoDisposeFutureProvider<List<Fixture>> {
  /// See also [fixturesForGw].
  FixturesForGwProvider(int gw)
    : this._internal(
        (ref) => fixturesForGw(ref as FixturesForGwRef, gw),
        from: fixturesForGwProvider,
        name: r'fixturesForGwProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$fixturesForGwHash,
        dependencies: FixturesForGwFamily._dependencies,
        allTransitiveDependencies:
            FixturesForGwFamily._allTransitiveDependencies,
        gw: gw,
      );

  FixturesForGwProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.gw,
  }) : super.internal();

  final int gw;

  @override
  Override overrideWith(
    FutureOr<List<Fixture>> Function(FixturesForGwRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: FixturesForGwProvider._internal(
        (ref) => create(ref as FixturesForGwRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        gw: gw,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<List<Fixture>> createElement() {
    return _FixturesForGwProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is FixturesForGwProvider && other.gw == gw;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, gw.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin FixturesForGwRef on AutoDisposeFutureProviderRef<List<Fixture>> {
  /// The parameter `gw` of this provider.
  int get gw;
}

class _FixturesForGwProviderElement
    extends AutoDisposeFutureProviderElement<List<Fixture>>
    with FixturesForGwRef {
  _FixturesForGwProviderElement(super.provider);

  @override
  int get gw => (origin as FixturesForGwProvider).gw;
}

String _$polymarketDataHash() => r'4c2370a47beb7ca3320e8371eb0979f4c54c1e22';

/// See also [polymarketData].
@ProviderFor(polymarketData)
final polymarketDataProvider =
    AutoDisposeFutureProvider<List<PolymarketMarket>>.internal(
      polymarketData,
      name: r'polymarketDataProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$polymarketDataHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef PolymarketDataRef =
    AutoDisposeFutureProviderRef<List<PolymarketMarket>>;
String _$h2hHistoryHash() => r'dc0ba2ecdb206f70c048cdf54bcdd403d33e9fb6';

/// See also [h2hHistory].
@ProviderFor(h2hHistory)
const h2hHistoryProvider = H2hHistoryFamily();

/// See also [h2hHistory].
class H2hHistoryFamily extends Family<AsyncValue<List<H2hMatch>>> {
  /// See also [h2hHistory].
  const H2hHistoryFamily();

  /// See also [h2hHistory].
  H2hHistoryProvider call(int teamHId, int teamAId) {
    return H2hHistoryProvider(teamHId, teamAId);
  }

  @override
  H2hHistoryProvider getProviderOverride(
    covariant H2hHistoryProvider provider,
  ) {
    return call(provider.teamHId, provider.teamAId);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'h2hHistoryProvider';
}

/// See also [h2hHistory].
class H2hHistoryProvider extends AutoDisposeFutureProvider<List<H2hMatch>> {
  /// See also [h2hHistory].
  H2hHistoryProvider(int teamHId, int teamAId)
    : this._internal(
        (ref) => h2hHistory(ref as H2hHistoryRef, teamHId, teamAId),
        from: h2hHistoryProvider,
        name: r'h2hHistoryProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$h2hHistoryHash,
        dependencies: H2hHistoryFamily._dependencies,
        allTransitiveDependencies: H2hHistoryFamily._allTransitiveDependencies,
        teamHId: teamHId,
        teamAId: teamAId,
      );

  H2hHistoryProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.teamHId,
    required this.teamAId,
  }) : super.internal();

  final int teamHId;
  final int teamAId;

  @override
  Override overrideWith(
    FutureOr<List<H2hMatch>> Function(H2hHistoryRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: H2hHistoryProvider._internal(
        (ref) => create(ref as H2hHistoryRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        teamHId: teamHId,
        teamAId: teamAId,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<List<H2hMatch>> createElement() {
    return _H2hHistoryProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is H2hHistoryProvider &&
        other.teamHId == teamHId &&
        other.teamAId == teamAId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, teamHId.hashCode);
    hash = _SystemHash.combine(hash, teamAId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin H2hHistoryRef on AutoDisposeFutureProviderRef<List<H2hMatch>> {
  /// The parameter `teamHId` of this provider.
  int get teamHId;

  /// The parameter `teamAId` of this provider.
  int get teamAId;
}

class _H2hHistoryProviderElement
    extends AutoDisposeFutureProviderElement<List<H2hMatch>>
    with H2hHistoryRef {
  _H2hHistoryProviderElement(super.provider);

  @override
  int get teamHId => (origin as H2hHistoryProvider).teamHId;
  @override
  int get teamAId => (origin as H2hHistoryProvider).teamAId;
}

// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'squad_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$currentGameweekHash() => r'643438be788f93c7f1931c76fc140c4beac3d434';

/// See also [currentGameweek].
@ProviderFor(currentGameweek)
final currentGameweekProvider =
    AutoDisposeFutureProvider<GameweekStatus>.internal(
      currentGameweek,
      name: r'currentGameweekProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$currentGameweekHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef CurrentGameweekRef = AutoDisposeFutureProviderRef<GameweekStatus>;
String _$squadHash() => r'9ad1e65cdb50af1013745d7ac95992f1a3850ab3';

/// See also [squad].
@ProviderFor(squad)
final squadProvider = AutoDisposeFutureProvider<SquadResponse>.internal(
  squad,
  name: r'squadProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$squadHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef SquadRef = AutoDisposeFutureProviderRef<SquadResponse>;
String _$squadForGameweekHash() => r'175c2cf42ff17be421b8850af8f3bc288400452b';

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

/// See also [squadForGameweek].
@ProviderFor(squadForGameweek)
const squadForGameweekProvider = SquadForGameweekFamily();

/// See also [squadForGameweek].
class SquadForGameweekFamily extends Family<AsyncValue<SquadResponse>> {
  /// See also [squadForGameweek].
  const SquadForGameweekFamily();

  /// See also [squadForGameweek].
  SquadForGameweekProvider call(int? gw) {
    return SquadForGameweekProvider(gw);
  }

  @override
  SquadForGameweekProvider getProviderOverride(
    covariant SquadForGameweekProvider provider,
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
  String? get name => r'squadForGameweekProvider';
}

/// See also [squadForGameweek].
class SquadForGameweekProvider
    extends AutoDisposeFutureProvider<SquadResponse> {
  /// See also [squadForGameweek].
  SquadForGameweekProvider(int? gw)
    : this._internal(
        (ref) => squadForGameweek(ref as SquadForGameweekRef, gw),
        from: squadForGameweekProvider,
        name: r'squadForGameweekProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$squadForGameweekHash,
        dependencies: SquadForGameweekFamily._dependencies,
        allTransitiveDependencies:
            SquadForGameweekFamily._allTransitiveDependencies,
        gw: gw,
      );

  SquadForGameweekProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.gw,
  }) : super.internal();

  final int? gw;

  @override
  Override overrideWith(
    FutureOr<SquadResponse> Function(SquadForGameweekRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: SquadForGameweekProvider._internal(
        (ref) => create(ref as SquadForGameweekRef),
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
  AutoDisposeFutureProviderElement<SquadResponse> createElement() {
    return _SquadForGameweekProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is SquadForGameweekProvider && other.gw == gw;
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
mixin SquadForGameweekRef on AutoDisposeFutureProviderRef<SquadResponse> {
  /// The parameter `gw` of this provider.
  int? get gw;
}

class _SquadForGameweekProviderElement
    extends AutoDisposeFutureProviderElement<SquadResponse>
    with SquadForGameweekRef {
  _SquadForGameweekProviderElement(super.provider);

  @override
  int? get gw => (origin as SquadForGameweekProvider).gw;
}

String _$savedTeamIdHash() => r'08d011e9b0dc039147fb569ae0cba977f6b5f72a';

/// See also [SavedTeamId].
@ProviderFor(SavedTeamId)
final savedTeamIdProvider = NotifierProvider<SavedTeamId, int?>.internal(
  SavedTeamId.new,
  name: r'savedTeamIdProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$savedTeamIdHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$SavedTeamId = Notifier<int?>;
String _$savedAuthTokenHash() => r'02d3032276f7a948c00e3a798351477c7a91a53a';

/// See also [SavedAuthToken].
@ProviderFor(SavedAuthToken)
final savedAuthTokenProvider =
    NotifierProvider<SavedAuthToken, String?>.internal(
      SavedAuthToken.new,
      name: r'savedAuthTokenProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$savedAuthTokenHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$SavedAuthToken = Notifier<String?>;
String _$selectedGameweekHash() => r'406672f10579783681bfa9bcb66466365cd4524b';

/// See also [SelectedGameweek].
@ProviderFor(SelectedGameweek)
final selectedGameweekProvider =
    NotifierProvider<SelectedGameweek, int?>.internal(
      SelectedGameweek.new,
      name: r'selectedGameweekProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$selectedGameweekHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$SelectedGameweek = Notifier<int?>;
String _$analysisStateHash() => r'f4c35348a886f3d079c058db933f89583edc1734';

/// See also [AnalysisState].
@ProviderFor(AnalysisState)
final analysisStateProvider =
    AutoDisposeNotifierProvider<
      AnalysisState,
      AsyncValue<AnalysisResponse?>
    >.internal(
      AnalysisState.new,
      name: r'analysisStateProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$analysisStateHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$AnalysisState = AutoDisposeNotifier<AsyncValue<AnalysisResponse?>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

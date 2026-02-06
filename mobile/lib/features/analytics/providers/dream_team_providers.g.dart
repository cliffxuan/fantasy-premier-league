// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dream_team_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$dreamTeamHash() => r'69e6377f2179da73fea3ccc3da2b2cc7f83c9952';

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

/// See also [dreamTeam].
@ProviderFor(dreamTeam)
const dreamTeamProvider = DreamTeamFamily();

/// See also [dreamTeam].
class DreamTeamFamily extends Family<AsyncValue<DreamTeamResponse>> {
  /// See also [dreamTeam].
  const DreamTeamFamily();

  /// See also [dreamTeam].
  DreamTeamProvider call(int gw) {
    return DreamTeamProvider(gw);
  }

  @override
  DreamTeamProvider getProviderOverride(covariant DreamTeamProvider provider) {
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
  String? get name => r'dreamTeamProvider';
}

/// See also [dreamTeam].
class DreamTeamProvider extends AutoDisposeFutureProvider<DreamTeamResponse> {
  /// See also [dreamTeam].
  DreamTeamProvider(int gw)
    : this._internal(
        (ref) => dreamTeam(ref as DreamTeamRef, gw),
        from: dreamTeamProvider,
        name: r'dreamTeamProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$dreamTeamHash,
        dependencies: DreamTeamFamily._dependencies,
        allTransitiveDependencies: DreamTeamFamily._allTransitiveDependencies,
        gw: gw,
      );

  DreamTeamProvider._internal(
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
    FutureOr<DreamTeamResponse> Function(DreamTeamRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: DreamTeamProvider._internal(
        (ref) => create(ref as DreamTeamRef),
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
  AutoDisposeFutureProviderElement<DreamTeamResponse> createElement() {
    return _DreamTeamProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is DreamTeamProvider && other.gw == gw;
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
mixin DreamTeamRef on AutoDisposeFutureProviderRef<DreamTeamResponse> {
  /// The parameter `gw` of this provider.
  int get gw;
}

class _DreamTeamProviderElement
    extends AutoDisposeFutureProviderElement<DreamTeamResponse>
    with DreamTeamRef {
  _DreamTeamProviderElement(super.provider);

  @override
  int get gw => (origin as DreamTeamProvider).gw;
}

// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

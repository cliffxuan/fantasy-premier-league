// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'club_viewer_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$allTeamsHash() => r'ac1237387270078b78571b3c75b9bdad5637bd78';

/// See also [allTeams].
@ProviderFor(allTeams)
final allTeamsProvider = AutoDisposeFutureProvider<List<Team>>.internal(
  allTeams,
  name: r'allTeamsProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$allTeamsHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef AllTeamsRef = AutoDisposeFutureProviderRef<List<Team>>;
String _$clubSummaryHash() => r'b0433ef40a29a9349c1a6263accb434b981b2e18';

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

/// See also [clubSummary].
@ProviderFor(clubSummary)
const clubSummaryProvider = ClubSummaryFamily();

/// See also [clubSummary].
class ClubSummaryFamily extends Family<AsyncValue<ClubSummary>> {
  /// See also [clubSummary].
  const ClubSummaryFamily();

  /// See also [clubSummary].
  ClubSummaryProvider call(int clubId) {
    return ClubSummaryProvider(clubId);
  }

  @override
  ClubSummaryProvider getProviderOverride(
    covariant ClubSummaryProvider provider,
  ) {
    return call(provider.clubId);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'clubSummaryProvider';
}

/// See also [clubSummary].
class ClubSummaryProvider extends AutoDisposeFutureProvider<ClubSummary> {
  /// See also [clubSummary].
  ClubSummaryProvider(int clubId)
    : this._internal(
        (ref) => clubSummary(ref as ClubSummaryRef, clubId),
        from: clubSummaryProvider,
        name: r'clubSummaryProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$clubSummaryHash,
        dependencies: ClubSummaryFamily._dependencies,
        allTransitiveDependencies: ClubSummaryFamily._allTransitiveDependencies,
        clubId: clubId,
      );

  ClubSummaryProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.clubId,
  }) : super.internal();

  final int clubId;

  @override
  Override overrideWith(
    FutureOr<ClubSummary> Function(ClubSummaryRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: ClubSummaryProvider._internal(
        (ref) => create(ref as ClubSummaryRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        clubId: clubId,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<ClubSummary> createElement() {
    return _ClubSummaryProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is ClubSummaryProvider && other.clubId == clubId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, clubId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin ClubSummaryRef on AutoDisposeFutureProviderRef<ClubSummary> {
  /// The parameter `clubId` of this provider.
  int get clubId;
}

class _ClubSummaryProviderElement
    extends AutoDisposeFutureProviderElement<ClubSummary>
    with ClubSummaryRef {
  _ClubSummaryProviderElement(super.provider);

  @override
  int get clubId => (origin as ClubSummaryProvider).clubId;
}

String _$selectedClubIdHash() => r'8f37c7068e4a1a270167f8fb7eb6cf269459aef3';

/// See also [SelectedClubId].
@ProviderFor(SelectedClubId)
final selectedClubIdProvider = NotifierProvider<SelectedClubId, int?>.internal(
  SelectedClubId.new,
  name: r'selectedClubIdProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$selectedClubIdHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$SelectedClubId = Notifier<int?>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

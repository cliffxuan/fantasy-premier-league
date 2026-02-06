// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'league_table_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$maxGameweekHash() => r'a6b299796f4eeb56b103b240cd1c53869af073af';

/// See also [maxGameweek].
@ProviderFor(maxGameweek)
final maxGameweekProvider = AutoDisposeProvider<int>.internal(
  maxGameweek,
  name: r'maxGameweekProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$maxGameweekHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef MaxGameweekRef = AutoDisposeProviderRef<int>;
String _$leagueTableHash() => r'5f7a54b0f1c00e67e5f2f22348e0b1102a7aad63';

/// See also [leagueTable].
@ProviderFor(leagueTable)
final leagueTableProvider =
    AutoDisposeFutureProvider<List<LeagueTableEntry>>.internal(
      leagueTable,
      name: r'leagueTableProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$leagueTableHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef LeagueTableRef = AutoDisposeFutureProviderRef<List<LeagueTableEntry>>;
String _$gwRangeHash() => r'99256071b7125498917c3372e13a1a7a14a757cd';

/// See also [GwRange].
@ProviderFor(GwRange)
final gwRangeProvider =
    AutoDisposeNotifierProvider<GwRange, RangeValues>.internal(
      GwRange.new,
      name: r'gwRangeProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$gwRangeHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$GwRange = AutoDisposeNotifier<RangeValues>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

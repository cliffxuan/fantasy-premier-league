// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'player_comparison_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$comparisonHistoriesHash() =>
    r'd3c4cb4c04b47b937926553cd01343ff4fb52a4a';

/// See also [comparisonHistories].
@ProviderFor(comparisonHistories)
final comparisonHistoriesProvider =
    AutoDisposeFutureProvider<Map<int, List<PlayerHistoryEntry>>>.internal(
      comparisonHistories,
      name: r'comparisonHistoriesProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$comparisonHistoriesHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef ComparisonHistoriesRef =
    AutoDisposeFutureProviderRef<Map<int, List<PlayerHistoryEntry>>>;
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

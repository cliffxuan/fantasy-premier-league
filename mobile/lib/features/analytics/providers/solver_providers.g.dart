// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'solver_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$advancedFixturesHash() => r'3408bb424de39e1c86ceffb25e03cc6650a74c79';

/// See also [advancedFixtures].
@ProviderFor(advancedFixtures)
final advancedFixturesProvider =
    AutoDisposeFutureProvider<List<FixtureTickerTeam>>.internal(
      advancedFixtures,
      name: r'advancedFixturesProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$advancedFixturesHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef AdvancedFixturesRef =
    AutoDisposeFutureProviderRef<List<FixtureTickerTeam>>;
String _$solverParamsHash() => r'48a81901f7a547f9e22b800110592d3dab4c9392';

/// See also [SolverParams].
@ProviderFor(SolverParams)
final solverParamsProvider =
    NotifierProvider<
      SolverParams,
      ({double budget, bool excludeBench, bool excludeUnavailable, bool useMl})
    >.internal(
      SolverParams.new,
      name: r'solverParamsProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$solverParamsHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$SolverParams =
    Notifier<
      ({double budget, bool excludeBench, bool excludeUnavailable, bool useMl})
    >;
String _$solverResultHash() => r'f797c2eb661790d0b89caff1a5b5ece8ea89fb22';

/// See also [SolverResult].
@ProviderFor(SolverResult)
final solverResultProvider =
    AutoDisposeNotifierProvider<
      SolverResult,
      AsyncValue<SolverResponse?>
    >.internal(
      SolverResult.new,
      name: r'solverResultProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$solverResultHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$SolverResult = AutoDisposeNotifier<AsyncValue<SolverResponse?>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

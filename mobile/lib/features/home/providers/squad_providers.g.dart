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
String _$squadHash() => r'7c29bd75e00194ab759572ee672120b5ac9800ac';

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
String _$savedAuthTokenHash() => r'ee21ce8050cd71daebdbb6e0160f65596abaeed8';

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

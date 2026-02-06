import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../features/analytics/screens/analytics_screen.dart';
import '../../features/analytics/screens/dream_team_screen.dart';
import '../../features/analytics/screens/form_lab_screen.dart';
import '../../features/analytics/screens/solver_screen.dart';
import '../../features/analytics/screens/top_managers_screen.dart';
import '../../features/explore/screens/explore_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/matches/screens/matches_screen.dart';
import '../../features/more/screens/more_screen.dart';
import '../../features/more/screens/league_table_screen.dart';
import '../../features/more/screens/settings_screen.dart';
import '../../shell/scaffold_with_nav.dart';

part 'app_router.g.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

@Riverpod(keepAlive: true)
GoRouter appRouter(Ref ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/home',
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ScaffoldWithNav(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/matches',
                builder: (context, state) => const MatchesScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/explore',
                builder: (context, state) => const ExploreScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/analytics',
                builder: (context, state) => const AnalyticsScreen(),
                routes: [
                  GoRoute(
                    path: 'form-lab',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) => const FormLabScreen(),
                  ),
                  GoRoute(
                    path: 'solver',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) => const SolverScreen(),
                  ),
                  GoRoute(
                    path: 'top-managers',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) => const TopManagersScreen(),
                  ),
                  GoRoute(
                    path: 'dream-team',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) => const DreamTeamScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/more',
                builder: (context, state) => const MoreScreen(),
                routes: [
                  GoRoute(
                    path: 'league-table',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) => const LeagueTableScreen(),
                  ),
                  GoRoute(
                    path: 'settings',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) => const SettingsScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

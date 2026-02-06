import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import 'club_viewer_screen.dart';
import 'player_explorer_screen.dart';

class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Explore'),
          bottom: const TabBar(
            indicatorColor: AppColors.primary,
            labelColor: AppColors.text,
            unselectedLabelColor: AppColors.textMuted,
            tabs: [
              Tab(text: 'Players'),
              Tab(text: 'Clubs'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            PlayerExplorerScreen(),
            ClubViewerScreen(),
          ],
        ),
      ),
    );
  }
}

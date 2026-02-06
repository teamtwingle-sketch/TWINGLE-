import 'package:flutter/material.dart';

class MatchesScreen extends StatelessWidget {
  const MatchesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Matches"), centerTitle: true),
      body: const Center(
        child: Text("Matches coming soon!"),
      ),
    );
  }
}

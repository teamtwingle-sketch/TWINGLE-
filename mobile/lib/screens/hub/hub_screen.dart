import 'package:flutter/material.dart';

class HubScreen extends StatelessWidget {
  const HubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Public Hub"), centerTitle: true),
      body: const Center(
        child: Text("Public Chat Hub coming soon!"),
      ),
    );
  }
}

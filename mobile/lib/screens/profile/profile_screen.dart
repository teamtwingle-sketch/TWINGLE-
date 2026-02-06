import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text("My Profile"),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          )
        ],
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                   CircleAvatar(
                     radius: 50,
                     backgroundImage: NetworkImage(
                       user.photos.isNotEmpty ? (user.photos[0].startsWith('http') ? user.photos[0] : 'http://10.0.2.2:8000${user.photos[0]}') : 'https://via.placeholder.com/150'
                     ),
                   ),
                   const SizedBox(height: 16),
                   Text(
                     user.firstName,
                     style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                   ),
                   Text(user.bio ?? "No bio yet"),
                   const SizedBox(height: 32),
                   const Card(
                     child: Padding(
                       padding: EdgeInsets.all(16.0),
                       child: Text("Edit Profile features coming soon..."),
                     ),
                   )
                ],
              ),
            ),
    );
  }
}

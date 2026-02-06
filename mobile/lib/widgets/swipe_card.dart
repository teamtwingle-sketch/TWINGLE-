import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/user.dart';

class SwipeCard extends StatelessWidget {
  final User user;
  
  const SwipeCard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    // Construct absolute URL helper
    // Assuming api client base url handling, but for images we need absolute mostly
    String getImageUrl(String path) {
       if (path.startsWith('http')) return path;
       // For emulator
       return 'http://10.0.2.2:8000$path'; 
    }

    final imageUrl = user.photos.isNotEmpty 
        ? getImageUrl(user.photos[0]) 
        : 'https://via.placeholder.com/400x600';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            spreadRadius: 2,
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          fit: StackFit.expand,
          children: [
            CachedNetworkImage(
               imageUrl: imageUrl,
               fit: BoxFit.cover,
               placeholder: (context, url) => const Center(child: CircularProgressIndicator()),
               errorWidget: (context, url, error) => const Icon(Icons.error),
            ),
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black87],
                  stops: [0.6, 1.0],
                ),
              ),
            ),
            Positioned(
              bottom: 20,
              left: 20,
              right: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${user.firstName}, ${user.age ?? ""}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (user.district != null)
                    Text(
                      user.district!.toUpperCase(),
                      style: const TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                  const SizedBox(height: 8),
                  if (user.bio != null)
                  Text(
                    user.bio!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

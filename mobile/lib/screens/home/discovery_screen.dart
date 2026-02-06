import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:dio/dio.dart';
import '../../api/client.dart';
import '../../models/user.dart';
import '../../widgets/swipe_card.dart';

class DiscoveryScreen extends StatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  State<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends State<DiscoveryScreen> {
  final CardSwiperController controller = CardSwiperController();
  List<User> users = [];
  bool isLoading = true;
  final ApiClient _client = ApiClient();

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    try {
      final res = await _client.dio.get('/discovery/');
      final List<dynamic> data = res.data;
      setState(() {
        users = data.map((json) => User.fromJson(json)).toList();
        isLoading = false;
      });
    } catch (e) {
      print(e);
      setState(() => isLoading = false);
    }
  }

  Future<bool> _onSwipe(
    int previousIndex,
    int? currentIndex,
    CardSwiperDirection direction,
  ) async {
    final user = users[previousIndex];
    String action = direction == CardSwiperDirection.right ? 'like' : 'dislike';
    
    // Optimistic UI updates, fire and forget (or handle error quietly)
    try {
      await _client.dio.post('/swipe/', data: {
        'target_id': user.id,
        'action': action,
      });
    } catch (e) {
       // Revert or show toast?
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (users.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.sentiment_dissatisfied, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text("No more profiles nearby."),
            TextButton(onPressed: fetchUsers, child: const Text("Refresh"))
          ],
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: CardSwiper(
                controller: controller,
                cardsCount: users.length,
                onSwipe: _onSwipe,
                cardBuilder: (context, index, percentThresholdX, percentThresholdY) {
                  return SwipeCard(user: users[index]);
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  FloatingActionButton(
                    heroTag: "dislike",
                    onPressed: () => controller.swipe(CardSwiperDirection.left),
                    backgroundColor: Colors.white,
                    child: const Icon(Icons.close, color: Colors.red),
                  ),
                  FloatingActionButton(
                    heroTag: "like",
                    onPressed: () => controller.swipe(CardSwiperDirection.right),
                    backgroundColor: Colors.white,
                    child: const Icon(Icons.favorite, color: Colors.green),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

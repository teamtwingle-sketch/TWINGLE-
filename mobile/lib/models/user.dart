class User {
  final int id;
  final String firstName;
  final int? age;
  final String? gender;
  final String? district;
  final String? bio;
  final List<String> photos;
  final List<String> relationshipIntents;

  User({
    required this.id,
    required this.firstName,
    this.age,
    this.gender,
    this.district,
    this.bio,
    required this.photos,
    required this.relationshipIntents,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Helper to fix photo URLs if they are relative
    List<String> parsePhotos(List<dynamic>? list) {
      if (list == null) return [];
      return list.map((e) {
        String url = e is String ? e : (e['image'] ?? '');
        if (url.startsWith('http')) return url;
        // Adjust this if your phone cannot reach localhost directly via relative paths (it can't)
        // Usually the backend serializer returns full absolute URLs if configured correctly,
        // typically user.photos return strings or objects depending on the view.
        // In DiscoveryView it returns strings. In ProfileDetailView it returns objects.
        // We will handle both cases blindly.
        return url; 
      }).toList();
    }
    
    // In some views (Discovery), photos are strings. In others (Profile), they are objects.
    // Discovery: "photos": ["/media/...", "/media/..."]
    // Profile: "photos": [{"id": 1, "image": "/media/..."}]
    
    var photosList = <String>[];
    if (json['photos'] != null) {
      var raw = json['photos'] as List;
      if (raw.isNotEmpty) {
         if (raw[0] is String) {
           photosList = raw.cast<String>();
         } else if (raw[0] is Map) {
           photosList = raw.map((e) => e['image'].toString()).toList();
         }
      }
    }

    return User(
      id: json['id'] ?? json['user_id'] ?? 0,
      firstName: json['first_name'] ?? 'User',
      age: json['age'],
      gender: json['gender'],
      district: json['district'],
      bio: json['bio'],
      photos: photosList,
      relationshipIntents: json['relationship_intents'] != null 
          ? (json['relationship_intents'] as List).map((e) => e.toString()).toList() 
          : [],
    );
  }
}

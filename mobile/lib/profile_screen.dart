import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'login_screen.dart';
import 'jobs_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool isJobSeeker = true;

  // Shared State
  File? _imageFile;
  String? _profilePictureUrl;
  bool _isLoading = false;

  // Job Seeker State
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _bioController = TextEditingController();
  bool _autoApplyEnabled = false;
  final _autoApplyKeywordsController = TextEditingController();
  String? _generatedResume;

  // Employer State
  final _companyNameController = TextEditingController();
  final _websiteController = TextEditingController();

  final ImagePicker _picker = ImagePicker();

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _bioController.dispose();
    _autoApplyKeywordsController.dispose();
    _companyNameController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _imageFile = File(image.path);
      });
    }
  }

  Future<String?> _uploadImage(String token) async {
    if (_imageFile == null) return _profilePictureUrl;

    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('http://13.60.192.118:3001/uploads/profile-picture'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.files.add(await http.MultipartFile.fromPath('file', _imageFile!.path));

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        return data['url'];
      }
    } catch (e) {
      debugPrint("Image upload failed: $e");
    }
    return _profilePictureUrl;
  }

  Future<void> _generateAIResume() async {
    if (_firstNameController.text.isEmpty || _lastNameController.text.isEmpty || _bioController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill First Name, Last Name and Bio first.')));
      return;
    }
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await http.post(
        Uri.parse('http://13.60.192.118:3001/ai/resume/generate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'first_name': _firstNameController.text,
          'last_name': _lastNameController.text,
          'bio': _bioController.text,
          'skills': [],
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        setState(() {
          _generatedResume = data['resume'];
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to generate resume.')));
      }
    } catch (e) {
      debugPrint("AI Generation failed: $e");
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _handleSave() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) return;

      String? uploadedUrl = await _uploadImage(token);

      final endpoint = isJobSeeker ? '/profiles/job-seeker' : '/profiles/employer';
      final payload = isJobSeeker ? {
        'firstName': _firstNameController.text,
        'lastName': _lastNameController.text,
        'bio': _bioController.text,
        'profilePicture': uploadedUrl,
        'autoApplyEnabled': _autoApplyEnabled,
        'autoApplyKeywords': _autoApplyKeywordsController.text.split(',').map((e) => e.trim()).toList(),
      } : {
        'companyName': _companyNameController.text,
        'description': _bioController.text,
        'website': _websiteController.text,
        'profilePicture': uploadedUrl,
      };

      final response = await http.post(
        Uri.parse('http://13.60.192.118:3001$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (!mounted) return;
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const JobsScreen()));
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to save profile.')));
      }
    } catch (e) {
      debugPrint("Save failed: $e");
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topRight,
            radius: 1.5,
            colors: [Color(0xFF120B1C), Color(0xFF0A0A0A)],
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.all(24.0),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back, color: Colors.white70),
                          onPressed: () => Navigator.pop(context),
                        ),
                        IconButton(
                          icon: const Icon(Icons.logout, color: Colors.redAccent),
                          onPressed: () async {
                            final prefs = await SharedPreferences.getInstance();
                            await prefs.remove('token');
                            if (!context.mounted) return;
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (context) => const LoginScreen()),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Complete Your Profile',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        foreground: Paint()
                          ..shader = const LinearGradient(
                            colors: [Color(0xFF6366F1), Color(0xFF00F0FF)],
                          ).createShader(const Rect.fromLTWH(0.0, 0.0, 300.0, 70.0)),
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    // Role Switcher
                    Row(
                      children: [
                        Expanded(
                          child: _RoleButton(
                            title: 'Job Seeker',
                            isSelected: isJobSeeker,
                            onTap: () => setState(() => isJobSeeker = true),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _RoleButton(
                            title: 'Employer',
                            isSelected: !isJobSeeker,
                            onTap: () => setState(() => isJobSeeker = false),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Profile Picture
                    Center(
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: CircleAvatar(
                          radius: 50,
                          backgroundColor: Colors.white.withOpacity(0.1),
                          backgroundImage: _imageFile != null ? FileImage(_imageFile!) : null,
                          child: _imageFile == null
                              ? const Icon(Icons.camera_alt, size: 40, color: Colors.white54)
                              : null,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(child: Text('Tap to upload picture', style: TextStyle(color: Colors.white.withOpacity(0.5)))),
                    const SizedBox(height: 24),
                    
                    // Form Glass Panel
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.03),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            blurRadius: 32,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (isJobSeeker) ...[
                            _buildTextField('First Name', _firstNameController),
                            const SizedBox(height: 16),
                            _buildTextField('Last Name', _lastNameController),
                            const SizedBox(height: 16),
                            _buildTextField('Professional Bio', _bioController, maxLines: 4),
                            
                            const SizedBox(height: 24),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(child: const Text('Enable AI Auto-Apply', style: TextStyle(color: Colors.white))),
                                      Switch(
                                        value: _autoApplyEnabled,
                                        onChanged: (val) => setState(() => _autoApplyEnabled = val),
                                        activeColor: const Color(0xFF00F0FF),
                                      ),
                                    ],
                                  ),
                                  if (_autoApplyEnabled) ...[
                                    const SizedBox(height: 8),
                                    _buildTextField('Keywords (comma separated)', _autoApplyKeywordsController),
                                  ]
                                ],
                              ),
                            ),
                            
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: _isLoading ? null : _generateAIResume,
                              icon: const Icon(Icons.auto_awesome),
                              label: const Text('Generate AI Resume'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.indigoAccent,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                            if (_generatedResume != null) ...[
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.05),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(_generatedResume!, style: const TextStyle(color: Colors.white70, fontSize: 14)),
                              )
                            ],

                          ] else ...[
                            _buildTextField('Company Name', _companyNameController),
                            const SizedBox(height: 16),
                            _buildTextField('Website (Optional)', _websiteController),
                            const SizedBox(height: 16),
                            _buildTextField('Company Description', _bioController, maxLines: 4),
                          ],
                          const SizedBox(height: 32),
                          ElevatedButton(
                            onPressed: _isLoading ? null : _handleSave,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              backgroundColor: const Color(0xFF6366F1),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 8,
                              shadowColor: const Color(0xFF00F0FF).withOpacity(0.6),
                            ),
                            child: _isLoading 
                                ? const CircularProgressIndicator(color: Colors.white)
                                : const Text('Save Profile & Continue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String hint, TextEditingController controller, {int maxLines = 1}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF6366F1)),
        ),
      ),
    );
  }
}

class _RoleButton extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleButton({
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6366F1) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF00F0FF).withOpacity(0.5) : Colors.transparent,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.4), blurRadius: 12)]
              : [],
        ),
        child: Text(
          title,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white.withOpacity(0.5),
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}

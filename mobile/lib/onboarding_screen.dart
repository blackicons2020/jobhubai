import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'seeker_dashboard.dart';
import 'employer_dashboard.dart';
import 'package:image_picker/image_picker.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _currentStep = 1;
  bool _isLoading = true;
  bool _isSaving = false;
  Map<String, dynamic>? _user;
  final ImagePicker _picker = ImagePicker();

  // Seeker State
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _otherNames = TextEditingController();
  final _dateOfBirth = TextEditingController();
  String _gender = '';
  final _phone = TextEditingController();
  final _nationality = TextEditingController();
  String _maritalStatus = '';

  final _headline = TextEditingController();
  final _profession = TextEditingController();
  bool _isSkilledProfessional = false;
  final _skilledProfession = TextEditingController();
  final _summary = TextEditingController();

  final _residenceCountry = TextEditingController();
  final _residenceState = TextEditingController();
  final _residenceCity = TextEditingController();
  final _citizenshipCountry = TextEditingController();
  bool _willingToRelocate = false;

  final _desiredJobTitle = TextEditingController();
  final _preferredIndustry = TextEditingController();
  String _employmentType = '';
  String _workArrangement = '';
  final _expectedSalary = TextEditingController();
  final _availability = TextEditingController();

  // Lists for arrays
  List<Map<String, dynamic>> _education = [];
  List<Map<String, dynamic>> _experience = [];
  List<Map<String, dynamic>> _certificates = [];
  List<Map<String, dynamic>> _achievements = [];
  List<Map<String, dynamic>> _projects = [];

  final _linkedin = TextEditingController();
  final _github = TextEditingController();
  final _website = TextEditingController();

  // Employer State
  final _companyName = TextEditingController();
  final _description = TextEditingController();
  final _industry = TextEditingController();
  final _companySize = TextEditingController();
  final _foundedYear = TextEditingController();

  final _locationCountry = TextEditingController();
  final _locationState = TextEditingController();
  final _locationCity = TextEditingController();

  final _hrContactName = TextEditingController();
  final _hrEmail = TextEditingController();
  final _hrPhone = TextEditingController();

  String? _profilePicUrl;

  @override
  void initState() {
    super.initState();
    _fetchUser();
  }

  Future<void> _fetchUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) {
        Navigator.pop(context);
        return;
      }
      final res = await http.get(
        Uri.parse('http://13.60.192.118:3001/auth/me'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        final userData = jsonDecode(res.body);
        setState(() {
          _user = userData;
          _isLoading = false;
        });
      } else {
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Image selected for upload')));
      // Real upload would go here
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;

    String endpoint = _user!['role'] == 'JOB_SEEKER' ? '/profiles/job-seeker' : '/profiles/employer';
    Map<String, dynamic> payload = {};

    if (_user!['role'] == 'JOB_SEEKER') {
      payload = {
        'firstName': _firstName.text,
        'lastName': _lastName.text,
        'otherNames': _otherNames.text,
        'dateOfBirth': _dateOfBirth.text.isNotEmpty ? '${_dateOfBirth.text}T00:00:00Z' : null,
        'gender': _gender,
        'phone': _phone.text,
        'nationality': _nationality.text,
        'maritalStatus': _maritalStatus,
        'headline': _headline.text,
        'profession': _profession.text,
        'isSkilledProfessional': _isSkilledProfessional,
        'skilledProfession': _skilledProfession.text,
        'summary': _summary.text,
        'residenceCountry': _residenceCountry.text,
        'residenceState': _residenceState.text,
        'residenceCity': _residenceCity.text,
        'citizenshipCountry': _citizenshipCountry.text,
        'willingToRelocate': _willingToRelocate,
        'desiredJobTitle': _desiredJobTitle.text,
        'preferredIndustry': _preferredIndustry.text,
        'employmentType': _employmentType,
        'workArrangement': _workArrangement,
        'expectedSalary': _expectedSalary.text,
        'availability': _availability.text,
        'education': _education,
        'experience': _experience,
        'certificates': _certificates,
        'achievements': _achievements,
        'projects': _projects,
        'socialLinks': {
          'linkedin': _linkedin.text,
          'github': _github.text,
          'website': _website.text,
        },
        'profilePicture': _profilePicUrl ?? '',
        'skills': [],
      };
    } else {
      payload = {
        'companyName': _companyName.text,
        'description': _description.text,
        'industry': _industry.text,
        'companySize': _companySize.text,
        'foundedYear': int.tryParse(_foundedYear.text),
        'locationCountry': _locationCountry.text,
        'locationState': _locationState.text,
        'locationCity': _locationCity.text,
        'hrContactName': _hrContactName.text,
        'hrEmail': _hrEmail.text,
        'hrPhone': _hrPhone.text,
        'profilePicture': _profilePicUrl ?? '',
      };
    }

    try {
      final res = await http.post(
        Uri.parse('http://13.60.192.118:3001$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
        body: jsonEncode(payload),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        if (!mounted) return;
        Navigator.pop(context); // Go back after onboarding
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to save profile')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Widget _buildTextField(TextEditingController ctrl, String label, {int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: ctrl,
        maxLines: maxLines,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
          filled: true,
          fillColor: Colors.white.withOpacity(0.05),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
        ),
      ),
    );
  }

  Widget _buildSeekerSteps() {
    switch (_currentStep) {
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Personal Information', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_firstName, 'First Name'),
            _buildTextField(_lastName, 'Last Name'),
            _buildTextField(_otherNames, 'Other Names (Optional)'),
            _buildTextField(_phone, 'Phone Number'),
            _buildTextField(_nationality, 'Nationality'),
            _buildTextField(_dateOfBirth, 'Date of Birth (YYYY-MM-DD)'),
          ],
        );
      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Professional Details', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_headline, 'Professional Headline (e.g. Senior Software Engineer)'),
            _buildTextField(_profession, 'Primary Profession'),
            _buildTextField(_summary, 'Professional Summary', maxLines: 4),
            Row(
              children: [
                Checkbox(value: _isSkilledProfessional, onChanged: (v) => setState(() => _isSkilledProfessional = v ?? false)),
                const Expanded(child: Text('I am a skilled/trade professional (e.g. Baker, Plumber)', style: TextStyle(color: Colors.white))),
              ],
            ),
            if (_isSkilledProfessional) _buildTextField(_skilledProfession, 'Specify Skill/Trade'),
          ],
        );
      case 3:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Location & Preferences', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_residenceCity, 'Residence City'),
            _buildTextField(_residenceState, 'Residence State'),
            _buildTextField(_residenceCountry, 'Residence Country'),
            _buildTextField(_citizenshipCountry, 'Citizenship Country'),
            Row(
              children: [
                Checkbox(value: _willingToRelocate, onChanged: (v) => setState(() => _willingToRelocate = v ?? false)),
                const Expanded(child: Text('Willing to relocate', style: TextStyle(color: Colors.white))),
              ],
            ),
          ],
        );
      case 4:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Job Preferences', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_desiredJobTitle, 'Desired Job Title'),
            _buildTextField(_preferredIndustry, 'Preferred Industry'),
            _buildTextField(_expectedSalary, 'Expected Salary'),
            _buildTextField(_availability, 'Availability (e.g. Immediately)'),
          ],
        );
      case 5:
      case 6:
      case 7:
        // Combined Arrays for brevity in mobile
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(_currentStep == 5 ? 'Education' : _currentStep == 6 ? 'Experience' : 'Projects & Certs', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 16),
            const Text('Please add these details on the Web platform for now.', style: TextStyle(color: Colors.white70)),
          ],
        );
      case 8:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Social Links & Photo', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_linkedin, 'LinkedIn URL'),
            _buildTextField(_github, 'GitHub URL'),
            _buildTextField(_website, 'Personal Website'),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: _pickImage,
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Colors.white.withOpacity(0.1),
                child: const Icon(Icons.camera_alt, size: 40, color: Colors.white),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Tap to upload', textAlign: TextAlign.center, style: TextStyle(color: Colors.white54)),
          ],
        );
      default:
        return Container();
    }
  }

  Widget _buildEmployerSteps() {
    switch (_currentStep) {
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Company Details', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_companyName, 'Company Name'),
            _buildTextField(_description, 'Description', maxLines: 4),
            _buildTextField(_industry, 'Industry'),
            _buildTextField(_companySize, 'Company Size (e.g. 10-50)'),
            _buildTextField(_foundedYear, 'Founded Year'),
          ],
        );
      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Location & Contact', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_locationCity, 'City / Town'),
            _buildTextField(_locationState, 'State'),
            _buildTextField(_locationCountry, 'Country'),
            const SizedBox(height: 16),
            _buildTextField(_hrContactName, 'HR Contact Name'),
            _buildTextField(_hrEmail, 'HR Email'),
            _buildTextField(_hrPhone, 'HR Phone'),
          ],
        );
      case 3:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Company Logo', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: _pickImage,
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Colors.white.withOpacity(0.1),
                child: const Icon(Icons.camera_alt, size: 40, color: Colors.white),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Tap to upload', textAlign: TextAlign.center, style: TextStyle(color: Colors.white54)),
          ],
        );
      default:
        return Container();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(backgroundColor: Color(0xFF120B1C), body: Center(child: CircularProgressIndicator()));
    }

    int maxSteps = _user!['role'] == 'JOB_SEEKER' ? 8 : 3;

    return Scaffold(
      backgroundColor: const Color(0xFF120B1C),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Step $_currentStep of $maxSteps', style: TextStyle(color: Colors.white.withOpacity(0.5))),
              const SizedBox(height: 24),
              Expanded(
                child: SingleChildScrollView(
                  child: _user!['role'] == 'JOB_SEEKER' ? _buildSeekerSteps() : _buildEmployerSteps(),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentStep > 1)
                    TextButton(
                      onPressed: () => setState(() => _currentStep--),
                      child: const Text('Back', style: TextStyle(color: Colors.white)),
                    )
                  else
                    const SizedBox.shrink(),
                  
                  if (_currentStep < maxSteps)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00F0FF)),
                      onPressed: () => setState(() => _currentStep++),
                      child: const Text('Next', style: TextStyle(color: Colors.black)),
                    )
                  else
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
                      onPressed: _isSaving ? null : _saveProfile,
                      child: _isSaving ? const CircularProgressIndicator(color: Colors.white) : const Text('Complete', style: TextStyle(color: Colors.white)),
                    ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}

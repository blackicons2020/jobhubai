import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ResumeService {
  final String baseUrl = 'http://localhost:3000/api'; // adjust for production

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<List<dynamic>> getResumes() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/resumes'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load resumes');
  }

  Future<Map<String, dynamic>> parseResume(String filePath) async {
    final token = await _getToken();
    var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/resumes/parse'));
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath('file', filePath));
    
    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to parse resume');
  }

  Future<void> exportPdf(String id) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/resumes/$id/export/pdf'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 201 || response.statusCode == 200) {
      // In a real app, save response.bodyBytes to a file using path_provider
      print("PDF Exported successfully. Size: ${response.bodyBytes.length} bytes.");
    } else {
      throw Exception('Failed to export PDF');
    }
  }
}

import os
import google.generativeai as genai

# We initialize the Gemini client here. Ensure GEMINI_API_KEY is in your .env
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_resume(profile: dict) -> str:
    """
    Takes a job seeker profile dictionary and uses Google Gemini to generate a professional resume.
    """
    if not api_key:
        return "[MOCK RESUME] - Please provide a GEMINI_API_KEY in .env to enable real AI generation."

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are an expert career coach and resume writer. 
    Create a highly professional, formatted resume for the following individual.
    
    Name: {profile.get('first_name')} {profile.get('last_name')}
    Bio: {profile.get('bio')}
    Skills: {', '.join(profile.get('skills', []))}
    
    Output the resume in clean Markdown format. Include sections for Summary, Skills, and mock Professional Experience (leave placeholders for dates/companies if they are missing).
    """
    
    response = model.generate_content(prompt)
    return response.text

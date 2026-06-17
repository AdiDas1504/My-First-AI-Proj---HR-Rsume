# JobFit AI Resume Tailor

JobFit AI Resume Tailor is an AI-powered tool for job candidates.

The system helps candidates upload their resume, provide a specific job posting, understand how well they match the job requirements, and generate an improved resume version tailored to that role.

## Target User

The end user is the job candidate.

The candidate should not need to manually copy and paste long texts. The system should allow the candidate to provide information in a simple way:

- Upload a resume as PDF or Word
- Provide a job posting through a link
- Upload a screenshot or image of the job posting
- Upload a job description file if available

## Main Features

- Upload a resume file
- Extract text from PDF and Word resumes
- Accept job requirements from a URL, image, PDF, or Word file
- Extract key job requirements
- Analyze the match between the resume and the job
- Generate a candidate summary
- Identify strengths, gaps, and missing keywords
- Recommend resume improvements
- Generate a tailored resume version
- Avoid fabricating false skills, experience, education, or achievements

## Important Principle

The system must not invent information.

It can only rewrite, reorganize, and emphasize information that already exists in the candidate's resume.

If the job requires something that does not appear in the resume, the system should flag it as missing and suggest that the candidate add it only if it is true.

## Planned Input Types

### Resume Input

- PDF resume
- Word resume

### Job Posting Input

- Job posting URL
- Screenshot or image of the job posting
- PDF job description
- Word job description

## Planned Output

The system should return:

- Fit score
- Candidate summary
- Relevant experience
- Matched requirements
- Missing or weak requirements
- Suggested improvements
- Tailored resume text
- Downloadable improved resume file

## Learning Goals

Through this project, I will learn:

- Git and GitHub
- Python basics
- Project structure
- Reading PDF and Word files
- Extracting text from images using OCR
- Working with URLs and web content
- Prompt engineering
- AI API integration
- Resume analysis
- Building a simple user interface
- Generating Word or PDF output files
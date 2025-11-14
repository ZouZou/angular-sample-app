# Course Content Files

This directory contains detailed content for each course, including:
- Sections
- Lessons
- Quizzes
- Quiz Questions and Options

## File Structure

Each course content file should follow this structure:

```json
{
  "sections": [
    {
      "title": "Section Title",
      "description": "Section description",
      "order": 1,
      "lessons": [
        {
          "title": "Lesson Title",
          "description": "Lesson description",
          "type": "video|text|quiz|assignment",
          "duration": 30,
          "order": 1,
          "videoUrl": "https://...",
          "content": "HTML content for text lessons"
        }
      ]
    }
  ],
  "quizzes": [
    {
      "title": "Quiz Title",
      "description": "Quiz description",
      "passingScore": 70,
      "timeLimit": 30,
      "questions": [
        {
          "question": "Question text",
          "type": "multiple-choice|true-false|short-answer",
          "points": 10,
          "order": 1,
          "options": [
            {
              "text": "Option text",
              "isCorrect": true,
              "order": 1
            }
          ],
          "explanation": "Explanation of the correct answer"
        }
      ]
    }
  ]
}
```

## Adding New Courses

1. Create a new JSON file in this directory (e.g., `my-course-content.json`)
2. Add the course metadata to `../courses.json`
3. Reference the content file in the course's `contentFile` property
4. The seeder will automatically load and process the content

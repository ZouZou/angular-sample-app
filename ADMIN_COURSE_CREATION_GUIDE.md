# Admin Course Creation Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
4. [Creating a New Course](#creating-a-new-course)
5. [Adding Course Content (Sections & Lessons)](#adding-course-content-sections--lessons)
6. [Creating and Adding Quizzes](#creating-and-adding-quizzes)
7. [Publishing Your Course](#publishing-your-course)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

This guide provides step-by-step instructions for administrators and instructors on how to create a complete course in the Angular Learning Management System, including course content and quizzes.

**What you'll learn:**
- How to create a course with basic information
- How to organize content into sections and lessons
- How to create quizzes with multiple question types
- How to link quizzes to course lessons
- Best practices for course creation

---

## Prerequisites

### Required Access
- **Admin or Instructor account** with appropriate permissions
- Login credentials for the system

### Test Credentials
For testing purposes, you can use:
- **Admin Account**
  - Email: `admin@example.com`
  - Password: `admin123`
  - Full access to all features

- **Instructor Account**
  - Email: `instructor@example.com`
  - Password: `instructor123`
  - Can create and manage courses

### Required Information
Before starting, prepare:
- Course title and description
- Instructor name
- Course category (e.g., Programming, Data Science, Web Development)
- Difficulty level (Beginner, Intermediate, or Advanced)
- Duration estimate (in hours)
- Pricing information
- Thumbnail image URL (optional)
- Course content outline (sections and lessons)
- Quiz questions with answers

---

## Accessing the Admin Dashboard

### Step 1: Login to the System
1. Navigate to the application URL
2. Click the **"Login"** button in the navigation bar
3. Enter your admin or instructor credentials
4. Click **"Sign In"**

### Step 2: Navigate to Admin Dashboard
1. After logging in, click on your username in the top-right corner
2. Select **"Admin Dashboard"** from the dropdown menu
   - **URL**: `/admin`
   - Only visible to users with admin or instructor roles

### Step 3: Access Course Management
1. In the Admin Dashboard, you'll see three tabs:
   - **User Management** - Manage users and roles
   - **Quiz Results** - View student quiz attempts
   - **Course Management** - Create and manage courses ← Select this tab

2. The Course Management tab displays:
   - All existing courses in a grid layout
   - **"Create Course"** button at the top
   - Course cards showing title, instructor, description, enrollments, and ratings
   - Edit and View buttons for each course

---

## Creating a New Course

### Step 1: Start Course Creation
1. In the Course Management tab, click the **"Create Course"** button
2. You'll be redirected to the course creation form at `/courses/new`

### Step 2: Fill in Course Information

#### Required Fields

**Course Title** (Required)
- Enter a clear, descriptive title (3-100 characters)
- Example: "Angular - The Complete Guide (2025 Edition)"
- **Validation**: Must be between 3-100 characters

**Description** (Required)
- Provide a comprehensive course overview (10-1000 characters)
- Include what students will learn
- Mention prerequisites if any
- Highlight key features or benefits
- **Validation**: Must be between 10-1000 characters

**Instructor Name** (Required)
- Enter the instructor's full name (2-100 characters)
- Example: "Dr. Jane Smith"
- **Validation**: Must be between 2-100 characters

**Category** (Required)
- Select from dropdown options:
  - Programming
  - Data Science
  - Web Development
  - Mobile Development
  - DevOps
  - Cloud Computing
  - Machine Learning
  - Database
  - Security
  - Design
  - Other

**Level** (Required)
- Select difficulty level:
  - **Beginner**: For students with no prior experience
  - **Intermediate**: Requires some foundational knowledge
  - **Advanced**: For experienced learners

**Duration** (Required)
- Enter estimated course duration in hours
- Example: 25 (for a 25-hour course)
- **Validation**: Must be a positive number

**Price** (Required)
- Enter course price in USD
- Example: 99.99
- Use 0 for free courses
- **Validation**: Must be a non-negative number

#### Optional Fields

**Thumbnail URL** (Optional)
- Enter a valid URL to the course thumbnail image
- Recommended size: 300x200 pixels
- Example: `https://example.com/images/course-thumbnail.jpg`
- **Validation**: Must be a valid URL format if provided
- Leave empty if not available

### Step 3: Submit the Course
1. Review all entered information for accuracy
2. Click the **"Save Course"** button
3. The system will:
   - Validate all fields
   - Display a spinner while saving
   - Show success message upon completion
   - Redirect to the course list

4. If there are validation errors:
   - Error messages will appear below each problematic field
   - Fix the errors and try again

### Step 4: Note Your Course ID
- After creation, note the course ID from the URL or course list
- You'll need this ID for adding content and quizzes
- The ID is displayed in the course card and URL

---

## Adding Course Content (Sections & Lessons)

### Course Content Structure

Courses are organized hierarchically:
```
Course
  ├── Section 1
  │   ├── Lesson 1 (Video)
  │   ├── Lesson 2 (Text)
  │   ├── Lesson 3 (Quiz)
  │   └── Lesson 4 (Assignment)
  ├── Section 2
  │   ├── Lesson 1 (Video)
  │   └── Lesson 2 (Quiz)
  └── Section 3
      └── ...
```

### Section Creation

Currently, sections are created programmatically using the Curriculum Service API. Here's how to structure your content:

#### Section Model
```typescript
{
  courseId: number,        // The ID of your course
  title: string,           // Section title (e.g., "Getting Started")
  description: string,     // Section overview (optional)
  order: number,          // Display order (1, 2, 3, etc.)
  lessons: []             // Will be populated with lessons
}
```

#### API Endpoint for Section Creation
```
POST /api/curriculum/sections
Authorization: Bearer <your-auth-token>

Request Body:
{
  "courseId": 1,
  "title": "Introduction to Angular",
  "description": "Learn the basics of Angular framework",
  "order": 1
}

Response:
{
  "id": 1,
  "courseId": 1,
  "title": "Introduction to Angular",
  "description": "Learn the basics of Angular framework",
  "order": 1,
  "lessons": []
}
```

#### Example Section Structure
```json
[
  {
    "title": "Getting Started",
    "description": "Introduction and setup",
    "order": 1
  },
  {
    "title": "Core Concepts",
    "description": "Understanding fundamental concepts",
    "order": 2
  },
  {
    "title": "Advanced Topics",
    "description": "Deep dive into advanced features",
    "order": 3
  }
]
```

### Lesson Creation

Lessons belong to sections and have different types:

#### Lesson Types
1. **Video** - Video-based content
2. **Text** - Reading material or articles
3. **Quiz** - Assessment with questions
4. **Assignment** - Practical exercises

#### Lesson Model
```typescript
{
  sectionId: number,      // Parent section ID
  title: string,          // Lesson title
  description: string,    // Lesson overview (optional)
  order: number,          // Order within the section
  type: 'video' | 'text' | 'quiz' | 'assignment',
  duration: number,       // Duration in minutes (optional)
  content: string,        // Text content (for text type)
  videoUrl: string,       // Video URL (for video type)
  quizId: number         // Quiz ID (for quiz type)
}
```

#### API Endpoint for Lesson Creation
```
POST /api/curriculum/lessons
Authorization: Bearer <your-auth-token>

Request Body (Video Lesson):
{
  "sectionId": 1,
  "title": "Introduction to Components",
  "description": "Learn about Angular components",
  "order": 1,
  "type": "video",
  "duration": 15,
  "videoUrl": "https://youtube.com/embed/abc123"
}

Request Body (Text Lesson):
{
  "sectionId": 1,
  "title": "Angular Architecture",
  "description": "Understanding Angular's architecture",
  "order": 2,
  "type": "text",
  "duration": 10,
  "content": "<h2>Angular Architecture</h2><p>Angular is built on...</p>"
}

Request Body (Quiz Lesson):
{
  "sectionId": 1,
  "title": "Section 1 Quiz",
  "description": "Test your knowledge",
  "order": 3,
  "type": "quiz",
  "duration": 10,
  "quizId": 1
}
```

#### Example Lesson Creation Process

**For Video Lessons:**
```json
{
  "sectionId": 1,
  "title": "What is Angular?",
  "description": "Overview of the Angular framework",
  "order": 1,
  "type": "video",
  "duration": 12,
  "videoUrl": "https://www.youtube.com/embed/video-id"
}
```

**For Text Lessons:**
```json
{
  "sectionId": 1,
  "title": "Angular CLI Commands",
  "description": "Essential CLI commands reference",
  "order": 2,
  "type": "text",
  "duration": 5,
  "content": "<h3>Common Commands</h3><ul><li>ng new</li><li>ng serve</li></ul>"
}
```

#### Video URL Requirements
- Use embeddable video URLs (e.g., YouTube embed format)
- Format: `https://www.youtube.com/embed/VIDEO_ID`
- The system sanitizes URLs for security
- Test video URLs before adding them

#### Text Content Guidelines
- Can include HTML formatting
- Supported tags: headings, paragraphs, lists, bold, italic, links
- Keep content concise and focused
- Break long content into multiple lessons

### Reordering Content

Sections and lessons can be reordered:

#### Reorder Sections
```
PUT /api/curriculum/sections/reorder
Authorization: Bearer <your-auth-token>

Request Body:
{
  "courseId": 1,
  "sectionIds": [3, 1, 2]  // New order of section IDs
}
```

#### Reorder Lessons
```
PUT /api/curriculum/lessons/reorder
Authorization: Bearer <your-auth-token>

Request Body:
{
  "sectionId": 1,
  "lessonIds": [4, 2, 1, 3]  // New order of lesson IDs
}
```

---

## Creating and Adding Quizzes

### Quiz Structure Overview

Quizzes consist of:
- **Quiz metadata** (title, description, passing score, time limit)
- **Questions** with various types
- **Options** for each question
- **Correct answers** marked appropriately

### Quiz Model Structure
```typescript
{
  courseId: number,           // Your course ID
  lessonId: number,           // Associated lesson ID (optional)
  title: string,              // Quiz title
  description: string,        // Quiz overview
  passingScore: number,       // Minimum percentage to pass (0-100)
  timeLimit: number,          // Time limit in minutes (optional)
  questions: [...]            // Array of quiz questions
}
```

### Step 1: Plan Your Quiz

Before creating a quiz, prepare:
1. **Quiz title** - Clear and descriptive
2. **Passing score** - Typically 70% or higher
3. **Time limit** - Based on question count (usually 1-2 minutes per question)
4. **Questions** - At least 5 questions recommended
5. **Question types** - Mix of multiple-choice, true/false, multi-select

### Step 2: Create Quiz Questions

#### Question Types Supported

**1. Multiple Choice (single answer)**
- Type: `'multiple-choice'`
- Student selects ONE correct answer
- Use for questions with a single correct answer

**2. True/False**
- Type: `'true-false'`
- Two options: True and False
- Use for statement validation questions

**3. Multi-Select (multiple answers)**
- Type: `'multi-select'`
- Student can select MULTIPLE correct answers
- Use for questions with multiple correct answers

#### Question Model
```typescript
{
  question: string,              // The question text
  type: 'multiple-choice' | 'true-false' | 'multi-select',
  order: number,                 // Question order (1, 2, 3...)
  points: number,                // Points for this question
  explanation: string,           // Explanation shown after answer (optional)
  options: [...]                 // Array of answer options
}
```

#### Option Model
```typescript
{
  text: string,                  // Option text
  isCorrect: boolean,            // Whether this is a correct answer
  order: number                  // Option order (1, 2, 3...)
}
```

### Step 3: Create the Quiz via API

#### API Endpoint
```
POST /api/quizzes
Authorization: Bearer <your-auth-token>

Request Body:
{
  "courseId": 1,
  "title": "Section 1 Knowledge Check",
  "description": "Test your understanding of basic concepts",
  "passingScore": 70,
  "timeLimit": 10,
  "questions": [
    {
      "question": "What is Angular?",
      "type": "multiple-choice",
      "order": 1,
      "points": 10,
      "explanation": "Angular is a TypeScript-based web application framework",
      "options": [
        {
          "text": "A JavaScript library",
          "isCorrect": false,
          "order": 1
        },
        {
          "text": "A TypeScript-based framework",
          "isCorrect": true,
          "order": 2
        },
        {
          "text": "A CSS framework",
          "isCorrect": false,
          "order": 3
        },
        {
          "text": "A database system",
          "isCorrect": false,
          "order": 4
        }
      ]
    },
    {
      "question": "Angular uses TypeScript",
      "type": "true-false",
      "order": 2,
      "points": 5,
      "explanation": "Yes, Angular is built with and primarily uses TypeScript",
      "options": [
        {
          "text": "True",
          "isCorrect": true,
          "order": 1
        },
        {
          "text": "False",
          "isCorrect": false,
          "order": 2
        }
      ]
    },
    {
      "question": "Which are core features of Angular? (Select all that apply)",
      "type": "multi-select",
      "order": 3,
      "points": 15,
      "explanation": "Components, Services, and Dependency Injection are all core Angular features",
      "options": [
        {
          "text": "Components",
          "isCorrect": true,
          "order": 1
        },
        {
          "text": "Services",
          "isCorrect": true,
          "order": 2
        },
        {
          "text": "jQuery plugins",
          "isCorrect": false,
          "order": 3
        },
        {
          "text": "Dependency Injection",
          "isCorrect": true,
          "order": 4
        }
      ]
    }
  ]
}

Response:
{
  "id": 1,
  "courseId": 1,
  "title": "Section 1 Knowledge Check",
  "passingScore": 70,
  "timeLimit": 10,
  "questions": [...]
}
```

### Step 4: Link Quiz to Lesson

After creating the quiz:
1. Note the quiz ID from the response
2. Create or update a lesson with `type: "quiz"` and the `quizId`

```
POST /api/curriculum/lessons

{
  "sectionId": 1,
  "title": "Section 1 Quiz",
  "description": "Test your knowledge of the section",
  "order": 5,
  "type": "quiz",
  "duration": 10,
  "quizId": 1
}
```

### Quiz Best Practices

#### Question Guidelines
1. **Clarity** - Write clear, unambiguous questions
2. **Length** - Keep questions concise (1-2 sentences)
3. **Difficulty** - Mix easy, medium, and hard questions
4. **Relevance** - Only test content covered in the course
5. **Feedback** - Provide helpful explanations for learning

#### Answer Options
1. **Plausible Distractors** - Wrong answers should be reasonable
2. **Consistent Length** - Keep options similar in length
3. **No Giveaways** - Avoid patterns like "all of the above"
4. **Random Order** - Options are displayed in specified order

#### Points Distribution
- **Easy questions**: 5-10 points
- **Medium questions**: 10-15 points
- **Hard questions**: 15-20 points
- Total points should be divisible by 10 for clean percentages

#### Time Limits
- **5 questions**: 5-10 minutes
- **10 questions**: 10-15 minutes
- **20 questions**: 20-30 minutes
- Add buffer time for reading and thinking

### Example Quiz Templates

#### Beginner Quiz Template
```json
{
  "courseId": 1,
  "title": "Getting Started Quiz",
  "description": "Test your basic understanding",
  "passingScore": 60,
  "timeLimit": 10,
  "questions": [
    {
      "question": "What is the purpose of [concept]?",
      "type": "multiple-choice",
      "order": 1,
      "points": 10,
      "options": [...]
    }
  ]
}
```

#### Advanced Quiz Template
```json
{
  "courseId": 1,
  "title": "Advanced Concepts Assessment",
  "description": "Challenge your expertise",
  "passingScore": 80,
  "timeLimit": 20,
  "questions": [
    {
      "question": "Which techniques optimize [scenario]? (Select all)",
      "type": "multi-select",
      "order": 1,
      "points": 20,
      "options": [...]
    }
  ]
}
```

---

## Publishing Your Course

### Course Status and Visibility

The course system includes a `published` field in the course model:
```typescript
{
  published?: boolean  // Controls course visibility
}
```

### Making Your Course Live

#### Update Course to Published
```
PUT /api/courses/:courseId

Request Body:
{
  "published": true
}
```

### Pre-Publishing Checklist

Before publishing your course, ensure:

#### Content Completeness
- [ ] All course information fields are filled
- [ ] Course has a clear, descriptive title
- [ ] Description is comprehensive and engaging
- [ ] Thumbnail image is set (if available)
- [ ] Appropriate category and level are selected
- [ ] Accurate duration is specified

#### Course Structure
- [ ] At least 3-5 sections created
- [ ] Each section has 3-5 lessons minimum
- [ ] Lessons are in logical order
- [ ] Mix of content types (video, text, quiz)
- [ ] Clear progression from basic to advanced

#### Content Quality
- [ ] All video URLs are working
- [ ] Videos are embeddable and accessible
- [ ] Text content is well-formatted
- [ ] No spelling or grammatical errors
- [ ] Content is accurate and up-to-date

#### Quizzes
- [ ] At least one quiz per section
- [ ] Each quiz has 5+ questions
- [ ] Questions have correct answers marked
- [ ] All options are properly filled
- [ ] Explanations are provided
- [ ] Passing score is reasonable (60-80%)
- [ ] Time limits are appropriate

#### Testing
- [ ] Enroll as a student (test account)
- [ ] Complete at least one lesson
- [ ] Take at least one quiz
- [ ] Verify video playback
- [ ] Test progress tracking
- [ ] Verify quiz grading works correctly

### Post-Publishing

After publishing:
1. **Monitor Enrollments** - Track student registrations
2. **Check Quiz Results** - Review performance in admin dashboard
3. **Gather Feedback** - Pay attention to ratings and comments
4. **Update Content** - Fix issues and improve content as needed

---

## Best Practices

### Course Design

#### Structure Your Course Effectively
1. **Start with an Introduction**
   - Course overview lesson
   - Prerequisites and setup instructions
   - What students will learn

2. **Logical Progression**
   - Build on previous concepts
   - Move from basic to advanced
   - Group related topics together

3. **Balance Content Types**
   - Mix videos, text, and quizzes
   - Video for demonstrations
   - Text for references and deep dives
   - Quizzes for knowledge checks

4. **Section Organization**
   - 3-7 sections per course
   - 3-8 lessons per section
   - Each section covers one major topic
   - Include a quiz at the end of each section

### Content Creation

#### Video Content
- **Length**: Keep videos 5-15 minutes
- **Quality**: Use clear audio and video
- **Engagement**: Include visuals and examples
- **Accessibility**: Add captions when possible

#### Text Content
- **Formatting**: Use headings, lists, and emphasis
- **Clarity**: Write in simple, direct language
- **Examples**: Include code snippets and examples
- **Resources**: Link to additional materials

#### Assessments
- **Frequency**: Quiz after each major section
- **Difficulty**: Match the content level
- **Variety**: Use different question types
- **Feedback**: Provide explanations for all answers

### Technical Best Practices

#### Performance
1. **Optimize Images**
   - Use appropriate image sizes
   - Compress thumbnails and banners
   - Use CDN for hosting when possible

2. **Video Hosting**
   - Use reliable video platforms (YouTube, Vimeo)
   - Ensure videos are set to "unlisted" or "public"
   - Test embed URLs before adding

3. **Content Loading**
   - Keep text content reasonable in size
   - Break large content into multiple lessons
   - Use pagination for long content

#### SEO and Discoverability
1. **Course Title**
   - Include main topic keywords
   - Be specific and descriptive
   - Mention skill level if relevant

2. **Description**
   - First sentence is crucial
   - Include relevant keywords naturally
   - Highlight unique value proposition

3. **Categories**
   - Choose the most specific category
   - Consider your target audience
   - Be consistent with similar courses

### Accessibility

1. **Video Content**
   - Provide transcripts or captions
   - Ensure good audio quality
   - Describe visual elements verbally

2. **Text Content**
   - Use clear headings hierarchy
   - Maintain good contrast ratios
   - Use descriptive link text

3. **Quizzes**
   - Allow sufficient time limits
   - Use clear, simple language
   - Avoid time pressure for complex questions

### Student Engagement

1. **Interactive Elements**
   - Include hands-on exercises
   - Provide downloadable resources
   - Encourage practice and experimentation

2. **Progress Tracking**
   - Set clear milestones
   - Celebrate completion with quizzes
   - Show progress throughout the course

3. **Feedback Opportunities**
   - Monitor quiz performance
   - Respond to student questions
   - Update content based on feedback

---

## Troubleshooting

### Common Issues and Solutions

#### Course Creation Problems

**Issue**: "Validation error" when creating course
- **Solution**: Check that all required fields are filled
- **Solution**: Verify field length requirements (title 3-100 chars, description 10-1000 chars)
- **Solution**: Ensure price and duration are positive numbers
- **Solution**: Verify thumbnail URL format if provided

**Issue**: "Unauthorized" error when creating course
- **Solution**: Verify you're logged in with admin or instructor account
- **Solution**: Check your session hasn't expired (login again)
- **Solution**: Confirm your account has course creation permissions

**Issue**: Course not appearing in the course list
- **Solution**: Refresh the page
- **Solution**: Check if you're viewing the correct category
- **Solution**: Verify the course was successfully created (check network response)

#### Content Issues

**Issue**: Section or lesson not saving
- **Solution**: Ensure course ID is correct
- **Solution**: Verify order numbers are positive integers
- **Solution**: Check that required fields (title, order) are provided
- **Solution**: Verify authentication token is valid

**Issue**: Video not displaying in lesson
- **Solution**: Verify video URL is in embed format (YouTube: `/embed/VIDEO_ID`)
- **Solution**: Check video is publicly accessible or unlisted
- **Solution**: Test video URL directly in browser
- **Solution**: Ensure video hasn't been deleted or made private

**Issue**: Text formatting not working
- **Solution**: Check HTML tags are properly closed
- **Solution**: Verify allowed HTML tags are used
- **Solution**: Escape special characters if needed

**Issue**: Lessons appearing in wrong order
- **Solution**: Check order numbers for each lesson
- **Solution**: Use reorder API to fix sequence
- **Solution**: Ensure order numbers are sequential (1, 2, 3, etc.)

#### Quiz Problems

**Issue**: Quiz not saving
- **Solution**: Verify all questions have at least 2 options
- **Solution**: Ensure at least one option is marked correct
- **Solution**: Check that all required fields are filled
- **Solution**: Verify total points add up correctly

**Issue**: "No correct answer" error
- **Solution**: Make sure at least one option has `isCorrect: true`
- **Solution**: For multi-select, mark all correct options
- **Solution**: For true/false, ensure one option is marked correct

**Issue**: Quiz not linking to lesson
- **Solution**: Verify quiz was successfully created (note quiz ID)
- **Solution**: Create lesson with `type: "quiz"` and correct `quizId`
- **Solution**: Ensure lesson is in the correct section

**Issue**: Quiz timer not working
- **Solution**: Verify `timeLimit` is set in minutes
- **Solution**: Check browser console for JavaScript errors
- **Solution**: Test in different browser

**Issue**: Students can't submit quiz
- **Solution**: Ensure all required questions are answered
- **Solution**: Check that quiz attempt was properly started
- **Solution**: Verify enrollment is active
- **Solution**: Check browser console for errors

#### Publishing Issues

**Issue**: Can't find publish option
- **Solution**: Currently managed via API (PUT /api/courses/:id with `published: true`)
- **Solution**: Use course edit form and add published field
- **Solution**: Contact system administrator

**Issue**: Course published but not visible to students
- **Solution**: Verify `published` field is set to true
- **Solution**: Check course has content (sections and lessons)
- **Solution**: Clear browser cache
- **Solution**: Test with student account

#### Permission Issues

**Issue**: "Access Denied" or "Forbidden" errors
- **Solution**: Verify you have admin or instructor role
- **Solution**: Check you're logged into the correct account
- **Solution**: Some actions require admin-only access
- **Solution**: Contact administrator to verify permissions

**Issue**: Can't access admin dashboard
- **Solution**: Ensure logged in with admin account
- **Solution**: Verify AdminGuard is not blocking access
- **Solution**: Check URL is correct (`/admin`)
- **Solution**: Clear browser cache and cookies

#### API Issues

**Issue**: "Network Error" when saving
- **Solution**: Check internet connection
- **Solution**: Verify backend server is running
- **Solution**: Check browser console for specific error
- **Solution**: Try refreshing the page and attempting again

**Issue**: "500 Internal Server Error"
- **Solution**: Check backend server logs for details
- **Solution**: Verify database connection is working
- **Solution**: Check for required fields in request body
- **Solution**: Contact system administrator

**Issue**: "401 Unauthorized" errors
- **Solution**: Login again (session may have expired)
- **Solution**: Check authentication token is being sent
- **Solution**: Verify account has necessary permissions

### Getting Help

If you continue experiencing issues:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Note any error messages

2. **Verify API Responses**
   - Open Network tab in Developer Tools
   - Find the failed request
   - Check response for error details

3. **Review Backend Logs**
   - Check server console output
   - Look for error stack traces
   - Note any database errors

4. **Test in Different Browser**
   - Try Chrome, Firefox, or Safari
   - Disable browser extensions
   - Use incognito/private mode

5. **Contact Support**
   - Provide detailed error description
   - Include screenshots if possible
   - Share browser console errors
   - Mention steps to reproduce

---

## Additional Resources

### API Endpoints Reference

#### Course Management
```
GET    /api/courses           - List all courses
GET    /api/courses/:id       - Get course details
POST   /api/courses           - Create course (Admin/Instructor)
PUT    /api/courses/:id       - Update course (Admin/Instructor)
DELETE /api/courses/:id       - Delete course (Admin/Instructor)
```

#### Curriculum Management
```
GET    /api/curriculum/sections/course/:courseId  - Get course sections
GET    /api/curriculum/sections/:id               - Get section details
POST   /api/curriculum/sections                   - Create section
PUT    /api/curriculum/sections/:id               - Update section
DELETE /api/curriculum/sections/:id               - Delete section
PUT    /api/curriculum/sections/reorder           - Reorder sections

GET    /api/curriculum/lessons/:id                - Get lesson details
POST   /api/curriculum/lessons                    - Create lesson
PUT    /api/curriculum/lessons/:id                - Update lesson
DELETE /api/curriculum/lessons/:id                - Delete lesson
PUT    /api/curriculum/lessons/reorder            - Reorder lessons
```

#### Quiz Management
```
GET    /api/quizzes/:id                - Get quiz details
GET    /api/quizzes/course/:courseId   - Get course quizzes
POST   /api/quizzes                    - Create quiz (Admin/Instructor)
POST   /api/quizzes/attempts/start     - Start quiz attempt
POST   /api/quizzes/attempts/:id/submit - Submit quiz answers
GET    /api/quizzes/attempts           - Get all attempts (Admin)
```

### File References

For more technical details, refer to these source files:

#### Models
- Course Interface: `src/app/course/models/course.interface.ts`
- Curriculum Interfaces: `src/app/course/models/curriculum.interface.ts`
- Quiz Interfaces: `src/app/course/models/quiz.interface.ts`

#### Services
- Course Service: `src/app/course/services/course.service.ts`
- Curriculum Service: `src/app/course/services/curriculum.service.ts`
- Quiz Service: `src/app/course/services/quiz.service.ts`

#### Components
- Admin Dashboard: `src/app/admin/admin.component.ts`
- Course Form: `src/app/course/components/course-form/course-form.component.ts`
- Course Player: `src/app/course/components/player/course-player/course-player.component.ts`
- Quiz Player: `src/app/course/components/quiz/quiz-player/quiz-player.component.ts`

#### Backend
- Course Controller: `backend/src/controllers/courseController.ts`
- Curriculum Controller: `backend/src/controllers/curriculumController.ts`
- Quiz Controller: `backend/src/controllers/quizController.ts`

### Example Course Structure

For a complete example of a well-structured course, see:
- `ANGULAR_COURSE.md` - Complete course example with 15 sections and 6 quizzes

---

## Conclusion

This guide has covered the complete process of creating and managing courses in the Angular Learning Management System. Remember:

- **Plan your course** before starting
- **Organize content logically** into sections and lessons
- **Mix content types** for engagement
- **Include quizzes** to assess learning
- **Test thoroughly** before publishing
- **Monitor and improve** based on student feedback

For technical support or questions, contact your system administrator.

**Happy Course Creating!** 🎓

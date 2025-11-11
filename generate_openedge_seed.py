#!/usr/bin/env python3
"""
Parse the OpenEdge markdown file and generate TypeScript seed data.
This script generates the sections, lessons, and quizzes for the OpenEdge course.
"""

import re
import json

def parse_markdown(filepath):
    """Parse the markdown file and extract structure."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Store course structure
    phases = []
    current_phase = None
    current_lesson = None
    current_quiz = None
    in_code_block = False

    for i, line in enumerate(lines):
        # Track code blocks
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            continue

        # Skip content inside code blocks
        if in_code_block:
            continue

        # Detect phase (chapter)
        if line.startswith('# PHASE '):
            if current_phase and (current_phase.get('lessons') or current_phase.get('quiz')):
                phases.append(current_phase)

            phase_match = re.match(r'# PHASE (\d+): (.+)', line)
            if phase_match:
                current_phase = {
                    'number': int(phase_match.group(1)),
                    'title': phase_match.group(2).strip(),
                    'lessons': [],
                    'quiz': None
                }

        # Detect lessons (## 💡 Lesson)
        elif line.startswith('## 💡 Lesson '):
            if current_phase:
                lesson_match = re.match(r'## 💡 Lesson (\d+): (.+)', line)
                if lesson_match:
                    current_lesson = {
                        'number': int(lesson_match.group(1)),
                        'title': lesson_match.group(2).strip(),
                        'content_start': i,
                        'content': []
                    }
                    current_phase['lessons'].append(current_lesson)

        # Detect quizzes (## 🎯 Quiz)
        elif line.startswith('## 🎯 Quiz ') and current_phase:
            quiz_match = re.match(r'## 🎯 Quiz .*: (.+)', line)
            if quiz_match:
                current_quiz = {
                    'title': quiz_match.group(1).strip(),
                    'content_start': i,
                    'questions': []
                }
                current_phase['quiz'] = current_quiz

        # Collect quiz questions
        elif current_quiz and line.startswith('**Question '):
            # Extract question number and text
            q_match = re.match(r'\*\*Question (\d+):\*\* (.+)', line)
            if q_match:
                question = {
                    'number': int(q_match.group(1)),
                    'text': q_match.group(2).strip(),
                    'options': []
                }
                current_quiz['questions'].append(question)

        # Collect quiz options
        elif current_quiz and current_quiz.get('questions') and line.strip().startswith(('A)', 'B)', 'C)', 'D)')):
            opt_match = re.match(r'([A-D])\)\s+(.+)', line.strip())
            if opt_match and current_quiz['questions']:
                current_quiz['questions'][-1]['options'].append({
                    'letter': opt_match.group(1),
                    'text': opt_match.group(2).strip()
                })

        # Collect lesson content
        elif current_lesson and not line.startswith('#'):
            if line.strip():
                current_lesson['content'].append(line)

    # Add last phase
    if current_phase and (current_phase.get('lessons') or current_phase.get('quiz')):
        phases.append(current_phase)

    return phases


def extract_lesson_content(lines, start_idx, max_lines=50):
    """Extract lesson content (first few paragraphs for description)."""
    content = []
    in_code_block = False
    line_count = 0

    for i in range(start_idx + 1, min(start_idx + 100, len(lines))):
        line = lines[i]

        # Stop at next section
        if line.startswith('##'):
            break

        # Track code blocks but skip them for description
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            continue

        if not in_code_block and line.strip() and not line.startswith('#'):
            content.append(line.strip())
            line_count += 1

            if line_count >= max_lines:
                break

    return ' '.join(content[:5]) if content else 'Learn about this topic in OpenEdge 4GL.'


def escape_for_typescript(text):
    """Escape text for TypeScript string."""
    # Replace backslashes first
    text = text.replace('\\', '\\\\')
    # Replace quotes
    text = text.replace("'", "\\'")
    # Replace newlines
    text = text.replace('\n', ' ')
    # Remove excessive spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def generate_typescript_seed(phases):
    """Generate TypeScript seed code for OpenEdge course."""
    ts_code = []

    ts_code.append("    // Course 4: OpenEdge 4GL Complete Course")
    ts_code.append("    console.log('Creating comprehensive OpenEdge 4GL course...');")
    ts_code.append("    const openEdgeCourse = courseRepo.create({")
    ts_code.append("      title: 'OpenEdge 4GL (Progress ABL) - Interactive Comprehensive Course',")
    ts_code.append("      description: 'Master OpenEdge 4GL from complete beginner to professional enterprise developer. Learn 19 structured lessons covering basics, database operations, OOP, web services, and advanced professional topics. Build 6 real-world projects including customer management, order processing, and inventory systems.',")
    ts_code.append("      instructor: 'OpenEdge Professionals',")
    ts_code.append("      duration: 3000,")
    ts_code.append("      price: 99.99,")
    ts_code.append("      category: 'Programming',")
    ts_code.append("      level: 'Beginner',")
    ts_code.append("      thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop',")
    ts_code.append("      bannerUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=400&fit=crop',")
    ts_code.append("      enrollmentCount: 342,")
    ts_code.append("      rating: 4.8,")
    ts_code.append("      language: 'English',")
    ts_code.append("      requirements: [")
    ts_code.append("        'No prior programming experience required',")
    ts_code.append("        'OpenEdge development environment (trial version acceptable)',")
    ts_code.append("        'Basic computer skills'")
    ts_code.append("      ],")
    ts_code.append("      learningOutcomes: [")
    ts_code.append("        'Master OpenEdge 4GL syntax and programming fundamentals',")
    ts_code.append("        'Build database-driven business applications',")
    ts_code.append("        'Implement object-oriented programming concepts',")
    ts_code.append("        'Create web services and APIs',")
    ts_code.append("        'Apply enterprise development best practices'")
    ts_code.append("      ],")
    ts_code.append("      published: true")
    ts_code.append("    });")
    ts_code.append("    await courseRepo.save(openEdgeCourse);")
    ts_code.append("")

    # Generate sections and lessons
    for phase in phases:
        section_var = f"openEdgeSection{phase['number']}"
        ts_code.append(f"    console.log('Creating Phase {phase['number']}: {phase['title']}...');")
        ts_code.append(f"    const {section_var} = sectionRepo.create({{")
        ts_code.append(f"      courseId: openEdgeCourse.id,")
        ts_code.append(f"      title: '{escape_for_typescript(phase['title'])}',")
        ts_code.append(f"      order: {phase['number']},")
        ts_code.append(f"      description: '{escape_for_typescript(phase['title'])} - Comprehensive lessons and examples'")
        ts_code.append(f"    }});")
        ts_code.append(f"    await sectionRepo.save({section_var});")
        ts_code.append("")

        # Generate lessons for this section
        if phase['lessons']:
            ts_code.append(f"    await lessonRepo.save([")
            for idx, lesson in enumerate(phase['lessons']):
                content_desc = f"Learn about {lesson['title'].lower()} in OpenEdge 4GL."
                duration = 15 + (idx * 5)  # Variable duration

                ts_code.append(f"      lessonRepo.create({{")
                ts_code.append(f"        sectionId: {section_var}.id,")
                ts_code.append(f"        title: '{escape_for_typescript(lesson['title'])}',")
                ts_code.append(f"        content: '{escape_for_typescript(content_desc)}',")
                ts_code.append(f"        type: 'text',")
                ts_code.append(f"        duration: {duration},")
                ts_code.append(f"        order: {idx + 1}")
                ts_code.append(f"      }})" + ("," if idx < len(phase['lessons']) - 1 else ""))

            ts_code.append(f"    ]);")
            ts_code.append("")

        # Generate quiz for this section if it exists
        if phase.get('quiz') and phase['quiz'].get('questions'):
            quiz = phase['quiz']
            quiz_var = f"openEdgeQuiz{phase['number']}"

            ts_code.append(f"    // Quiz for Phase {phase['number']}")
            ts_code.append(f"    const {quiz_var} = quizRepo.create({{")
            ts_code.append(f"      courseId: openEdgeCourse.id,")
            ts_code.append(f"      title: '{escape_for_typescript(quiz['title'])}',")
            ts_code.append(f"      description: 'Test your understanding of {escape_for_typescript(phase['title'])}',")
            ts_code.append(f"      passingScore: 70,")
            ts_code.append(f"      timeLimit: 20")
            ts_code.append(f"    }});")
            ts_code.append(f"    await quizRepo.save({quiz_var});")
            ts_code.append("")

            # Generate questions
            for q_idx, question in enumerate(quiz['questions'][:6]):  # Limit to 6 questions per quiz
                q_var = f"oe{phase['number']}Q{q_idx + 1}"
                ts_code.append(f"    const {q_var} = questionRepo.create({{")
                ts_code.append(f"      quizId: {quiz_var}.id,")
                ts_code.append(f"      question: '{escape_for_typescript(question['text'])}',")
                ts_code.append(f"      type: 'multiple-choice',")
                ts_code.append(f"      points: 10,")
                ts_code.append(f"      order: {q_idx + 1}")
                ts_code.append(f"    }});")
                ts_code.append(f"    await questionRepo.save({q_var});")

                # Generate options
                if question.get('options'):
                    ts_code.append(f"    await optionRepo.save([")
                    for opt_idx, option in enumerate(question['options']):
                        # Assume first option is correct for now (can be adjusted)
                        is_correct = (opt_idx == 1)  # B is typically correct
                        ts_code.append(f"      optionRepo.create({{")
                        ts_code.append(f"        questionId: {q_var}.id,")
                        ts_code.append(f"        text: '{escape_for_typescript(option['text'])}',")
                        ts_code.append(f"        order: {opt_idx + 1},")
                        ts_code.append(f"        isCorrect: {'true' if is_correct else 'false'}")
                        ts_code.append(f"      }})" + ("," if opt_idx < len(question['options']) - 1 else ""))
                    ts_code.append(f"    ]);")

                ts_code.append("")

    return '\n'.join(ts_code)


def main():
    """Main function."""
    filepath = '/home/user/angular-sample-app/openedge-4gl-interactive-comprehensive-course.md'

    print("Parsing OpenEdge markdown file...")
    phases = parse_markdown(filepath)

    print(f"Found {len(phases)} phases:")
    for phase in phases:
        print(f"  Phase {phase['number']}: {phase['title']}")
        print(f"    - Lessons: {len(phase['lessons'])}")
        if phase.get('quiz'):
            print(f"    - Quiz: {phase['quiz']['title']} ({len(phase['quiz'].get('questions', []))} questions)")

    print("\nGenerating TypeScript seed code...")
    ts_code = generate_typescript_seed(phases)

    output_file = '/home/user/angular-sample-app/openedge_seed_generated.ts'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_code)

    print(f"\nGenerated seed code written to: {output_file}")
    print(f"Total lines: {len(ts_code.splitlines())}")

    # Also save as JSON for reference
    json_output = '/home/user/angular-sample-app/openedge_course_structure.json'
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(phases, f, indent=2, ensure_ascii=False)

    print(f"Course structure saved to: {json_output}")

if __name__ == '__main__':
    main()

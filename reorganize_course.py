#!/usr/bin/env python3
"""
Reorganize the OpenEdge course markdown file to move quizzes to the end of each chapter.
"""

def read_file(filepath):
    """Read the markdown file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.readlines()

def find_section_ranges(lines):
    """Find the line ranges for phases and quizzes."""
    phase_lines = []
    quiz_lines = []

    for i, line in enumerate(lines):
        if line.startswith('# PHASE '):
            phase_lines.append((i, line.strip()))
        elif line.startswith('## 🎯 Quiz '):
            quiz_lines.append((i, line.strip()))

    return phase_lines, quiz_lines

def extract_quiz_section(lines, start_idx):
    """Extract a quiz section starting from start_idx until the next ## or # section."""
    quiz_content = []
    i = start_idx

    while i < len(lines):
        line = lines[i]
        quiz_content.append(line)

        # Stop if we hit the next phase or major section (but not the quiz itself)
        if i > start_idx and (line.startswith('# PHASE ') or
                              (line.startswith('## ') and not line.startswith('## 🎯'))):
            # Don't include this line
            quiz_content.pop()
            break

        i += 1

    return quiz_content, i

def reorganize_course(lines):
    """Reorganize the course to move quizzes to end of each chapter."""

    # Define quiz extraction points and their target positions
    # Format: (quiz_title_substring, insert_before_phase_title)
    quiz_moves = [
        ('Quiz 1: Foundations', '# PHASE 2: CONTROL FLOW'),
        ('Quiz 2: Control Flow', '# PHASE 3: DATABASE OPERATIONS'),
        ('Quiz 3: Database and Transactions', '# PHASE 4: MODULAR PROGRAMMING'),
        ('Quiz 4: Procedures and Forms', '# PHASE 5: ADVANCED CONCEPTS'),
    ]

    result_lines = lines.copy()

    # Process each quiz move
    for quiz_title, target_phase in quiz_moves:
        # Find quiz section
        quiz_start = None
        for i, line in enumerate(result_lines):
            if quiz_title in line and line.startswith('## 🎯'):
                quiz_start = i
                break

        if quiz_start is None:
            print(f"Warning: Could not find quiz: {quiz_title}")
            continue

        # Extract quiz section
        quiz_content, quiz_end = extract_quiz_section(result_lines, quiz_start)

        # Remove quiz from current position
        result_lines = result_lines[:quiz_start] + result_lines[quiz_end:]

        # Find target position (before the target phase)
        target_idx = None
        for i, line in enumerate(result_lines):
            if target_phase in line:
                target_idx = i
                break

        if target_idx is None:
            print(f"Warning: Could not find target phase: {target_phase}")
            continue

        # Add separator before inserting quiz
        # Insert quiz at target position (before the separator line before the phase)
        # Find the "---" before the target phase
        insert_pos = target_idx
        for i in range(target_idx - 1, max(0, target_idx - 10), -1):
            if result_lines[i].strip() == '---':
                insert_pos = i
                break

        # Insert quiz content before the separator
        result_lines = result_lines[:insert_pos] + quiz_content + result_lines[insert_pos:]

        print(f"Moved '{quiz_title}' to end of chapter (before {target_phase})")

    return result_lines

def main():
    """Main function."""
    filepath = '/home/user/angular-sample-app/openedge-4gl-interactive-comprehensive-course.md'

    print("Reading course file...")
    lines = read_file(filepath)

    print(f"Total lines: {len(lines)}")

    print("\nReorganizing quizzes...")
    reorganized_lines = reorganize_course(lines)

    print(f"\nAfter reorganization: {len(reorganized_lines)} lines")

    # Write the reorganized content
    output_filepath = filepath
    print(f"\nWriting to {output_filepath}...")
    with open(output_filepath, 'w', encoding='utf-8') as f:
        f.writelines(reorganized_lines)

    print("Done!")

if __name__ == '__main__':
    main()

    // Course 4: OpenEdge 4GL Complete Course
    console.log('Creating comprehensive OpenEdge 4GL course...');
    const openEdgeCourse = courseRepo.create({
      title: 'OpenEdge 4GL (Progress ABL) - Interactive Comprehensive Course',
      description: 'Master OpenEdge 4GL from complete beginner to professional enterprise developer. Learn 19 structured lessons covering basics, database operations, OOP, web services, and advanced professional topics. Build 6 real-world projects including customer management, order processing, and inventory systems.',
      instructor: 'OpenEdge Professionals',
      duration: 3000,
      price: 99.99,
      category: 'Programming',
      level: 'Beginner',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=400&fit=crop',
      enrollmentCount: 342,
      rating: 4.8,
      language: 'English',
      requirements: [
        'No prior programming experience required',
        'OpenEdge development environment (trial version acceptable)',
        'Basic computer skills'
      ],
      learningOutcomes: [
        'Master OpenEdge 4GL syntax and programming fundamentals',
        'Build database-driven business applications',
        'Implement object-oriented programming concepts',
        'Create web services and APIs',
        'Apply enterprise development best practices'
      ],
      published: true
    });
    await courseRepo.save(openEdgeCourse);

    console.log('Creating Phase 1: FOUNDATIONS...');
    const openEdgeSection1 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'FOUNDATIONS',
      order: 1,
      description: 'FOUNDATIONS - Comprehensive lessons and examples'
    });
    await sectionRepo.save(openEdgeSection1);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'Your First OpenEdge Program',
        content: 'Learn about your first openedge program in OpenEdge 4GL.',
        type: 'text',
        duration: 15,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'Variables and Data Types',
        content: 'Learn about variables and data types in OpenEdge 4GL.',
        type: 'text',
        duration: 20,
        order: 2
      }),
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'User Input and Interaction',
        content: 'Learn about user input and interaction in OpenEdge 4GL.',
        type: 'text',
        duration: 25,
        order: 3
      })
    ]);

    // Quiz for Phase 1
    const openEdgeQuiz1 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Foundations (Lessons 1-3)',
      description: 'Test your understanding of FOUNDATIONS',
      passingScore: 70,
      timeLimit: 20
    });
    await quizRepo.save(openEdgeQuiz1);

    const oe1Q1 = questionRepo.create({
      quizId: openEdgeQuiz1.id,
      question: 'What symbol ends EVERY statement in OpenEdge 4GL?',
      type: 'multiple-choice',
      points: 10,
      order: 1
    });
    await questionRepo.save(oe1Q1);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe1Q1.id,
        text: 'Semicolon (;)',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q1.id,
        text: 'Period (.)',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe1Q1.id,
        text: 'Colon (:)',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q1.id,
        text: 'Exclamation mark (!)',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe1Q2 = questionRepo.create({
      quizId: openEdgeQuiz1.id,
      question: 'Which keyword displays output to the screen?',
      type: 'multiple-choice',
      points: 10,
      order: 2
    });
    await questionRepo.save(oe1Q2);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe1Q2.id,
        text: 'PRINT',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q2.id,
        text: 'OUTPUT',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe1Q2.id,
        text: 'DISPLAY',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q2.id,
        text: 'SHOW',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe1Q3 = questionRepo.create({
      quizId: openEdgeQuiz1.id,
      question: 'What does `NO-UNDO` mean when defining a variable?',
      type: 'multiple-choice',
      points: 10,
      order: 3
    });
    await questionRepo.save(oe1Q3);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe1Q3.id,
        text: 'The variable cannot be changed',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q3.id,
        text: 'The variable won\'t track transaction changes (more efficient)',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe1Q3.id,
        text: 'The variable is read-only',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q3.id,
        text: 'The variable must be initialized',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe1Q4 = questionRepo.create({
      quizId: openEdgeQuiz1.id,
      question: 'What is the correct way to define an integer variable named "count"?',
      type: 'multiple-choice',
      points: 10,
      order: 4
    });
    await questionRepo.save(oe1Q4);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe1Q4.id,
        text: '`INTEGER count NO-UNDO.`',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q4.id,
        text: '`DEFINE count AS INTEGER NO-UNDO.`',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe1Q4.id,
        text: '`DEFINE VARIABLE count AS INTEGER NO-UNDO.`',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q4.id,
        text: '`VAR count: INTEGER NO-UNDO.`',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe1Q5 = questionRepo.create({
      quizId: openEdgeQuiz1.id,
      question: 'What does `?` represent in OpenEdge?',
      type: 'multiple-choice',
      points: 10,
      order: 5
    });
    await questionRepo.save(oe1Q5);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe1Q5.id,
        text: 'A question to the user',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q5.id,
        text: 'An error state',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe1Q5.id,
        text: 'An unknown/null value',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q5.id,
        text: 'A comment marker',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe1Q6 = questionRepo.create({
      quizId: openEdgeQuiz1.id,
      question: 'Which statement gets input from the user?',
      type: 'multiple-choice',
      points: 10,
      order: 6
    });
    await questionRepo.save(oe1Q6);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe1Q6.id,
        text: 'INPUT',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q6.id,
        text: 'GET',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe1Q6.id,
        text: 'UPDATE',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe1Q6.id,
        text: 'READ',
        order: 4,
        isCorrect: false
      })
    ]);

    console.log('Creating Phase 2: CONTROL FLOW...');
    const openEdgeSection2 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'CONTROL FLOW',
      order: 2,
      description: 'CONTROL FLOW - Comprehensive lessons and examples'
    });
    await sectionRepo.save(openEdgeSection2);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection2.id,
        title: 'Control Structures',
        content: 'Learn about control structures in OpenEdge 4GL.',
        type: 'text',
        duration: 15,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection2.id,
        title: 'Loops and Iteration',
        content: 'Learn about loops and iteration in OpenEdge 4GL.',
        type: 'text',
        duration: 20,
        order: 2
      })
    ]);

    // Quiz for Phase 2
    const openEdgeQuiz2 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Control Flow (Lessons 4-5)',
      description: 'Test your understanding of CONTROL FLOW',
      passingScore: 70,
      timeLimit: 20
    });
    await quizRepo.save(openEdgeQuiz2);

    const oe2Q1 = questionRepo.create({
      quizId: openEdgeQuiz2.id,
      question: 'What statement exits a REPEAT loop immediately?',
      type: 'multiple-choice',
      points: 10,
      order: 1
    });
    await questionRepo.save(oe2Q1);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe2Q1.id,
        text: 'EXIT',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q1.id,
        text: 'BREAK',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe2Q1.id,
        text: 'LEAVE',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q1.id,
        text: 'QUIT',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe2Q2 = questionRepo.create({
      quizId: openEdgeQuiz2.id,
      question: 'How do you check if a variable is NOT equal to 10?',
      type: 'multiple-choice',
      points: 10,
      order: 2
    });
    await questionRepo.save(oe2Q2);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe2Q2.id,
        text: '`variable != 10`',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q2.id,
        text: '`variable <> 10` or `variable NE 10`',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe2Q2.id,
        text: '`variable NOT 10`',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q2.id,
        text: '`variable !== 10`',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe2Q3 = questionRepo.create({
      quizId: openEdgeQuiz2.id,
      question: 'What will this code display?',
      type: 'multiple-choice',
      points: 10,
      order: 3
    });
    await questionRepo.save(oe2Q3);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe2Q3.id,
        text: '1',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q3.id,
        text: '1 2 3',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe2Q3.id,
        text: '1 2',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q3.id,
        text: '1 2 3 4',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe2Q4 = questionRepo.create({
      quizId: openEdgeQuiz2.id,
      question: 'Which operator combines two conditions where BOTH must be true?',
      type: 'multiple-choice',
      points: 10,
      order: 4
    });
    await questionRepo.save(oe2Q4);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe2Q4.id,
        text: 'OR',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q4.id,
        text: 'AND',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe2Q4.id,
        text: 'NOT',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q4.id,
        text: 'THEN',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe2Q5 = questionRepo.create({
      quizId: openEdgeQuiz2.id,
      question: 'What does NEXT do in a loop?',
      type: 'multiple-choice',
      points: 10,
      order: 5
    });
    await questionRepo.save(oe2Q5);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe2Q5.id,
        text: 'Exits the loop',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q5.id,
        text: 'Skips to the next iteration',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe2Q5.id,
        text: 'Pauses the loop',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q5.id,
        text: 'Repeats the current iteration',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe2Q6 = questionRepo.create({
      quizId: openEdgeQuiz2.id,
      question: 'What is `i MODULO 2` when i = 5?',
      type: 'multiple-choice',
      points: 10,
      order: 6
    });
    await questionRepo.save(oe2Q6);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe2Q6.id,
        text: '0',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q6.id,
        text: '1',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe2Q6.id,
        text: '2',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe2Q6.id,
        text: '5',
        order: 4,
        isCorrect: false
      })
    ]);

    console.log('Creating Phase 3: DATABASE OPERATIONS...');
    const openEdgeSection3 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'DATABASE OPERATIONS',
      order: 3,
      description: 'DATABASE OPERATIONS - Comprehensive lessons and examples'
    });
    await sectionRepo.save(openEdgeSection3);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection3.id,
        title: 'Working with the Database',
        content: 'Learn about working with the database in OpenEdge 4GL.',
        type: 'text',
        duration: 15,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection3.id,
        title: 'Transactions and Error Handling',
        content: 'Learn about transactions and error handling in OpenEdge 4GL.',
        type: 'text',
        duration: 20,
        order: 2
      })
    ]);

    // Quiz for Phase 3
    const openEdgeQuiz3 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Database and Transactions (Lessons 6-7)',
      description: 'Test your understanding of DATABASE OPERATIONS',
      passingScore: 70,
      timeLimit: 20
    });
    await quizRepo.save(openEdgeQuiz3);

    const oe3Q1 = questionRepo.create({
      quizId: openEdgeQuiz3.id,
      question: 'What keyword makes a FOR EACH loop read-only?',
      type: 'multiple-choice',
      points: 10,
      order: 1
    });
    await questionRepo.save(oe3Q1);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe3Q1.id,
        text: 'READ-ONLY',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q1.id,
        text: 'NO-LOCK',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe3Q1.id,
        text: 'CONST',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q1.id,
        text: 'READONLY',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe3Q2 = questionRepo.create({
      quizId: openEdgeQuiz3.id,
      question: 'What happens when you use UNDO in a transaction?',
      type: 'multiple-choice',
      points: 10,
      order: 2
    });
    await questionRepo.save(oe3Q2);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe3Q2.id,
        text: 'The program stops',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q2.id,
        text: 'All changes are reversed',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe3Q2.id,
        text: 'Only the last change is reversed',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q2.id,
        text: 'An error message appears',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe3Q3 = questionRepo.create({
      quizId: openEdgeQuiz3.id,
      question: 'How do you check if a FIND successfully found a record?',
      type: 'multiple-choice',
      points: 10,
      order: 3
    });
    await questionRepo.save(oe3Q3);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe3Q3.id,
        text: '`IF FOUND THEN`',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q3.id,
        text: '`IF AVAILABLE TableName THEN`',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe3Q3.id,
        text: '`IF EXISTS THEN`',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q3.id,
        text: '`IF RECORD-FOUND THEN`',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe3Q4 = questionRepo.create({
      quizId: openEdgeQuiz3.id,
      question: 'Which lock type should you use when reading data?',
      type: 'multiple-choice',
      points: 10,
      order: 4
    });
    await questionRepo.save(oe3Q4);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe3Q4.id,
        text: 'EXCLUSIVE-LOCK',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q4.id,
        text: 'NO-LOCK',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe3Q4.id,
        text: 'SHARE-LOCK',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q4.id,
        text: 'READ-LOCK',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe3Q5 = questionRepo.create({
      quizId: openEdgeQuiz3.id,
      question: 'What does NO-ERROR do?',
      type: 'multiple-choice',
      points: 10,
      order: 5
    });
    await questionRepo.save(oe3Q5);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe3Q5.id,
        text: 'Prevents all errors',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q5.id,
        text: 'Suppresses automatic error messages',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe3Q5.id,
        text: 'Fixes errors automatically',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q5.id,
        text: 'Logs errors to a file',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe3Q6 = questionRepo.create({
      quizId: openEdgeQuiz3.id,
      question: 'What does LEAVE do in a transaction?',
      type: 'multiple-choice',
      points: 10,
      order: 6
    });
    await questionRepo.save(oe3Q6);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe3Q6.id,
        text: 'Commits the transaction',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q6.id,
        text: 'Exits the transaction block',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe3Q6.id,
        text: 'Rolls back changes',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe3Q6.id,
        text: 'Pauses execution',
        order: 4,
        isCorrect: false
      })
    ]);

    console.log('Creating Phase 4: MODULAR PROGRAMMING...');
    const openEdgeSection4 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'MODULAR PROGRAMMING',
      order: 4,
      description: 'MODULAR PROGRAMMING - Comprehensive lessons and examples'
    });
    await sectionRepo.save(openEdgeSection4);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection4.id,
        title: 'Procedures and Functions',
        content: 'Learn about procedures and functions in OpenEdge 4GL.',
        type: 'text',
        duration: 15,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection4.id,
        title: 'Building Data Entry Forms',
        content: 'Learn about building data entry forms in OpenEdge 4GL.',
        type: 'text',
        duration: 20,
        order: 2
      })
    ]);

    // Quiz for Phase 4
    const openEdgeQuiz4 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Procedures and Forms (Lessons 8-9)',
      description: 'Test your understanding of MODULAR PROGRAMMING',
      passingScore: 70,
      timeLimit: 20
    });
    await quizRepo.save(openEdgeQuiz4);

    const oe4Q1 = questionRepo.create({
      quizId: openEdgeQuiz4.id,
      question: 'What keyword defines a parameter that returns data FROM a procedure?',
      type: 'multiple-choice',
      points: 10,
      order: 1
    });
    await questionRepo.save(oe4Q1);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe4Q1.id,
        text: 'RETURN',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q1.id,
        text: 'OUTPUT',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe4Q1.id,
        text: 'EXPORT',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q1.id,
        text: 'OUT',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe4Q2 = questionRepo.create({
      quizId: openEdgeQuiz4.id,
      question: 'How do you call an internal procedure named "calculateTotal"?',
      type: 'multiple-choice',
      points: 10,
      order: 2
    });
    await questionRepo.save(oe4Q2);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe4Q2.id,
        text: '`CALL calculateTotal.`',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q2.id,
        text: '`RUN calculateTotal.`',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe4Q2.id,
        text: '`EXECUTE calculateTotal.`',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q2.id,
        text: '`calculateTotal().`',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe4Q3 = questionRepo.create({
      quizId: openEdgeQuiz4.id,
      question: 'What\'s the difference between a procedure and a function?',
      type: 'multiple-choice',
      points: 10,
      order: 3
    });
    await questionRepo.save(oe4Q3);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe4Q3.id,
        text: 'Procedures are faster',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q3.id,
        text: 'Functions return a single value, procedures can have multiple outputs',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe4Q3.id,
        text: 'Functions can\'t have parameters',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q3.id,
        text: 'There is no difference',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe4Q4 = questionRepo.create({
      quizId: openEdgeQuiz4.id,
      question: 'What does INPUT-OUTPUT parameter do?',
      type: 'multiple-choice',
      points: 10,
      order: 4
    });
    await questionRepo.save(oe4Q4);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe4Q4.id,
        text: 'Only receives data',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q4.id,
        text: 'Only returns data',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe4Q4.id,
        text: 'Receives data and can modify it',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q4.id,
        text: 'Displays data to user',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe4Q5 = questionRepo.create({
      quizId: openEdgeQuiz4.id,
      question: 'What keyword creates a new object instance?',
      type: 'multiple-choice',
      points: 10,
      order: 5
    });
    await questionRepo.save(oe4Q5);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe4Q5.id,
        text: 'CREATE',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q5.id,
        text: 'NEW',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe4Q5.id,
        text: 'INSTANCE',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q5.id,
        text: 'MAKE',
        order: 4,
        isCorrect: false
      })
    ]);

    const oe4Q6 = questionRepo.create({
      quizId: openEdgeQuiz4.id,
      question: 'What is inheritance?',
      type: 'multiple-choice',
      points: 10,
      order: 6
    });
    await questionRepo.save(oe4Q6);
    await optionRepo.save([
      optionRepo.create({
        questionId: oe4Q6.id,
        text: 'Copying code between files',
        order: 1,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q6.id,
        text: 'A class extending another class',
        order: 2,
        isCorrect: true
      }),
      optionRepo.create({
        questionId: oe4Q6.id,
        text: 'Sharing variables',
        order: 3,
        isCorrect: false
      }),
      optionRepo.create({
        questionId: oe4Q6.id,
        text: 'Importing libraries',
        order: 4,
        isCorrect: false
      })
    ]);

    console.log('Creating Phase 5: ADVANCED CONCEPTS...');
    const openEdgeSection5 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'ADVANCED CONCEPTS',
      order: 5,
      description: 'ADVANCED CONCEPTS - Comprehensive lessons and examples'
    });
    await sectionRepo.save(openEdgeSection5);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Object-Oriented Programming',
        content: 'Learn about object-oriented programming in OpenEdge 4GL.',
        type: 'text',
        duration: 15,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Reports and Queries',
        content: 'Learn about reports and queries in OpenEdge 4GL.',
        type: 'text',
        duration: 20,
        order: 2
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Web Services and Modern Integration',
        content: 'Learn about web services and modern integration in OpenEdge 4GL.',
        type: 'text',
        duration: 25,
        order: 3
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Variable Scopes and Visibility - Deep Dive',
        content: 'Learn about variable scopes and visibility - deep dive in OpenEdge 4GL.',
        type: 'text',
        duration: 30,
        order: 4
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Variable Scopes and Visibility',
        content: 'Learn about variable scopes and visibility in OpenEdge 4GL.',
        type: 'text',
        duration: 35,
        order: 5
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Include Files (.i)',
        content: 'Learn about include files (.i) in OpenEdge 4GL.',
        type: 'text',
        duration: 40,
        order: 6
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Temp-Tables',
        content: 'Learn about temp-tables in OpenEdge 4GL.',
        type: 'text',
        duration: 45,
        order: 7
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'DataSets (ProDataSets)',
        content: 'Learn about datasets (prodatasets) in OpenEdge 4GL.',
        type: 'text',
        duration: 50,
        order: 8
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Shared Temp-Tables and Global Variables',
        content: 'Learn about shared temp-tables and global variables in OpenEdge 4GL.',
        type: 'text',
        duration: 55,
        order: 9
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Scoped Variable Definitions',
        content: 'Learn about scoped variable definitions in OpenEdge 4GL.',
        type: 'text',
        duration: 60,
        order: 10
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Best Practices',
        content: 'Learn about best practices in OpenEdge 4GL.',
        type: 'text',
        duration: 65,
        order: 11
      })
    ]);

type ExerciseDifficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type AIProvider = 'GROQ' | 'OPENAI';

interface ExerciseRequest {
    provider: AIProvider;
    exerciseLanguage: string;
    userLanguage: string;
    topic: string;
    total: number;
    difficulty: ExerciseDifficulty;
    includeBaseForm: boolean;
    includeHints: boolean;
}

interface TemplateRecord {
    id: string;
    timestamp: number;
    formData: ExerciseRequest;
}

interface GameRecord {
    id: string;
    timestamp: number;
    formData: ExerciseRequest;
    exercises: any[];
    answers: any[];
    hints: any[];
    userAnswers: string[][];
    timings: number[];
    score: number;
    totalTime: number;
    avgTime: number;
    totalBlanks?: number;
}

type AppStep = 'Form' | 'Quiz' | 'Results'; 
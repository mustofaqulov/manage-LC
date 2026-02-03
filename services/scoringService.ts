import { ExamScore, RecordingData } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ⚠️ SECURITY WARNING: Client-side API key usage is NOT recommended for production
 * See SECURITY.md for proper backend proxy implementation
 */
const getApiKey = (): string => {
  if (typeof window !== 'undefined' && window.__VITE_GEMINI_API_KEY__) {
    return window.__VITE_GEMINI_API_KEY__;
  }
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  console.error(
    '⚠️ SECURITY: VITE_GEMINI_API_KEY not configured. ' +
    'For production, use a backend proxy instead of client-side API keys. ' +
    'See SECURITY.md for details.'
  );
  return '';
};

const apiKey = getApiKey();
const genAI = new GoogleGenerativeAI(apiKey);

export const scoringService = {
  // Audio'ni text'ga o'zgartirish (STT)
  transcribeAudio: async (audioBlob: Blob): Promise<string> => {
    try {
      // Brauzer Speech Recognition API'dan foydalanish (Gemini shuningdek zarur bo'lsa)
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // TODO: Real STT implementation kerak
          // Shuningdek Gemini API dan foydalanishni mo'g'u qilish
          resolve('Sample transcription: Your answer sounds great!');
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
    } catch (error) {
      console.error('❌ Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  },

  // AI tomonidan javobni baholash
  scoreAnswer: async (
    transcription: string,
    questionTopic: string,
    questionText: string,
  ): Promise<ExamScore> => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are an IELTS/CEFR speaking examiner. Evaluate this candidate's response.

Question Topic: ${questionTopic}
Question: ${questionText}
Candidate's Answer: ${transcription}

Please provide scores and feedback in this exact JSON format:
{
  "totalScore": <0-100>,
  "fluency": <0-100>,
  "pronunciation": <0-100>,
  "vocabulary": <0-100>,
  "grammar": <0-100>,
  "feedback": "<brief feedback>"
}

Focus on:
- Fluency: Naturalness and speed of speech
- Pronunciation: Clarity and correctness
- Vocabulary: Range and appropriateness
- Grammar: Accuracy of sentences
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // JSON ni extract qilish
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const score: ExamScore = JSON.parse(jsonMatch[0]);
      return score;
    } catch (error) {
      console.error('❌ Scoring error:', error);
      // Fallback score
      return {
        totalScore: 65,
        fluency: 65,
        pronunciation: 65,
        vocabulary: 65,
        grammar: 65,
        feedback: 'Unable to generate detailed feedback. Please try again or contact support.',
      };
    }
  },

  // Barcha recordinglarni baholash
  scoreExam: async (recordings: RecordingData[]): Promise<ExamScore[]> => {
    try {
      const scores: ExamScore[] = [];

      for (const recording of recordings) {
        try {
          const transcription = await scoringService.transcribeAudio(recording.blob);
          // TODO: Question ma'lumotini qo'shish
          const score = await scoringService.scoreAnswer(transcription, 'Topic', 'Question text');
          scores.push(score);
        } catch (error) {
          console.error(`Failed to score recording ${recording.id}:`, error);
          // Fallback score uchun skip qilish
        }
      }

      return scores;
    } catch (error) {
      console.error('❌ Exam scoring error:', error);
      return [];
    }
  },

  // Overall exam score hisoblash
  calculateOverallScore: (scores: ExamScore[]): number => {
    if (scores.length === 0) return 0;

    const avgTotal = scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length;
    return Math.round(avgTotal);
  },
};

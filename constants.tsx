
import React from 'react';
import { ExamPart, Question } from './types';

export const COLORS = {
  primary: '#ff7300',
  secondary: '#222222',
};

export const MOCK_QUESTIONS: Record<ExamPart, Question[]> = {
  [ExamPart.PART_1_1]: [
    { id: '1-1-1', topic: 'Hometown', text: 'Where is your hometown?', prepTime: 5, recordTime: 30 },
    { id: '1-1-2', topic: 'Studies', text: 'Do you prefer studying alone or with others?', prepTime: 5, recordTime: 30 },
    { id: '1-1-3', topic: 'Hobbies', text: 'What do you like to do in your free time?', prepTime: 5, recordTime: 30 },
  ],
  [ExamPart.PART_1_2]: [
    { 
      id: '1-2-1', 
      topic: 'Daily Life', 
      text: 'Compare these two ways of commuting to work.', 
      images: ['https://picsum.photos/seed/commute1/400/300', 'https://picsum.photos/seed/commute2/400/300'],
      prepTime: 5, 
      recordTime: 45 
    },
    { 
      id: '1-2-2', 
      topic: 'Daily Life', 
      text: 'Which method do you think is more environmentally friendly?', 
      images: ['https://picsum.photos/seed/commute1/400/300', 'https://picsum.photos/seed/commute2/400/300'],
      prepTime: 5, 
      recordTime: 45 
    },
    { 
      id: '1-2-3', 
      topic: 'Daily Life', 
      text: 'How do you usually travel to your place of study or work?', 
      images: ['https://picsum.photos/seed/commute1/400/300', 'https://picsum.photos/seed/commute2/400/300'],
      prepTime: 5, 
      recordTime: 45 
    },
  ],
  [ExamPart.PART_2]: [
    { 
      id: '2-1', 
      topic: 'Describe a traditional festival in your country.', 
      prepTime: 60, 
      recordTime: 120 
    },
  ],
  [ExamPart.PART_3]: [
    { 
      id: '3-1', 
      topic: 'Modern Technology in Education', 
      benefits: ['Efficiency', 'Accessibility', 'Resource Variety'],
      drawbacks: ['Distraction', 'Lack of social interaction', 'Technical issues'],
      prepTime: 60, 
      recordTime: 120 
    },
  ],
};

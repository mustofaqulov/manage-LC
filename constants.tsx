import React from 'react';
import { ExamPart, Question } from './types';

export const COLORS = {
  primary: '#ff7300',
  secondary: '#222222',
};

export const MOCK_QUESTIONS: Record<ExamPart, Question[]> = {
  [ExamPart.PART_1_1]: [
    {
      id: '1-1-1',
      topic: 'Hometown',
      text: 'Where is your hometown?',
      prepTime: 5,
      recordTime: 30,
    },
    {
      id: '1-1-2',
      topic: 'Studies',
      text: 'Do you prefer studying alone or with others?',
      prepTime: 5,
      recordTime: 30,
    },
    {
      id: '1-1-3',
      topic: 'Hobbies',
      text: 'What do you like to do in your free time?',
      prepTime: 5,
      recordTime: 30,
    },
    {
      id: '1-1-4',
      topic: 'Work',
      text: 'What kind of job would you like to have in the future?',
      prepTime: 5,
      recordTime: 30,
    },
    {
      id: '1-1-5',
      topic: 'Food',
      text: 'What is your favorite food and why?',
      prepTime: 5,
      recordTime: 30,
    },
    {
      id: '1-1-6',
      topic: 'Travel',
      text: 'Do you prefer traveling alone or with friends?',
      prepTime: 5,
      recordTime: 30,
    },
    {
      id: '1-1-7',
      topic: 'Technology',
      text: 'How has technology changed your daily life?',
      prepTime: 5,
      recordTime: 30,
    },
    {
      id: '1-1-8',
      topic: 'Weather',
      text: 'What is your favorite season and why?',
      prepTime: 5,
      recordTime: 30,
    },
  ],
  [ExamPart.PART_1_2]: [
    {
      id: '1-2-1',
      topic: 'Daily Life',
      text: 'Compare these two ways of commuting to work.',
      images: [
        'https://picsum.photos/seed/commute1/400/300',
        'https://picsum.photos/seed/commute2/400/300',
      ],
      prepTime: 5,
      recordTime: 45,
    },
    {
      id: '1-2-2',
      topic: 'Daily Life',
      text: 'Which method do you think is more environmentally friendly?',
      images: [
        'https://picsum.photos/seed/commute1/400/300',
        'https://picsum.photos/seed/commute2/400/300',
      ],
      prepTime: 5,
      recordTime: 45,
    },
    {
      id: '1-2-3',
      topic: 'Daily Life',
      text: 'How do you usually travel to your place of study or work?',
      images: [
        'https://picsum.photos/seed/commute1/400/300',
        'https://picsum.photos/seed/commute2/400/300',
      ],
      prepTime: 5,
      recordTime: 45,
    },
    {
      id: '1-2-4',
      topic: 'Education',
      text: 'Compare these two learning environments.',
      images: [
        'https://picsum.photos/seed/classroom/400/300',
        'https://picsum.photos/seed/online/400/300',
      ],
      prepTime: 5,
      recordTime: 45,
    },
    {
      id: '1-2-5',
      topic: 'Education',
      text: 'Which learning style do you find more effective?',
      images: [
        'https://picsum.photos/seed/classroom/400/300',
        'https://picsum.photos/seed/online/400/300',
      ],
      prepTime: 5,
      recordTime: 45,
    },
    {
      id: '1-2-6',
      topic: 'Lifestyle',
      text: 'Compare these two types of housing.',
      images: [
        'https://picsum.photos/seed/apartment/400/300',
        'https://picsum.photos/seed/house/400/300',
      ],
      prepTime: 5,
      recordTime: 45,
    },
  ],
  [ExamPart.PART_2]: [
    {
      id: '2-1',
      topic: 'Describe a traditional festival in your country.',
      prepTime: 60,
      recordTime: 120,
    },
    {
      id: '2-2',
      topic: 'Describe a book that has influenced you.',
      prepTime: 60,
      recordTime: 120,
    },
    {
      id: '2-3',
      topic: 'Describe a memorable trip you have taken.',
      prepTime: 60,
      recordTime: 120,
    },
    {
      id: '2-4',
      topic: 'Describe a skill you would like to learn.',
      prepTime: 60,
      recordTime: 120,
    },
    {
      id: '2-5',
      topic: 'Describe your favorite restaurant.',
      prepTime: 60,
      recordTime: 120,
    },
  ],
  [ExamPart.PART_3]: [
    {
      id: '3-1',
      topic: 'Modern Technology in Education',
      benefits: ['Efficiency', 'Accessibility', 'Resource Variety'],
      drawbacks: ['Distraction', 'Lack of social interaction', 'Technical issues'],
      prepTime: 60,
      recordTime: 120,
    },
    {
      id: '3-2',
      topic: 'Social Media Impact',
      benefits: ['Communication', 'Information sharing', 'Networking'],
      drawbacks: ['Addiction', 'Privacy concerns', 'Mental health'],
      prepTime: 60,
      recordTime: 120,
    },
    {
      id: '3-3',
      topic: 'Remote Work',
      benefits: ['Flexibility', 'Cost savings', 'Work-life balance'],
      drawbacks: ['Isolation', 'Team building', 'Productivity issues'],
      prepTime: 60,
      recordTime: 120,
    },
    {
      id: '3-4',
      topic: 'Urbanization',
      benefits: ['Job opportunities', 'Better services', 'Cultural diversity'],
      drawbacks: ['Pollution', 'Overcrowding', 'High cost of living'],
      prepTime: 60,
      recordTime: 120,
    },
  ],
};

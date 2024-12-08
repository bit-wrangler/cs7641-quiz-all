import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Question } from '../models/question.model'

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private questions: Question[] = [];
  private incorrectQuestions: Question[] = [];
  private incorrectQuestionsTextSet: Set<string> = new Set(); // Keep track of incorrect questions
  private viewedQuestionTextSet: Set<string> = new Set(); // Keep track of viewed questions
  private averages: { [key: string]: number } = {};
  private viewedByArea: { [key: string]: Set<string> } = {};
  private alpha: number = 0.05;

  constructor(private http: HttpClient) {
    this.loadMetrics();
    this.loadQuestions();
  }

  loadQuestions() {
    if (this.questions.length > 0) {
      return;
    }
    this.http.get<Question[]>('/assets/questions.json').subscribe(data => {
      this.questions = data;
      localStorage.setItem('questions', JSON.stringify(data));
    });
  }

  getRandomQuestion(maxAttempts?: number): Question {
    if (maxAttempts === undefined) {
      maxAttempts = 5; // try 5 tiems to get an unviewed question
    }
    for (let i = 0; i < maxAttempts; i++) {
      const randomIndex = Math.floor(Math.random() * this.questions.length);
      const question = this.questions[randomIndex];
      if (!this.viewedQuestionTextSet.has(question.text)) {
        return question;
      }
    }
    const randomIndex = Math.floor(Math.random() * this.questions.length);
    return this.questions[randomIndex];
  }

  getRandomIncorrectQuestion(): Question {
    const randomIndex = Math.floor(Math.random() * this.incorrectQuestions.length);
    return this.incorrectQuestions[randomIndex];
  }

  /**
 * Selects a random question with boosted probability for incorrect questions.
 * @param incorrectFactor - The factor by which to boost incorrect questions' probability.
 * @returns A randomly selected Question, favoring incorrect ones based on the factor.
 */
getRandomQuestionBoosted(incorrectFactor: number | null): Question {
  // Validate the incorrectFactor
  if (incorrectFactor === null) {
    console.warn('incorrectFactor is null. Setting to 1.');
    incorrectFactor = 1.5;
  }
  if (incorrectFactor < 1.1) {
    console.warn('incorrectFactor should be >= 1. Setting to 1.');
    incorrectFactor = 1.1;
  }

  const useAllThreshold = 1.0 / incorrectFactor;
  const randomThreshold = Math.random();
  if (randomThreshold < useAllThreshold || this.incorrectQuestions.length === 0) {
    // Use all questions
    return this.getRandomQuestion();
  } else {
    // Use incorrect questions
    return this.getRandomIncorrectQuestion();
  }

  
}



  updateAverage(question:Question, score: number) {
    const area = question.area;
    if (this.averages[area] === undefined || this.averages[area] === null) {
      this.averages[area] = score;
    } else {
      this.averages[area] = this.alpha * score + (1 - this.alpha) * this.averages[area];
    }

    if (this.viewedByArea[area] === undefined || this.viewedByArea[area] === null) {
      this.viewedByArea[area] = new Set();
    }
    this.viewedByArea[area].add(question.text);

    this.viewedQuestionTextSet.add(question.text);

    
    if (score < 0.5) {
      // Add to incorrect questions if it's not already there
      if (!this.incorrectQuestionsTextSet.has(question.text)) {
        this.incorrectQuestions.push(question);
        this.incorrectQuestionsTextSet.add(question.text);
      }
    } else {
      // 10% chance of removing from incorrect questions, if it's there
      if (this.incorrectQuestionsTextSet.has(question.text) && Math.random() < 0.1) {
        this.incorrectQuestions = this.incorrectQuestions.filter(q => q.text !== question.text);
        this.incorrectQuestionsTextSet.delete(question.text);
      }
    }


    this.saveMetrics();
  }

  getViewedRatio(): number {
    return this.viewedQuestionTextSet.size / this.questions.length;
  }

  getIncorrectRatio(): number {
    return this.incorrectQuestions.length / this.questions.length;
  }

  getAverageScores(): { [key: string]: number } {
    return this.averages;
  }

  getViewedByArea(): { [key: string]: Set<string> } {
    return this.viewedByArea;
  }

  getQuestionCount(): number {
    return this.questions.length;
  }

  getIncorrectCount(): number {
    return this.incorrectQuestions.length;
  }

  getViewedCount(): number {
    return this.viewedQuestionTextSet.size;
  }

  resetAverages() {
    this.averages = {};
    this.viewedByArea = {};
    this.incorrectQuestions = [];
    this.incorrectQuestionsTextSet = new Set();
    this.viewedQuestionTextSet = new Set();
    this.saveMetrics();
  }

  private saveMetrics() {
    localStorage.setItem('averageScores', JSON.stringify(this.averages));
    // viwedByArea needs to be converted to a dict of arrays
    const viewedByAreaDict: { [key: string]: string[] } = {};
    for (const area in this.viewedByArea) {
      viewedByAreaDict[area] = Array.from(this.viewedByArea[area]);
    }
    localStorage.setItem('viewedByArea', JSON.stringify(viewedByAreaDict));
    localStorage.setItem('incorrectQuestions', JSON.stringify(this.incorrectQuestions));
    localStorage.setItem('incorrectQuestionsTextSet', JSON.stringify(Array.from(this.incorrectQuestionsTextSet)));
    localStorage.setItem('viewedQuestionTextSet', JSON.stringify(Array.from(this.viewedQuestionTextSet)));
  }

  addExtraQuestions(questions: Question[]) {
    // Add extra questions to the list if they have different text
    questions.forEach(question => {
      if (!this.viewedQuestionTextSet.has(question.text)) {
        this.questions.push(question);
      }
    });
  }

  clearCachedQuestions() {
    localStorage.removeItem('questions');
  }

  private loadMetrics() {
    const data = localStorage.getItem('averageScores');
    if (data) {
      this.averages = JSON.parse(data);
    }
    const data2 = localStorage.getItem('viewedByArea');
    if (data2) {
      const viewedByAreaDict = JSON.parse(data2);
      for (const area of Object.keys(viewedByAreaDict)) {
        this.viewedByArea[area] = new Set(viewedByAreaDict[area]);
      }
    }
    const data3 = localStorage.getItem('incorrectQuestions');
    if (data3) {
      this.incorrectQuestions = JSON.parse(data3);
    }
    const data4 = localStorage.getItem('incorrectQuestionsTextSet');
    if (data4) {
      this.incorrectQuestionsTextSet = new Set(JSON.parse(data4));
    }
    const data5 = localStorage.getItem('viewedQuestionTextSet');
    if (data5) {
      this.viewedQuestionTextSet = new Set(JSON.parse(data5));
    }
    const data6 = localStorage.getItem('questions');
    if (data6) {
      this.questions = JSON.parse(data6);
    }
  }
}

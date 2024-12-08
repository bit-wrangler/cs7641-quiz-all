import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  averageScores: { [key: string]: number } = {};
  viewedByArea: { [key: string]: Set<string> } = {};
  averageScoresArray: { key: string, value: number }[] = [];
  countsArray: { key: string, value: number }[] = [];
  displayedColumns: string[] = ['area', 'average', 'count'];

  questionCount: number = 0;
  viewedCount: number = 0;
  viewedRatio: number = 0;
  incorrectCount: number = 0;
  incorrectRatio: number = 0;

  constructor(private quizService: QuizService, private router: Router) { }

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics() {
    this.averageScores = this.quizService.getAverageScores();
    this.viewedByArea = this.quizService.getViewedByArea();
    this.questionCount = this.quizService.getQuestionCount();
    this.viewedCount = this.quizService.getViewedCount();
    this.viewedRatio = this.quizService.getViewedRatio();
    this.incorrectCount = this.quizService.getIncorrectCount();
    this.incorrectRatio = this.quizService.getIncorrectRatio();
    this.updateMetricArrays();

  }

  startQuiz() {
    this.router.navigate(['/quiz']);
  }

  resetAverages() {
    this.quizService.resetAverages();
    this.averageScores = this.quizService.getAverageScores();
    this.viewedByArea = this.quizService.getViewedByArea();
    this.loadMetrics();
  }

  clearCachedQuestions() {
    this.quizService.clearCachedQuestions();
  }

  private updateMetricArrays() {
    this.averageScoresArray = Object.keys(this.averageScores).map(key => ({
      key,
      value: this.averageScores[key],
      count: this.viewedByArea[key].size
    }));
  }
}

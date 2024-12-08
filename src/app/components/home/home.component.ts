import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule,
    MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  selectedAreas = new FormControl();
  averageScores: { [key: string]: number } = {};
  areas: string[] = [];
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
    this.selectAllAreas();
  }

  loadMetrics() {
    this.areas = this.quizService.getAreas();
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
    const selectedAreas = this.selectedAreas.value;
    if (selectedAreas.length === 0) {
      alert('Please select at least one area to start the quiz.');
      return;
    }
    this.router.navigate(['/quiz'], { state: { selectedAreas } });
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

  selectAllAreas() {
    this.selectedAreas.setValue(this.areas);
  }

  selectNoAreas() {
    this.selectedAreas.setValue([]);
  }

  private updateMetricArrays() {
    this.averageScoresArray = this.areas.map(key => ({
      key,
      value: this.averageScores.hasOwnProperty(key) ? this.averageScores[key] : 0,
      count: this.viewedByArea.hasOwnProperty(key) ? this.viewedByArea[key].size : 0
    }));
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Question } from '../../models/question.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  currentQuestion?: Question;
  answered: boolean = false;
  userAnswer: boolean | null = null;

  constructor(private quizService: QuizService, private router: Router) { }

  ngOnInit(): void {
    this.loadNextQuestion();
  }

  loadNextQuestion() {
    const question = this.quizService.getRandomQuestionBoosted(null);
    if (question) {
      this.currentQuestion = question;
      this.answered = false;
      this.userAnswer = null;
    } else {
      // Handle case when there are no questions
      alert('No questions available.');
      this.stopQuiz();
    }
  }

  answer(answer: boolean) {
    this.userAnswer = answer;
    this.answered = true;
    const isCorrect = answer === this.currentQuestion!.true;
    this.quizService.updateAverage(this.currentQuestion!, isCorrect ? 1 : 0);
  }

  nextQuestion() {
    this.loadNextQuestion();
  }

  stopQuiz() {
    this.router.navigate(['/']);
  }
}

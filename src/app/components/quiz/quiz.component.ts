import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
  selectedAreas: string[] = [];
  answered: boolean = false;
  userAnswer: boolean | null = null;
  areaCount: number = 0;

  constructor(private quizService: QuizService, private router: Router, private route: ActivatedRoute) {
    const navState = this.router.getCurrentNavigation()?.extras.state;
    if (navState) {
      const selectedAreas = navState.hasOwnProperty('selectedAreas') ? navState['selectedAreas'] : null;
      if (selectedAreas) {
        this.selectedAreas = selectedAreas;
      }
    }
   }

  ngOnInit(): void {
    if (this.selectedAreas.length === 0) {
      this.selectedAreas = this.quizService.getAreas();
    }

    this.loadNextQuestion();
  }

  // https://chat.openai.com/?q=this+is+a+test+of+the+url+query+functionality+in+chatgpt
  // https://chatgpt.com/?model=gpt-4o&q=This+is+a+test+of+the+URL+query+functionality+in+ChatGPT.

  generateChatGPTUrl(area: string, statement:string, model = "gpt-4o") {
    const baseUrl = "https://chatgpt.com/";
    const promptTemplate = `In the context of ${area}, briefly explain why the following is true or not:\n${statement}`;
    const formattedPrompt = encodeURIComponent(promptTemplate); // Ensures proper URL encoding

    const fullUrl = `${baseUrl}?model=${model}&temporary-chat=true&q=${formattedPrompt}`;
    return fullUrl;
}

  askGPT() {
    const area = this.currentQuestion!.area;
    const statement = this.currentQuestion!.text;
    const url = this.generateChatGPTUrl(area, statement);
    window.open(url, '_blank');
  }

  loadNextQuestion() {
    const question = this.quizService.getRandomQuestionBoosted(this.selectedAreas, null);
    if (question) {
      this.currentQuestion = question;
      this.answered = false;
      this.userAnswer = null;
      this.areaCount = this.quizService.getAreaViewedCount(this.currentQuestion.area);
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

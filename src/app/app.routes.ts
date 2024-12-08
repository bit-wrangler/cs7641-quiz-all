import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { QuizComponent } from './components/quiz/quiz.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
  { path: 'quiz', component: QuizComponent },
  { path: '**', redirectTo: '' } // Wildcard route redirects to home
];

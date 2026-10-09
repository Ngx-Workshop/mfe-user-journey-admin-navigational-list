import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { Routes } from './app/app.routes';
import { appConfig } from './app/app.config';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class Root {}

bootstrapApplication(Root, {
  ...appConfig,
  providers: [...appConfig.providers, provideRouter(Routes)],
}).catch((error) => console.error(error));

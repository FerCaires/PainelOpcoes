import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { OpcoesSectionComponent } from './sections/opcoes-section/opcoes-section.component';
import { RolagemSectionComponent } from './sections/rolagem-section/rolagem-section.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderMenuComponent,
    OpcoesSectionComponent,
    RolagemSectionComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {}

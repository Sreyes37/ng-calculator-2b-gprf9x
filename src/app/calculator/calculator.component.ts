import { Component, OnInit, HostListener } from '@angular/core';
import * as math from 'mathjs';

export type Operator = '-' | '+' | '*' | '/' | '(' | ')';
export type Token = string | number;

function isOperator(token: Token): token is Operator {
  return token === '-' || token === '+' || token === '*' || token === '/' || token === '(' || token === ')';
}

@Component({
  selector: 'ng-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent {
  tokens: Token[] = [];
  previousTokens: Token[] = [];
  
  private clearNext = false;

  private get lastToken(): Token {
    return this.tokens[this.tokens.length - 1];
  }

  private set lastToken(newToken: Token) {
    this.tokens[this.tokens.length - 1] = newToken;
  }

  insertChar(character: string): void {
    // do not allow multiple decimal signs in a single token
    if (character === '.' && this.lastToken !== undefined && this.lastToken.toString().indexOf('.') !== -1) {
      return;
    }

    // clear first if needed
    if (this.clearNext) {
      this.clear();
    }

    if (this.lastToken === undefined || isOperator(this.lastToken)) {
      if (character === '.') {
        character = '0' + character;
      }

      this.tokens.push(character);
    } else {
      this.lastToken += character;
    }
  }

  insertOperator(operator: Operator): void {
    this.tokens.push(operator);
    this.previousTokens = [];
    this.clearNext = false;
  }

  clear(): void {
    this.tokens = [];
    this.previousTokens = [];
    this.clearNext = false;
  }

  delete(): void {
    if (this.lastToken === undefined) {
      return;
    } else if (this.lastToken.toString().length > 1) {
      this.lastToken = this.lastToken.toString().slice(0, -1);
    } else {
      this.tokens.pop();
    }

    this.previousTokens = [];
    this.clearNext = false;
  }

  evaluate(): void {
    // repeat last operation (ANS support)
    if (this.tokens.length === 1 && this.previousTokens.length > 1) {
      this.tokens = this.tokens.concat(this.previousTokens.slice(-2));
    }

    this.previousTokens = this.tokens.slice();
    
    try {
      const result = math.eval(this.tokens.join(' ')) || 0;
      
      if (result === Infinity) {
        this.previousTokens = ['Math error'];
      } else {
        this.tokens = [result];
        this.clearNext = true;
      }
    } catch (e) {
      this.previousTokens = ['Syntax error'];
    }
  }

  // KEYBOARD SUPPORT
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    event.preventDefault();

    // map back to internal notation
    const key = event.key
      .toLowerCase()
      .replace('x', '*')
      .replace(':', '/');

    if (key === 'c') {
      this.clear();
    } else if (key === ',' || key === '.') {
      this.insertChar('.');
    } else if (!isNaN(+key)) {
      this.insertChar(key);
    } else if (key === 'enter') {
      this.evaluate();
    } else if (key === 'delete' || key === 'backspace') {
      this.delete();
    } else if (isOperator(key)) {
      this.insertOperator(key);
    }
  }
}
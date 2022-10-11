import { AfterViewInit, Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})

export class PaginationComponent implements OnInit {
  @Input() curPage: number;
  @Input() lastPage: number;
  @Input() isBlockChainPage: boolean;

  @Output() onPagePrev: EventEmitter<number> = new EventEmitter();
  @Output() onPageNext: EventEmitter<number> = new EventEmitter();
  @Output() onPageSelected: EventEmitter<number> = new EventEmitter();

  cntShowing = 3;
  aryPageShowing: number[] = [];

  constructor() { }

  ngOnInit() {
    this.initializeShowingPageNumber();   
    
  }

  initializeShowingPageNumber() {
    if(this.lastPage > this.cntShowing) {
      this.fillShowingPageNumber(1, this.cntShowing);
    } else {
      this.fillShowingPageNumber(1, this.lastPage);
    }
  }

  fillShowingPageNumber(from: number, to: number) {
    this.aryPageShowing = [];
    if(to > this.lastPage) {
      const diff = Number(to) - Number(this.lastPage);
      from = Number(from) - diff;
      to = this.lastPage;
    } else if(from == 0) {
      from = 1;
      to = to;
    }
    for (let idx = from; idx <= to; idx++) {
      this.aryPageShowing.push(idx);
    }
  }

  pagePrev() {
    if(parseInt(this.curPage.toString()) === 1) {
      return;
    }
    this.curPage = parseInt(this.curPage.toString()) - 1;
    this.onPagePrev.next(this.curPage);
    this.calcPaginAlgorithm();
  }

  pageNext() {
    if(this.curPage === this.lastPage) {
      return;
    }
    this.curPage = parseInt(this.curPage.toString()) + 1;
    this.onPageNext.emit(this.curPage);
    this.calcPaginAlgorithm();
  }

  pageMoving(selectedPage: number) {
    if(this.curPage == selectedPage) {
      return;
    }
    this.curPage = selectedPage;
    this.onPageSelected.emit(selectedPage);
    
    this.calcPaginAlgorithm();
  }

  calcPaginAlgorithm() {
    if(this.aryPageShowing.indexOf(this.curPage) === 0 && this.curPage !== 1) {  // When clicked first page number of pagination
      this.fillShowingPageNumber(this.curPage - Math.floor(this.cntShowing / 2), this.curPage + Math.floor(this.cntShowing / 2));
    } else if(this.aryPageShowing.indexOf(this.curPage) === this.aryPageShowing.length - 1 && this.curPage != this.lastPage) { // When click last page number of pagination
      this.fillShowingPageNumber(this.curPage - Math.floor(this.cntShowing / 2), this.curPage + Math.floor(this.cntShowing / 2));
    }
  }
}
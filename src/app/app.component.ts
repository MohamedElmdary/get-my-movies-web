import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService, Search, Download } from './api.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { timer, Observable, Subscription } from 'rxjs';
import {
  debounce,
  distinctUntilChanged,
  filter,
  map,
  concatAll,
  switchMap
} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  loading = false;
  downloadLoading = false;
  downloadIndex = -1;

  options: Search[];

  searchForm = this.fb.group({
    search: ['']
  });

  get search() {
    return this.searchForm.get('search') as FormControl;
  }

  title: string;

  errorMessage: string;

  table: Download[] = [];
  cols = ['quality', 'size', 'download'];

  options$: Subscription;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit() {
    this.options$ = this.search.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounce(() => timer(200)),
        filter(v => {
          if (!!v) {
            return true;
          }
          this.options = null;
          return false;
        }),
        switchMap(val => {
          return this.apiService.searchApi(val);
        })
      )
      .subscribe(v => {
        this.options = v;
      });
  }

  onChooseMovie({ t, u }: Search) {
    this.errorMessage = null;
    this.title = t;
    this.loading = true;
    this.apiService.qualitiesApi(u).subscribe(
      v => {
        this.table = v;
        this.loading = false;
      },
      err => {
        this.errorMessage = err.error.message;
        this.table = [];
        this.loading = false;
      }
    );
  }

  onDownloadMovie(index: number, [call, auth]: string[]) {
    this.downloadLoading = true;
    this.downloadIndex = index;
    this.apiService.downloadApi(call, auth).subscribe(
      ({ link }) => {
        this.table[index].link = link;
        this.downloadLoading = false;
        this.downloadIndex = -1;
      },
      err => {
        console.log(err);
        this.downloadLoading = false;
        this.downloadIndex = -1;
      }
    );
  }

  ngOnDestroy() {
    this.options$.unsubscribe();
  }
}

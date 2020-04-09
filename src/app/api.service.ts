import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface Search {
  t: string;
  u: string;
}

export interface Download {
  quality: string;
  size: string;
  url: string[];
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  searchApi(query: string) {
    return this.http.get<Search[]>(
      `${environment.api}/search/${encodeURI(query)}`
    );
  }

  qualitiesApi(url: string) {
    return this.http.get<Download[]>(`${environment.api}/qualities/${url}`);
  }

  downloadApi(call: string, auth: string) {
    return this.http.get<{ link: string }>(
      `${environment.api}/download/${call}/${auth}`
    );
  }
}

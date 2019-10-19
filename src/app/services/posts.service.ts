import { Injectable } from '@angular/core';
import { Post } from './../models/post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: Number }>();

  constructor(private _http: HttpClient, private _router: Router) { }

  getPosts(postsPerPage: Number, currentPage: Number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this._http.get<{ message: string, posts: any, maxPosts: Number }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            }
          }), maxPosts: postData.maxPosts
        }
      }))
      .subscribe((transformedPostsData) => {
        console.log(transformedPostsData);
        this.posts = transformedPostsData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostsData.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this._http.get<{ _id: string, title: string, content: string, imagePath: string }>(`http://localhost:3000/api/posts/${id}`);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this._http
      .post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
      .subscribe(responseData => {
        this._router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      }
    }
    this._http.put(`http://localhost:3000/api/posts/${id}`, postData)
      .subscribe(response => {
        this._router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    return this._http.delete(`http://localhost:3000/api/posts/${postId}`);
  }
}
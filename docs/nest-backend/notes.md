# Notes of libraries used in the project

The intention of this file is to save the developer's time when working with some library

## Multer

There is a weird behavior where the `req.body` is empty when sending files to multer.
The solution is to order the request body properties on the client such the files go last.
https://github.com/expressjs/multer/issues/146

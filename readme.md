# Fullstack Blog Project

Personal blogging platform built with **Node.js**, **Express**, **Handlebars** and **MySQL**. This project includes both the **REST API** for managing blog content and a simple **frontend** for creating, editing and viewing posts

> [!NOTE]
> This project uses **JWT authentication stored in httpOnly cookies** (register a user, then log in).

## Setup Instructions
1. Clone the repository
```
git clone https://github.com/trenter39/personal-blog.git
cd personal-blog
```

2. Install packages via **npm**
```
npm install
```

3. Create database and table in **MySQL**. Otherwise, the server will arise database errors
```
create database if not exists personal_blog;

use personal_blog;

create table posts (
    id int primary key auto_increment,
    title varchar(255),
    content text,
    category varchar(100),
    createdAt datetime not null default current_timestamp,
    updatedAt datetime not null default current_timestamp on update current_timestamp
);

create table comments (
    id int primary key auto_increment,
    postID int not null,
    author varchar(100) not null,
    content text not null,
    userID int null,
    createdAt DATETIME not null default current_timestamp,
    updatedAt DATETIME not null default current_timestamp on update current_timestamp,
    foreign key (postID) references posts(id) on delete cascade
);

create table users (
    id int primary key auto_increment,
    email varchar(100) not null unique,
    first_name varchar(150) not null,
    last_name varchar(150) not null,
    passwordHash varchar(255) not null,
    createdAt DATETIME not null default current_timestamp,
    updatedAt DATETIME not null default current_timestamp on update current_timestamp,
    role enum('user', 'admin')
);
```

4. Configure connection to **MySQL** by creating `.env` file in the root folder. `.env` file must contain fields (example with default values):
```
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_NAME=personal_blog
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=random_secret
JWT_EXPIRES_IN=1d
NODE_ENV=production
```

5. Start the server via **node**
```
node app.js
```

Now you can visit website via `http://localhost:8080/`.

![site preview](https://github.com/trenter39/personalblog/blob/master/media/preview.png)
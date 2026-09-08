--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;

CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `category` varchar(100) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES
(1,'Designing a Clean Command Structure for CLI Apps','When I first started building CLI tools in Node.js, all my logic lived in a single file. While this worked for small scripts, it quickly became messy as more commands were added. I realized that without a clear structure, debugging and adding new features would become painful over time.\n\nTo fix this, I separated each command into its own module. The main entry file focused only on reading arguments and routing them to the correct command handler. Each handler then dealt with validation, business logic, and file operations independently. This made the codebase far easier to navigate.\n\nI also introduced a consistent command format, such as add, update, delete and list, each with predictable flags. This helped both usability and testing, since every command followed the same input pattern.\n\nBy organizing the CLI this way, scaling the app became simple. Adding a new command no longer felt risky or confusing. Clean architecture turned a basic script into a real developer tool.','Development','2025-06-20 13:45:20','2026-02-18 12:19:09'),
(2,'Working with MySQL in Node.js Using Async/Await','Connecting Node.js to a relational database was a big step in moving from small projects to real applications. Using mysql2/promise allowed me to write clean asynchronous code instead of dealing with nested callbacks.\n\nI started by creating a reusable database connection module. This centalized configuration like host, user, password, and database name, keeping credentials out of the main logic. From there, every query could be executed with await, making the code must more readable.\n\nThis approach helped me understand how production APIs interact with databases efficiently. Async/await made complex query flows feel almost synchronous, improving both performance andmaintainability.','Backend','2025-08-13 16:40:20','2026-02-18 12:20:15'),
(3,'Validating User Input in Node.js Applications','One of the earliest problems I faced while building APIs was broken data. Users could submit empty fields, invalid IDs, or malformed JSON, which quickly caused crashes or corrupted database records. I learned that strong input validation is not optional - it is a core part of backend stability.\n\nI began by validating request bodies at the contoller level before touching the database. Simple checks for required fields, data types, and length limits prevented most common errors. This immediately reduced bugs and unexpected behavior across the app.\n\nLater, I introduced reusable validation middleware. Instead of repeating checks in every route, I centralized the rules for creating posts, updating records, and filtering queries. This made the API cleaner and easier to scale.\n\nGood validation not only protects your database but also improves the user experience. Clear error messages guide users to fix their input instead of leaving them confused by server failures.','Backend','2025-08-29 18:40:20','2026-02-18 12:20:47'),
(4,'Structuring Express Projects for Long-Term Scalability','At first, my Express apps lived inside one or two files. Routes, database logic, and responses were all mixed together. While this worked for small demos, it quickly became hard to read and even harder to extend.\n\nTo solve this, I separated the project into folders for routes, controllers, services, and database configuration. Routes handled URLs, controllers handled request logic, and services handled reusable business logic. This kept each file focused on one responsibility.\n\nAs the project grew, this structure made onboarding easier - even for myself after time away. I could immediately find where logic lived without scanning giant files.\n\nScalable structure isn\'t about overengineering. It\'s about organizing code so growth feels natural instead of painful.','Development','2025-10-02 12:20:19','2026-02-18 12:21:20'),
(5,'Debugging Node.js Apps Like a Projessional Developer','Debugging used to mean throwing random console.log statements everywhere and hoping something made sense. While helpful at time, this approach quickly became chaotic larger applications.\n\nI started using structured logging to track requests, errors and database responses. Seeing clear logs with timestamps helped me pinpoint where issues occurred instead of guessing.\n\nI also learned to isolate problems by testing endpoints individually using tools like Postman. Verifying one feature at a time made bugs easier to locate and fix.\n\nOver time, debugging became less stressful and more systematic. With good logs and testing habits, problems turned into learning opportunities instead of roadblocks.','Development','2025-10-07 09:10:38','2026-02-18 12:22:04'),
(6,'Implementing Basic Authentication in Node.js API','As soon as my blog API became functional, the next big concern was security. Anyone could create, update, or delete posts, which obviously wasn\'t acceptable for a real application. This pushed me to implement basic authentication and understand how protected routes work.\nI started by adding user accounts with hashed passwords using a secure hashing library. Instead of storing plain text credentials, each password was converted into a hash before saving it in the database. This ensured that even if the database were compromised, real passwords would remain protected.\nNext, I introduced login endpoints that verified credentials and returned authentication tokens. These tokens were required in request headers for sensitive operations like editing or deleting posts. Middleware handled token verification before requests reached controllers.\nAuthentication completely changed how the API behaved. It turned an open playground into a controlled system, making the project feel much closer to real production software.','Backend','2025-10-14 19:08:14','2026-02-19 11:00:41'),
(7,'Optimizing Database Queries for Better API Performance','When my blog platform started pulling more data, I noticed slower response time. Even though everything worked correctly, the user experience suffered. This highlighted how performance matters just as much as functionality.\n\nI began by analyzing which queries ran most frequently. Some endpoints were fetching far more columns than necessary, while others made repeated calls for related data. Reducing unnecessary fields immediately improved speed.\n\nI also learned the importance of indexing commonly searched columns like post IDs and categories. With proper indexes in place, MySQL could locate records much faster without scanning entire tables.\n\nThrough small optimizations, the API became noticeably snappier. It showed me that efficient data handling is a major part of backend engineering.','Backend','2025-11-21 14:44:10','2026-02-18 12:23:20'),
(8,'Handling Errors Gracefully in Express Applications','Early in development, most of my API errors resulted in confusing server crashes or generic messages. This made debugging difficult and provided poor feedback to users. I realized proper error handling was essential for professional applications.\n\nI implemented centralized error handling middleware in Express. Instead of responding directly inside every route, errors were passed to a single handler that formatted clean responses with status codes and messages.\n\nCustom error classes helped differentiate between validation errors, not found errors, and server failures. This made logs clearer and responses more meaningful.\n\nWith structured error handling in place, the app became far more reliable. Bugs were easier to trace, and users received consistent feedback instead of broken endpoints.','Development','2026-01-06 09:12:54','2026-02-18 12:24:44'),
(9,'Using Environment Variables to Secure Configuration in Node.js','As my applications grew, hardcoding configuration values quickly became a problem. Database credentials, API keys, and server ports were scattered across files, which was both insecure and hard to manage across environments.\nI introduced environment variables to store sensitive and environment-specific settings. Using a configuration loader allowed me to keep secrets out of version control while still accessing them easily within the app.\nThis made switching between development and production setups much smoother. Instead of editing code, I only chaned environment values, reducing mistakes and improving deployment safety.\nEnvironment variables became a foundation of every serious project I built. They provided security, flexibility, and cleaner configuration management.','Backend','2026-01-24 17:24:17','2026-02-19 11:00:30'),
(10,'Building Reusable Services in Express Applications','When logic is duplicated across controllers, bugs multiply and updates become tedious. I ran into this problem when working with post creation, updates, and validation spread across multiple routes.\nTo solve it, I introduced service layers that handled business logic separately from request handling. Controllers became thin, focusing only on receiving input and returning responses.\nThis allowed me to reuse core functionality across different endpoints without repeating code. Testing also becam easier since services could be verified independently.\nService-based architecture helped transform simple APIs into clean, maintainable systems that could grow without chaos.','Development','2026-02-01 14:20:17','2026-02-19 11:00:19'),
(11,'Preparing a Node.js Project for Deployment','Getting an app to run locally is one thing, but preparing it for deployment is a different challenge entirely. I had to think about environment configuration, process management, and error resilience.\nI started by creating production-ready scripts and ensuring environment variables were properly loaded. Logging was adjusted to capture important runtime information without cluttering output.\nNext, I configured the server to handle crashes gracefully and restart automatically. This ensure the application remained available even when unexpected errors occurred.\nDeployment forced me to think beyond coding features and focus on reliability. It was the step that tryly made my projects feel real-world ready.','Projects','2026-02-05 08:02:49','2026-02-19 10:38:58'),
(12,'Lessons Learned Building a Fullstack Blog Platform','Turning a simple frontend into a full stack blog platform taught me how many moving parts exist in real applications. Routing, controllers, templates, and database queries all had to work together smoothly.\nOne major lesson was separating concerns properly. Keeping API logic in the backend and rendering logic in Handlebars templates prevented tight coupling. This made debugging much easier when something broke.\nI also ran into performance issues early on by making uncessary database calls. Optimizing queries and reusing data where possible significantly improved page load times.\nMost importantly, I learned how planning architecture early saves time later. Even small design decisions can affect scalability as a project grows.','Projects','2026-02-10 18:47:41','2026-02-19 18:32:14');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `role` enum('user','admin') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;

CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `postID` int NOT NULL,
  `content` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `userID` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `postID` (`postID`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`postID`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
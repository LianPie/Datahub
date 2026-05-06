-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 15, 2025 at 05:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Datahub`
--

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `filepath` varchar(255) NOT NULL,
  `filetype` varchar(100) DEFAULT NULL,
  `filesize` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `share_token` varchar(100) DEFAULT NULL,
  `folder_id` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `user_id`, `filename`, `filepath`, `filetype`, `filesize`, `uploaded_at`, `share_token`, `folder_id`, `is_deleted`) VALUES
(12, 1, 'Dolby Access Installer.exe', 'files/user_1/Red/Dolby Access Installer.exe', 'application/x-dosexec', 1104440, '2025-07-20 16:51:49', '8a4eec4c9ed3905e2c63a495ec96640e', 5, 0),
(13, 6, '10 kb profile.jpg', 'files/user_6/photos/10 kb profile.jpg', 'image/jpeg', 10166, '2025-09-03 16:28:32', NULL, 6, 0);

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE `folders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `folders`
--

INSERT INTO `folders` (`id`, `user_id`, `name`, `created_at`) VALUES
(1, 1, 'dd', '2025-07-15 14:42:28'),
(2, 1, 'games', '2025-07-15 15:01:13'),
(3, 2, 'photos', '2025-07-15 16:10:42'),
(4, 2, 'video', '2025-07-15 17:48:21'),
(5, 1, 'Red', '2025-07-20 16:51:30'),
(6, 6, 'photos', '2025-09-03 16:28:21'),
(7, 6, 'video', '2025-09-03 16:28:40');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `storage_limit` bigint(20) NOT NULL DEFAULT 524288000,
  `storage_used` bigint(20) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`) VALUES
(1, 'Mohit', 'devganiyamohit71115it@gmail.com', '$2y$10$V8sDEjDM8RsmMO6x4CjE3uCspvq6ar25ZjaipMcAjZIx9Gk7mpSmG', '2025-07-15 09:18:34'),
(2, 'admin', 'pr.kkppuukk@gmail.com', '$2y$10$wjBIBAyWF6FL1.Rfs3CiFe2sU0ibCEXVT6tPa9ImWqOvwybZOZ5Uu', '2025-07-15 15:19:13'),
(4, 'd', 'mitulkatariya9406@gmail.com', '$2y$10$YNrIVgNhVz1vuZ5wWoVKBePtNKjdB4rZakt4nlahDuHXuj7FjLH.C', '2025-07-16 05:41:00'),
(5, 'dj', 'vxjhsacjsgavs@gmail.com', '$2y$10$4oeiN3H5coMye.2GpFuBm.itDkSuaDRfM3XE5EZJGBGP1RwJ78sPO', '2025-09-03 16:27:33'),
(6, 'gj', 'gj@kar.com', '$2y$10$vU1a7BuHs9JiHako3pfVCeFlHiyfbEqkOlk9bV9/aPgiyOb68iYM2', '2025-09-03 16:27:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `folders`
--
ALTER TABLE `folders`
  ADD CONSTRAINT `folders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
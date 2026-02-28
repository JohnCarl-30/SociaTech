-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 01, 2025 at 08:19 PM
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
-- Database: `sociatech_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit`
--

CREATE TABLE `audit` (
  `audit_id` int(11) NOT NULL,
  `admin_username` text NOT NULL,
  `action` text NOT NULL,
  `type` text NOT NULL,
  `affected_user` int(11) NOT NULL,
  `action_reason` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit`
--

INSERT INTO `audit` (`audit_id`, `admin_username`, `action`, `type`, `affected_user`, `action_reason`, `timestamp`) VALUES
(1, 'adminKaneshiroo', 'no_action delete_post', 'post', 3, '[\"Spam content\"]', '2025-11-28 14:58:06'),
(2, 'adminKaneshiroo', 'no_action delete_comment', 'comment', 3, '[\"Spam content\"]', '2025-11-28 14:58:23');

-- --------------------------------------------------------

--
-- Table structure for table `blocked_users`
--

CREATE TABLE `blocked_users` (
  `id` int(11) NOT NULL,
  `blocker_id` int(11) NOT NULL,
  `blocked_id` int(11) NOT NULL,
  `blocked_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment_date` datetime NOT NULL,
  `comment_content` text NOT NULL,
  `comment_image` varchar(255) DEFAULT NULL,
  `up_tally_comment` int(11) NOT NULL DEFAULT 0,
  `down_tally_comment` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`comment_id`, `post_id`, `user_id`, `comment_date`, `comment_content`, `comment_image`, `up_tally_comment`, `down_tally_comment`) VALUES
(21, 36, 11725, '2025-11-25 15:57:08', 'hotdog', NULL, 0, 0),
(25, 39, 11725, '2025-11-26 14:18:50', 'tite', NULL, 0, 0),
(37, 43, 11725, '2025-11-27 23:21:59', 'hotfog', NULL, 0, 0),
(43, 53, 11725, '2025-11-28 02:42:20', 'adgav', NULL, 1, 0),
(44, 53, 11725, '2025-11-28 02:52:57', '@adminKaneshiroo dagagaeg', NULL, 1, 0),
(45, 43, 11725, '2025-11-28 15:07:47', 'faasfa', NULL, 0, 0),
(48, 55, 11725, '2025-11-29 19:37:03', 'sample', NULL, 0, 0),
(49, 31, 11725, '2025-11-30 01:48:22', 'gegsegsg', NULL, 1, 0),
(50, 57, 3, '2025-11-30 03:50:27', 'sampleee', NULL, 0, 0),
(51, 31, 3, '2025-11-30 03:50:33', 'sample', NULL, 0, 0),
(52, 76, 11725, '2025-12-01 03:42:32', 'sample', NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `commentvote`
--

CREATE TABLE `commentvote` (
  `cvote_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `vote_type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commentvote`
--

INSERT INTO `commentvote` (`cvote_id`, `user_id`, `comment_id`, `vote_type`) VALUES
(5, 11725, 44, 1),
(6, 11725, 43, 1),
(7, 11725, 49, 1);

-- --------------------------------------------------------

--
-- Table structure for table `draft`
--

CREATE TABLE `draft` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `post_category` varchar(255) NOT NULL,
  `post_title` varchar(255) NOT NULL,
  `post_content` text NOT NULL,
  `post_image` varchar(255) DEFAULT NULL,
  `post_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `draft`
--

INSERT INTO `draft` (`id`, `user_id`, `username`, `profile_image`, `post_category`, `post_title`, `post_content`, `post_image`, `post_date`) VALUES
(13, 11725, 'adminKaneshiroo', NULL, 'Artificial Intelligence', 'sfafs', 'asfasfasf', NULL, '2025-11-30 18:37:37');

-- --------------------------------------------------------

--
-- Table structure for table `email_verifications`
--

CREATE TABLE `email_verifications` (
  `Id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used` tinyint(4) DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_verifications`
--

INSERT INTO `email_verifications` (`Id`, `user_id`, `email`, `token`, `expires_at`, `used`, `verified_at`, `created_at`) VALUES
(1, 3, 'justinepuno62@gmail.com', '989062df8e063a8c03a96f1a3c5a360a2c3f182b2c0da72e3e14c69d0031f8d1', '2025-11-23 09:55:32', 1, '2025-11-23 15:56:06', '2025-11-23 15:55:32'),
(2, 11725, 'punojustinematthew3@gmail.com', '103de2ad71e3394e631bb35d3bcd94d88b92be65c997d689c00b6f0f226956ab', '2025-11-24 02:02:56', 1, '2025-11-24 08:03:10', '2025-11-24 08:02:56'),
(3, 11726, 'desugaming04@gmail.com', '491313d855569922949da2436c5f746d2195b019d8c04c9b799f9ecc0b00fed7', '2025-11-25 08:52:20', 1, '2025-11-25 14:52:31', '2025-11-25 14:52:20');

-- --------------------------------------------------------

--
-- Table structure for table `followers`
--

CREATE TABLE `followers` (
  `id` int(11) NOT NULL,
  `follower_id` int(11) NOT NULL,
  `followed_id` int(11) NOT NULL,
  `followed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `followers`
--

INSERT INTO `followers` (`id`, `follower_id`, `followed_id`, `followed_at`) VALUES
(8, 3, 11725, '2025-11-27 17:15:55'),
(13, 11725, 3, '2025-11-30 19:16:34');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `related_post_id` int(11) DEFAULT NULL,
  `related_comment_id` int(11) DEFAULT NULL,
  `actor_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `type`, `message`, `related_post_id`, `related_comment_id`, `actor_id`, `is_read`, `created_at`) VALUES
(1, 3, 'upvote', 'upvoted your post', 39, NULL, 11725, 1, '2025-11-26 06:41:12'),
(2, 3, 'upvote', 'upvoted your post', 36, NULL, 11725, 1, '2025-11-26 06:41:40'),
(4, 3, 'upvote', 'upvoted your post', 39, NULL, 11725, 1, '2025-11-26 06:42:49'),
(5, 3, 'upvote', 'upvoted your post', 39, NULL, 11725, 1, '2025-11-26 06:42:50'),
(6, 3, 'upvote', 'upvoted your post', 39, NULL, 11725, 1, '2025-11-26 06:42:53'),
(9, 3, 'upvote', 'upvoted your post', 36, NULL, 11725, 1, '2025-11-26 06:54:38'),
(10, 3, 'upvote', 'upvoted your post', 39, NULL, 11725, 1, '2025-11-26 07:00:35'),
(12, 3, 'upvote', 'upvoted your post', 41, NULL, 11725, 1, '2025-11-27 04:52:10'),
(14, 3, 'upvote', 'upvoted your post', 43, NULL, 11725, 1, '2025-11-27 15:36:58'),
(17, 11725, 'upvote', 'upvoted your post', 53, NULL, 3, 1, '2025-11-28 07:28:16'),
(18, 3, 'upvote', 'upvoted your post', 43, NULL, 11725, 1, '2025-11-28 07:28:27'),
(19, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:47:14'),
(20, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:47:23'),
(21, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:53:21'),
(22, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:53:29'),
(23, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:53:32'),
(24, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:30'),
(25, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:32'),
(26, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:34'),
(27, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:41'),
(28, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:44'),
(29, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:47'),
(30, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:49'),
(31, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:51'),
(32, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 16:54:52'),
(33, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:43:40'),
(34, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:43:48'),
(35, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:43:53'),
(36, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:43:54'),
(37, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:43:54'),
(38, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:43:54'),
(39, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:46:07'),
(40, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:46:09'),
(41, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:48:09'),
(42, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:48:10'),
(43, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:48:11'),
(44, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:48:12'),
(45, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:48:15'),
(46, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:48:17'),
(47, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:48:17'),
(48, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 17:48:18'),
(49, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:26:20'),
(50, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:32:13'),
(51, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:32:17'),
(52, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:32:29'),
(53, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:32:32'),
(54, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:32:34'),
(55, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:32:37'),
(56, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:32:39'),
(57, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 18:57:54'),
(58, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:00'),
(59, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:03'),
(60, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:07'),
(61, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:10'),
(62, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:12'),
(63, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:15'),
(64, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:18'),
(65, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:53'),
(66, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:54'),
(67, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:07:54'),
(68, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:10:19'),
(69, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:10:24'),
(70, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:10:26'),
(71, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:10:31'),
(72, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:10:34'),
(73, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:10:37'),
(74, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:00'),
(75, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:03'),
(76, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:09'),
(77, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:10'),
(78, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:12'),
(79, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:15'),
(80, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:19'),
(81, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:26'),
(82, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:30'),
(83, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:38'),
(84, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:44'),
(85, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:47'),
(86, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:50'),
(87, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:52'),
(88, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:54'),
(89, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:57'),
(90, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:14:59'),
(91, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:15:02'),
(92, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:15:04'),
(93, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:15:05'),
(94, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:15:06'),
(95, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:39'),
(96, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:42'),
(97, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:45'),
(98, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:50'),
(99, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:52'),
(100, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:55'),
(101, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:56'),
(102, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:57'),
(103, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:58'),
(104, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:58'),
(105, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:59'),
(106, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:17:59'),
(107, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:00'),
(108, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:00'),
(109, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:00'),
(110, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:01'),
(111, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:01'),
(112, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:02'),
(113, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:03'),
(114, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:05'),
(115, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:06'),
(116, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:06'),
(117, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:06'),
(118, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:07'),
(119, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:07'),
(120, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:08'),
(121, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:08'),
(122, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:08'),
(123, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:09'),
(124, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:09'),
(125, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:10'),
(126, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:10'),
(127, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:10'),
(128, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:11'),
(129, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:13'),
(130, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:14'),
(131, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:14'),
(132, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:16'),
(133, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:18'),
(134, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:18:20'),
(135, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:21'),
(136, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:25'),
(137, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:28'),
(138, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:30'),
(139, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:33'),
(140, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:35'),
(141, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:38'),
(142, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:42'),
(143, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:46'),
(144, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:47'),
(145, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:51'),
(146, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:53'),
(147, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:56'),
(148, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:19:58'),
(149, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:03'),
(150, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:05'),
(151, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:07'),
(152, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:09'),
(153, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:10'),
(154, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:12'),
(155, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:16'),
(156, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:17'),
(157, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:20'),
(158, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:22'),
(159, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:26'),
(160, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:28'),
(161, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:30'),
(162, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:32'),
(163, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:34'),
(164, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:35'),
(165, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:36'),
(166, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:20:40'),
(167, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:29:59'),
(168, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:29:59'),
(169, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:00'),
(170, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:00'),
(171, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:00'),
(172, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:00'),
(173, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:01'),
(174, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:01'),
(175, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:01'),
(176, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:01'),
(177, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:01'),
(178, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:02'),
(179, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:02'),
(180, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:02'),
(181, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:02'),
(182, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:03'),
(183, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:03'),
(184, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:03'),
(185, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:03'),
(186, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:04'),
(187, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:30:04'),
(188, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:40:28'),
(189, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:40:33'),
(190, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:40:46'),
(191, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:40:51'),
(192, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:41:03'),
(193, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:44:24'),
(194, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:44:34'),
(195, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 19:44:41'),
(196, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 21:15:58'),
(197, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 21:16:02'),
(198, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-28 21:19:03'),
(199, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 10:23:42'),
(200, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 10:23:45'),
(201, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 10:23:47'),
(202, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 10:23:49'),
(203, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:44:32'),
(204, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:44:37'),
(205, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:45:12'),
(206, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:45:59'),
(207, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:46:08'),
(208, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:46:23'),
(209, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:49:38'),
(210, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:49:51'),
(211, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:52:16'),
(212, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:52:27'),
(213, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:52:38'),
(214, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:55:47'),
(215, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:55:57'),
(216, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 13:56:51'),
(217, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 14:11:33'),
(218, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 14:13:05'),
(219, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 14:15:21'),
(220, 3, 'upvote', 'upvoted your post', 55, NULL, 11725, 1, '2025-11-29 14:17:00'),
(221, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 18:28:12'),
(222, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 18:31:41'),
(223, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:17:50'),
(224, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:18:04'),
(225, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:18:15'),
(226, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:19:04'),
(227, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:20:47'),
(228, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:20:51'),
(229, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:30:49'),
(230, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:30:57'),
(231, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:31:59'),
(232, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:32:41'),
(233, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:34:22'),
(234, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:43:52'),
(235, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:44:02'),
(236, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:44:16'),
(237, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:44:31'),
(238, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:44:45'),
(239, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:45:40'),
(240, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-29 19:46:05'),
(241, 7, 'upvote', 'upvoted your post', 31, NULL, 11725, 0, '2025-11-30 09:31:41'),
(242, 3, 'upvote', 'upvoted your post', 76, NULL, 11725, 1, '2025-11-30 19:26:19'),
(243, 11725, 'upvote', 'upvoted your post', 74, NULL, 3, 1, '2025-11-30 19:26:27');

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE `post` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_date` datetime NOT NULL,
  `post_category` varchar(50) NOT NULL,
  `post_title` varchar(255) NOT NULL,
  `post_content` text NOT NULL,
  `post_image` varchar(255) DEFAULT NULL,
  `post_visibility` enum('public','followers') DEFAULT 'public',
  `up_tally_post` int(11) NOT NULL DEFAULT 0,
  `down_tally_post` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post`
--

INSERT INTO `post` (`post_id`, `user_id`, `post_date`, `post_category`, `post_title`, `post_content`, `post_image`, `post_visibility`, `up_tally_post`, `down_tally_post`, `created_at`) VALUES
(31, 7, '2025-11-23 23:19:18', 'Virtual Reality', 'How do rewrite the stars?', 'You the feeling na you want to bend the reality, go against destiny and just create your own fate? Yeah I always felt that way', NULL, 'public', 0, 1, '2025-11-28 21:45:29'),
(36, 3, '2025-11-25 03:25:49', 'Cyber Security', 'tanginaaaaaa', 'WIAHIAHWHIAHWIHAWIHIAWA', NULL, 'public', 0, 0, '2025-11-28 21:45:29'),
(39, 3, '2025-11-26 14:17:59', 'Dev Ops', 'I want to learn DevOps', 'Can anyone send me learning materials for devops in the comments', NULL, 'public', 0, 0, '2025-11-28 21:45:29'),
(41, 3, '2025-11-26 18:26:20', 'Artificial Intelligence', 'segwgwgsadvfawsfg', 'efqwefwqefqefqe', NULL, 'public', 0, 0, '2025-11-28 21:45:29'),
(43, 3, '2025-11-26 19:47:48', 'Cyber Security', 'fsafa', 'asfafas', NULL, 'public', 0, 0, '2025-11-28 21:45:29'),
(53, 11725, '2025-11-28 02:05:57', 'Artificial Intelligence', 'sagfa', 'asfaasfafa', NULL, 'public', 0, 0, '2025-11-28 21:45:29'),
(55, 3, '2025-11-28 22:56:50', 'Artificial Intelligence', 'sfasf', 'aafsafa', NULL, 'public', 0, 0, '2025-11-28 21:45:29'),
(56, 11725, '2025-11-29 21:21:59', 'Artificial Intelligence', 'cvgtcvgt', ' bhbb', NULL, 'public', 0, 0, '2025-11-29 13:21:59'),
(57, 11725, '0000-00-00 00:00:00', 'Cyber Security', 'edited', 'hiahihaiwhfihaifhawf', NULL, 'public', 1, 0, '2025-11-29 15:07:25'),
(67, 11725, '2025-12-01 01:38:30', 'Networking', 'sdas', 'asdasdas', NULL, 'public', 1, 0, '2025-11-30 17:38:30'),
(68, 11725, '2025-12-01 02:38:14', 'Artificial Intelligence', 'gdsgd', 'sdgsdgsdg', NULL, 'public', 0, 0, '2025-11-30 18:38:14'),
(69, 11725, '2025-12-01 03:08:32', 'Cyber Security', 'sfafasf', 'asfasfafs', NULL, 'followers', 0, 0, '2025-11-30 19:08:32'),
(70, 11725, '2025-12-01 03:09:00', 'Cloud Engineering', 'fsasfasf', 'asfasfasfa', NULL, 'followers', 0, 0, '2025-11-30 19:09:00'),
(71, 11725, '2025-12-01 03:09:21', 'Software Development', 'sdfafasf', 'asfasfasfa', NULL, 'followers', 0, 0, '2025-11-30 19:09:21'),
(72, 11725, '2025-12-01 03:09:34', 'Software Development', 'sfafasfa', 'asfasfasfa', NULL, 'followers', 0, 0, '2025-11-30 19:09:34'),
(73, 11725, '2025-12-01 03:13:07', 'Cyber Security', 'fsafasf', 'fsafasfasf', NULL, 'public', 0, 0, '2025-11-30 19:13:07'),
(74, 11725, '2025-12-01 03:13:18', 'Cyber Security', 'sdadas', 'sdasdasd', NULL, 'public', 1, 0, '2025-11-30 19:13:18'),
(75, 3, '2025-12-01 03:14:56', 'Artificial Intelligence', 'fafsdaf', 'safafasfasf', NULL, 'public', 0, 0, '2025-11-30 19:14:56'),
(76, 3, '2025-12-01 03:17:16', 'Artificial Intelligence', 'sfaf', 'asfasfasf', NULL, 'followers', 1, 0, '2025-11-30 19:17:16');

-- --------------------------------------------------------

--
-- Table structure for table `postvote`
--

CREATE TABLE `postvote` (
  `vote_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `vote_type` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `postvote`
--

INSERT INTO `postvote` (`vote_id`, `user_id`, `post_id`, `vote_type`) VALUES
(216, 11725, 57, 1),
(242, 11725, 31, 0),
(245, 11725, 67, 1),
(246, 11725, 76, 1),
(247, 3, 74, 1);

-- --------------------------------------------------------

--
-- Table structure for table `quiz`
--

CREATE TABLE `quiz` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `quiz_title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `score` int(11) NOT NULL,
  `date_taken` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz`
--

INSERT INTO `quiz` (`id`, `user_id`, `quiz_id`, `quiz_title`, `category`, `score`, `date_taken`) VALUES
(1, 3, 1, 'AI Assessment 1', 'Artificial Intelligence', 4, '2025-11-26 07:24:57'),
(2, 11725, 1, 'AI Assessment 1', 'Artificial Intelligence', 3, '2025-11-27 10:37:05'),
(3, 11725, 2, 'Cyber Security Assessment 1', 'Cyber Security', 5, '2025-11-27 10:36:17'),
(4, 11725, 5, 'Software Development Assessment 1', 'Software Development', 3, '2025-11-27 11:02:56');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `report_id` int(11) NOT NULL,
  `report_date` datetime NOT NULL,
  `reported_by` int(11) NOT NULL,
  `reported_uid` int(11) NOT NULL,
  `report_reason` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT 'N/A',
  `content_id` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`report_id`, `report_date`, `reported_by`, `reported_uid`, `report_reason`, `type`, `content_id`, `status`) VALUES
(1, '2025-11-28 22:57:08', 11725, 3, '\"[\\\"Spam content\\\"]\"', 'comment', 47, 'resolved'),
(2, '2025-11-28 22:57:15', 11725, 3, '\"[\\\"Spam content\\\"]\"', 'post', 54, 'resolved'),
(3, '2025-11-28 23:17:27', 11725, 3, '\"[\\\"Bullying Harassment\\\"]\"', 'N/A', 0, 'pending'),
(4, '2025-11-28 23:23:16', 11725, 3, '\"[\\\"Nudity or Sexual Content\\\"]\"', 'N/A', 0, 'pending'),
(5, '2025-11-30 00:28:11', 11725, 7, '\"[\\\"Not tech related\\\"]\"', 'post', 31, 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `saved_post`
--

CREATE TABLE `saved_post` (
  `save_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saved_post`
--

INSERT INTO `saved_post` (`save_id`, `user_id`, `post_id`, `saved_at`) VALUES
(12, 11725, 39, '2025-11-28 15:55:50'),
(13, 11725, 55, '2025-11-29 10:24:57'),
(14, 11725, 31, '2025-11-29 16:18:47');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `google_id` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `followers` int(11) NOT NULL DEFAULT 0,
  `reset_token` varchar(64) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `suspended_until` datetime DEFAULT NULL,
  `post_visibility` enum('public','followers') DEFAULT 'public',
  `feed_preference` enum('all','following') DEFAULT 'all'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `fullname`, `username`, `email`, `bio`, `password`, `created_at`, `google_id`, `profile_image`, `followers`, `reset_token`, `reset_token_expires`, `email_verified`, `email_verified_at`, `role`, `status`, `suspended_until`, `post_visibility`, `feed_preference`) VALUES
(2, 'Justine Matthew', 'Puno', 'condeethan@gmail.com', NULL, '$2y$10$375gD7Qb2qsZtXittnJTFe4Mk82dnmJVxANQq31XELPp60iJhORQ2', '2025-11-17 09:20:42', '', '', 0, NULL, NULL, 0, NULL, 'user', 'active', NULL, 'public', 'all'),
(3, 'Matthew Puno', 'Kaneshiroo', 'justinepuno62@gmail.com', NULL, '$2y$10$LXXnL471F5FFw.4VWRpx1.lijy2WEMHaoMt58PCB1JhCPFtSf1JAq', '2025-11-30 19:42:01', '', 'http://localhost/SociaTech/backend/uploads/profile_images/692c9e09b9ece_1764531721.jpg', 0, NULL, NULL, 1, '2025-11-23 15:56:06', 'user', 'active', NULL, 'public', 'all'),
(4, 'tite', 'tite', 'justine123@gmail.com', NULL, '$2y$10$nGORdJBCbNVg98AojRbOZOHrWSHjDjXVqKcyoFx8LZ/eIg.RdpR9S', '2025-11-17 20:08:14', '', '', 0, NULL, NULL, 0, NULL, 'user', 'active', NULL, 'public', 'all'),
(5, 'Kaneshiro Desu', 'Kaneshiro04', 'kaneshiro04@gmail.com', NULL, '$2y$10$AFwdvga26D1N.qHHVw9g8uCqfKZ28jfBzvBZ59IDoMuxdCcLRGrWy', '2025-11-19 11:17:47', '', '', 0, NULL, NULL, 0, NULL, 'user', 'active', NULL, 'public', 'all'),
(6, 'john carl santos', 'jcsantos123', 'jcsantos123@gmail.com', NULL, '$2y$10$et.cEm6mBxwmt3VsceHW.eL0vTfqU43nU1miB8yAVfNAtQscUNRnG', '2025-11-19 14:27:26', '', '', 0, NULL, NULL, 0, NULL, 'user', 'active', NULL, 'public', 'all'),
(7, 'Justine Matthew M. Puno', 'justine.puno.coi', 'justine.puno.coi@pcu.edu.ph', NULL, '$2y$10$zPXIGWeM/xR0pmny0clxBuNa5QwmdH.5zcBmU7Ip3pMBPunupuEmi', '2025-11-21 13:49:19', 'X1fF791Bx7g2Deihi5Etpg7PxQB3', 'https://lh3.googleusercontent.com/a/ACg8ocK7MTsYuBruoy82uBHo5PZvPsHx34cwoonn8SWn1lRODaLX-w=s96-c', 0, NULL, NULL, 0, NULL, 'user', 'active', NULL, 'public', 'all'),
(11725, 'ItzKaneshiro', 'adminKaneshiroo', 'punojustinematthew3@gmail.com', 'THE FIRST EVER ADMIN IN SOCIATECH BTW!', '$2y$10$kcKXVvBFi0lK3J2eD5Y.qelhqGldzEngO3YE5PlVydD7uR5UxYnZi', '2025-11-30 19:25:50', '31VzfUHQZcXIYunGSgBz0uRspWA3', 'http://localhost/SociaTech/backend/uploads/profile_images/69281bdfe9825_1764236255.jpg', 0, NULL, NULL, 1, '2025-11-24 08:03:10', 'admin', 'active', NULL, 'followers', 'all'),
(11726, 'Desuu Kanee', 'Desu04', 'desugaming04@gmail.com', NULL, '$2y$10$D4ILT4Da.i5Qsm.Fxb5SPuBGoUReRZN9n0gBXFHoV7FkaktHNeeUe', '2025-11-26 09:29:46', NULL, NULL, 0, NULL, NULL, 1, '2025-11-25 14:52:31', 'user', 'active', NULL, 'public', 'all');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit`
--
ALTER TABLE `audit`
  ADD PRIMARY KEY (`audit_id`);

--
-- Indexes for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blocked_id` (`blocked_id`),
  ADD KEY `blocker_id` (`blocker_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `commentvote`
--
ALTER TABLE `commentvote`
  ADD PRIMARY KEY (`cvote_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `comment_id` (`comment_id`);

--
-- Indexes for table `draft`
--
ALTER TABLE `draft`
  ADD PRIMARY KEY (`id`),
  ADD KEY `draft_ibfk_1` (`user_id`);

--
-- Indexes for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `followers`
--
ALTER TABLE `followers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `followed_id` (`followed_id`),
  ADD KEY `follower_id` (`follower_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `notifications_ibfk_1` (`user_id`),
  ADD KEY `notifications_ibfk_2` (`related_post_id`),
  ADD KEY `notifications_ibfk_3` (`related_comment_id`),
  ADD KEY `notifications_ibfk_4` (`actor_id`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `postvote`
--
ALTER TABLE `postvote`
  ADD PRIMARY KEY (`vote_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `postvote_ibfk_2` (`post_id`);

--
-- Indexes for table `quiz`
--
ALTER TABLE `quiz`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`report_id`);

--
-- Indexes for table `saved_post`
--
ALTER TABLE `saved_post`
  ADD PRIMARY KEY (`save_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `saved_post_ibfk_2` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit`
--
ALTER TABLE `audit`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `blocked_users`
--
ALTER TABLE `blocked_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `commentvote`
--
ALTER TABLE `commentvote`
  MODIFY `cvote_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `draft`
--
ALTER TABLE `draft`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `followers`
--
ALTER TABLE `followers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=244;

--
-- AUTO_INCREMENT for table `post`
--
ALTER TABLE `post`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `postvote`
--
ALTER TABLE `postvote`
  MODIFY `vote_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=248;

--
-- AUTO_INCREMENT for table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `saved_post`
--
ALTER TABLE `saved_post`
  MODIFY `save_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11727;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD CONSTRAINT `blocked_users_ibfk_1` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blocked_users_ibfk_2` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `commentvote`
--
ALTER TABLE `commentvote`
  ADD CONSTRAINT `commentvote_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `commentvote_ibfk_2` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`comment_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `draft`
--
ALTER TABLE `draft`
  ADD CONSTRAINT `draft_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD CONSTRAINT `email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `followers`
--
ALTER TABLE `followers`
  ADD CONSTRAINT `followers_ibfk_1` FOREIGN KEY (`followed_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `followers_ibfk_2` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`related_post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`related_comment_id`) REFERENCES `comments` (`comment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`actor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `postvote`
--
ALTER TABLE `postvote`
  ADD CONSTRAINT `postvote_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `postvote_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `saved_post`
--
ALTER TABLE `saved_post`
  ADD CONSTRAINT `saved_post_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_post_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

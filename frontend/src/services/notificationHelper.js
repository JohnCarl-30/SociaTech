export const createNotification = async (notificationData) => {
  try {
    const response = await fetch(
      "http://localhost/SociaTech/backend/auth/createNotification.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      }
    );
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

// When someone comments on a post
export const notifyPostComment = async (
  postOwnerId,
  commenterId,
  commenterUsername,
  postId,
  postTitle
) => {
  if (postOwnerId === commenterId) return;

  return await createNotification({
    user_id: postOwnerId,
    type: "comment",
    message: `commented on your post`,
    related_post_id: postId,
    related_comment_id: null,
    actor_id: commenterId,
  });
};

// When someone upvotes a post
export const notifyPostUpvote = async (
  postOwnerId,
  voterId,
  voterUsername,
  postId
) => {
  if (postOwnerId === voterId) return;

  return await createNotification({
    user_id: postOwnerId,
    type: "upvote",
    message: `upvoted your post`,
    related_post_id: postId,
    related_comment_id: null,
    actor_id: voterId,
  });
};

// When someone replies to a comment
export const notifyCommentReply = async (
  commentOwnerId,
  replierId,
  replierUsername,
  postId,
  commentId
) => {
  if (commentOwnerId === replierId) return;

  return await createNotification({
    user_id: commentOwnerId,
    type: "reply",
    message: `replied to your comment`,
    related_post_id: postId,
    related_comment_id: commentId,
    actor_id: replierId,
  });
};

// When someone upvotes a comment
export const notifyCommentUpvote = async (
  commentOwnerId,
  voterId,
  voterUsername,
  postId,
  commentId
) => {
  if (commentOwnerId === voterId) return;

  return await createNotification({
    user_id: commentOwnerId,
    type: "upvote",
    message: `upvoted your comment`,
    related_post_id: postId,
    related_comment_id: commentId,
    actor_id: voterId,
  });
};

// When someone follows you
export const notifyFollow = async (
  followedUserId,
  followerId,
  followerUsername
) => {
  if (followedUserId === followerId) return;

  return await createNotification({
    user_id: followedUserId,
    type: "follow",
    message: `started following you`,
    related_post_id: null,
    related_comment_id: null,
    actor_id: followerId,
  });
};
import { useEffect, useState } from 'react';
import classNames from 'classnames';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import { getComments, removeComment } from './api/fetchComments';
import { getPosts } from './api/fetchPosts';
import { PostsList } from './components/PostsList';
import { PostDetails } from './components/PostDetails';
import { UserSelector } from './components/UserSelector';
import { Loader } from './components/Loader';
import { Post } from './types/Post';
import { Comment } from './types/Comment';
import { Notification } from './types/Notification';

export const App = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [postsNotification, setPostsNotification] =
    useState<Notification>(null);
  const [commentsNotification, setCommentsNotification] =
    useState<Notification>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const selectedPost = posts.find(post => post.id === selectedPostId);

  const handleSelectUser = (userId: number) => {
    setSelectedUserId(userId);

    setPosts([]);
    setSelectedPostId(null);
    setPostsNotification(null);
    setComments([]);
    setCommentsNotification(null);
  };

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    setIsPostsLoading(true);

    getPosts(selectedUserId!)
      .then(fetchedPosts => {
        setPosts(fetchedPosts);

        setPostsNotification(
          fetchedPosts.length === 0
            ? { type: 'warning', message: 'No posts yet' }
            : null,
        );
      })
      .catch(() => {
        setPostsNotification({
          type: 'error',
          message: 'Something went wrong!',
        });
      })
      .finally(() => {
        setIsPostsLoading(false);
      });
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedPostId) {
      setComments([]);
      setCommentsNotification(null);
      setIsCommentsLoading(false);

      return;
    }

    setIsCommentsLoading(true);

    getComments(selectedPostId)
      .then(fetchedComments => {
        setComments(fetchedComments);

        if (fetchedComments.length === 0) {
          setCommentsNotification({
            type: 'warning',
            message: 'No comments yet',
          });
        } else {
          setCommentsNotification(null);
        }
      })
      .catch(() => {
        setCommentsNotification({
          type: 'error',
          message: 'Something went wrong',
        });
      })
      .finally(() => {
        setIsCommentsLoading(false);
      });
  }, [selectedPostId]);

  const addNewComment = (newComment: Comment) => {
    setComments(prev => [...prev, newComment]);
  };

  const deleteComment = (commentId: number) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    removeComment(commentId);
  };

  const showComments = (postId: number) => {
    setSelectedPostId(prev => (prev === postId ? null : postId));
  };

  const closeComments = () => {
    setSelectedPostId(null);
  };

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                <UserSelector
                  selectedUserId={selectedUserId}
                  onSelectUser={handleSelectUser}
                />
              </div>

              <div className="block" data-cy="MainContent">
                {!selectedUserId && (
                  <p data-cy="NoSelectedUser">No user selected</p>
                )}

                {isPostsLoading && <Loader />}

                {postsNotification?.type === 'error' && (
                  <div
                    className="notification is-danger"
                    data-cy="PostsLoadingError"
                  >
                    {postsNotification?.message}
                  </div>
                )}

                {postsNotification?.type === 'warning' && (
                  <div className="notification is-warning" data-cy="NoPostsYet">
                    {postsNotification?.message}
                  </div>
                )}

                {selectedUserId && posts.length > 0 && !isPostsLoading && (
                  <PostsList
                    posts={posts}
                    showComments={showComments}
                    selectedPostId={selectedPostId}
                    closeComments={closeComments}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              { 'Sidebar--open': selectedPostId !== null },
            )}
          >
            {selectedPostId && selectedPost && (
              <div className="tile is-child box is-success ">
                <PostDetails
                  comments={comments}
                  post={selectedPost}
                  addNewComment={addNewComment}
                  deleteComment={deleteComment}
                  notification={commentsNotification}
                  loading={isCommentsLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

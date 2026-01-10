import classNames from 'classnames';
import React, { useState } from 'react';
import { createComment } from '../api/fetchComments';
import { Comment, CommentData } from '../types/Comment';
import { Errors } from '../types/Errors';

interface NewCommentProps {
  addNewComment: (comment: Comment) => void;
  postId: number;
}

export const NewCommentForm: React.FC<NewCommentProps> = ({
  addNewComment,
  postId,
}) => {
  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [commentBody, setCommentBody] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({
    name: null,
    email: null,
    body: null,
    submit: null,
  });

  const showErrorMessage = (field: keyof Errors, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearError = (field: keyof Errors) => {
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setErrors({ name: null, email: null, body: null, submit: null });

    let hasError = false;

    if (!authorName.trim()) {
      showErrorMessage('name', 'Name is required');
      hasError = true;
    }

    if (!authorEmail.trim()) {
      showErrorMessage('email', 'Email is required');
      hasError = true;
    }

    if (!commentBody.trim()) {
      showErrorMessage('body', 'Enter some text');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const newComment: CommentData & { postId: number } = {
      name: authorName,
      email: authorEmail,
      body: commentBody,
      postId,
    };

    setLoading(true);

    createComment(newComment)
      .then(createdComment => {
        addNewComment(createdComment);
        setCommentBody('');
      })
      .catch(() => {
        showErrorMessage('submit', 'Something went wrong. Try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleReset = () => {
    setAuthorName('');
    setAuthorEmail('');
    setCommentBody('');
    setErrors({ name: null, email: null, body: null, submit: null });
  };

  return (
    <form data-cy="NewCommentForm" onSubmit={handleSubmit}>
      <div className="field" data-cy="NameField">
        <label className="label" htmlFor="comment-author-name">
          Author Name
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="name"
            value={authorName}
            id="comment-author-name"
            placeholder="Name Surname"
            className={classNames('input', { ' is-danger': errors.name })}
            onChange={event => {
              setAuthorName(event.target.value);

              if (errors.name && event.target.value.trim()) {
                clearError('name');
              }
            }}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-user" />
          </span>

          {errors.name && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>
        {errors.name && (
          <p className="help is-danger" data-cy="ErrorMessage">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field" data-cy="EmailField">
        <label className="label" htmlFor="comment-author-email">
          Author Email
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="email"
            value={authorEmail}
            id="comment-author-email"
            placeholder="email@test.com"
            className={classNames('input', { ' is-danger': errors.email })}
            onChange={event => {
              setAuthorEmail(event.target.value);

              if (errors.email && event.target.value.trim()) {
                clearError('email');
              }
            }}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-envelope" />
          </span>

          {errors.email && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>
        {errors.email && (
          <p className="help is-danger" data-cy="ErrorMessage">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field" data-cy="BodyField">
        <label className="label" htmlFor="comment-body">
          Comment Text
        </label>

        <div className="control">
          <textarea
            id="comment-body"
            name="body"
            value={commentBody}
            placeholder="Type comment here"
            className={classNames('textarea', { ' is-danger': errors.body })}
            onChange={event => {
              setCommentBody(event.target.value);

              if (errors.body && event.target.value.trim()) {
                clearError('body');
              }
            }}
          />
        </div>

        {errors.body && (
          <p className="help is-danger" data-cy="ErrorMessage">
            {errors.body}
          </p>
        )}
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button
            type="submit"
            className={classNames('button is-link', { 'is-loading': loading })}
          >
            Add
          </button>
        </div>

        <div className="control">
          <button
            type="reset"
            className="button is-link is-light"
            onClick={handleReset}
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};

import { Types } from 'mongoose';
import { Comment } from './comment.model';
import { Project } from '../projects/project.model';
import { Issue } from '../issues/issue.model';
import { OrgRole } from '../../shared/enums/role.enum';
import { BadRequestError, NotFoundError } from '../../errors';
import {
  CreateCommentInput,
  UpdateCommentInput,
} from './comment.validation';

/**
 * Verify project belongs to organization
 */
async function verifyProjectBelongsToOrg(
  orgId: string,
  projectId: string,
): Promise<void> {
  const exists = await Project.exists({
    _id: new Types.ObjectId(projectId),
    organizationId: new Types.ObjectId(orgId),
  });

  if (!exists) {
    throw new NotFoundError('Project not found');
  }
}

/**
 * Verify issue belongs to project
 */
async function verifyIssueBelongsToProject(
  orgId: string,
  projectId: string,
  issueId: string,
): Promise<void> {
  const exists = await Issue.exists({
    _id: new Types.ObjectId(issueId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
  });

  if (!exists) {
    throw new NotFoundError('Issue not found');
  }
}

/**
 * Fetch comment lean (read-only)
 */
async function getCommentByIdLean(
  orgId: string,
  projectId: string,
  issueId: string,
  commentId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const comment = await Comment.findOne({
    _id: new Types.ObjectId(commentId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    issueId: new Types.ObjectId(issueId),
  })
    .populate('authorId', 'name email avatarUrl')
    .lean();

  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  return comment;
}

/**
 * Fetch comment document for mutations
 * NO POPULATE HERE
 */
async function getCommentById(
  orgId: string,
  projectId: string,
  issueId: string,
  commentId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const comment = await Comment.findOne({
    _id: new Types.ObjectId(commentId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    issueId: new Types.ObjectId(issueId),
  });

  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  return comment;
}

/**
 * Create Comment
 */
export async function createComment(
  orgId: string,
  projectId: string,
  issueId: string,
  authorId: string,
  input: CreateCommentInput,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const comment = await Comment.create({
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    issueId: new Types.ObjectId(issueId),
    content: input.content,
    authorId: new Types.ObjectId(authorId),
    createdById: new Types.ObjectId(authorId),
    isEdited: false,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    'authorId',
    'name email avatarUrl',
  );

  if (!populatedComment) {
    throw new NotFoundError('Comment creation failed');
  }

  return populatedComment;
}

/**
 * List Comments
 */
export async function listComments(
  orgId: string,
  projectId: string,
  issueId: string,
  page: number,
  limit: number,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const filter = {
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    issueId: new Types.ObjectId(issueId),
  };

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('authorId', 'name email avatarUrl')
      .lean(),

    Comment.countDocuments(filter),
  ]);

  return {
    data: comments,
    total,
    page,
    limit,
  };
}

/**
 * Get Single Comment
 */
export async function getComment(
  orgId: string,
  projectId: string,
  issueId: string,
  commentId: string,
)
{
  return getCommentByIdLean(orgId, projectId, issueId, commentId);
}


/**
 * Update Comment (Author only)
 */
export async function updateComment(
  orgId: string,
  projectId: string,
  issueId: string,
  commentId: string,
  userId: string,
  input: UpdateCommentInput,
) {
  const comment = await getCommentById(
    orgId,
    projectId,
    issueId,
    commentId,
  );

  if (comment.authorId.toString() !== userId) {
    throw new BadRequestError(
      'Only the comment author can update their own comment',
    );
  }

  if (input.content !== undefined) {
    comment.content = input.content;
    comment.isEdited = true;
  }

  await comment.save();

  const populatedComment = await Comment.findById(comment._id).populate(
    'authorId',
    'name email avatarUrl',
  );

  return populatedComment;
}

/**
 * Delete Comment
 * Author OR ORG_ADMIN OR SUPER_ADMIN
 */
export async function deleteComment(
  orgId: string,
  projectId: string,
  issueId: string,
  commentId: string,
  userId: string,
  userRole: OrgRole,
): Promise<void> {
  const comment = await getCommentById(
    orgId,
    projectId,
    issueId,
    commentId,
  );

  const isAuthor = comment.authorId.toString() === userId;

  const isAdmin =
    userRole === OrgRole.SUPER_ADMIN ||
    userRole === OrgRole.ORG_ADMIN;

  if (!isAuthor && !isAdmin) {
    throw new BadRequestError(
      'Only the comment author or an administrator can delete this comment',
    );
  }

  await comment.softDelete();
}

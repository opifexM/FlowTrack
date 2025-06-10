import { Model } from 'objection';
import LabelModel from '../label/label.model.js';
import StatusModel from '../status/status.model.js';
import UserModel from '../user/user.model.js';

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Status} status
 * @property {User} creator
 * @property {User|null} executor
 * @property {Label[]} labels
 * @property {Date} created_at
 * @property {Date} updated_at
 */

export default class TaskModel extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      status: {
        relation: Model.BelongsToOneRelation,
        modelClass: StatusModel,
        join: {
          from: 'tasks.statusId',
          to: 'statuses.id',
        },
      },

      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },

      executor: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },

      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: LabelModel,
        join: {
          from: 'tasks.id',
          through: {
            from: 'task_labels.taskId',
            to: 'task_labels.labelId',
          },
          to: 'labels.id',
        },
      },
    };
  }

  static get defaultGraph() {
    return '[status, creator, executor, labels]';
  }

  static query(...args) {
    return super.query(...args).withGraphFetched(this.defaultGraph);
  }

  static get modifiers() {
    return {
      byStatus(builder, status) {
        if (status) builder.where('statusId', status);
      },
      byExecutor(builder, executor) {
        if (executor) builder.where('executorId', executor);
      },
      byCreator(builder, userId) {
        if (userId) builder.where('creatorId', userId);
      },
      byLabel(builder, label) {
        if (label) {
          builder
            .distinct('tasks.*')
            .joinRelated('labels')
            .where('labels.id', label);
        }
      },
    };
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('task_labels', (table) => {
    table.increments('id').primary();

    table.integer('taskId').unsigned().notNullable();
    table.foreign('taskId').references('id').inTable('tasks').onDelete('CASCADE');

    table.integer('labelId').unsigned().notNullable();
    table.foreign('labelId').references('id').inTable('labels').onDelete('RESTRICT');

    table.unique(['taskId', 'labelId']);

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('task_labels');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.text('description');

    table.integer('statusId').unsigned().notNullable();
    table.foreign('statusId').references('id').inTable('statuses').onDelete('RESTRICT');

    table.integer('creatorId').unsigned().notNullable();
    table.foreign('creatorId').references('id').inTable('users').onDelete('RESTRICT');

    table.integer('executorId').unsigned().nullable();
    table.foreign('executorId').references('id').inTable('users').onDelete('RESTRICT');

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tasks');
};

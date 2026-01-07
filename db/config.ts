import { defineDb, defineTable, column } from 'astro:db';

const ResolutionCodes = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    createdAt: column.date(),
    expirationAt: column.date(),
  }
});

const OAuthClients = defineTable({
  columns: {
    client_id: column.text({ primaryKey: true }),
    client_secret: column.text(),
  }
});

const OAuthCodes = defineTable({
  columns: {
    code_id: column.text({ primaryKey: true }),
    client_id: column.text({ references: () => OAuthClients.columns.client_id }),
    callback_url: column.text(),
    scope: column.text(),
  }
});

const OAuthTokens = defineTable({
  columns: {
    access_token: column.text({ primaryKey: true }),
    token_type: column.text(),
    scope: column.text(),
    refresh_token: column.text(),
  }
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    ResolutionCodes,
    OAuthClients,
    OAuthCodes,
    OAuthTokens
  }
});

# Migration Plan: DynamoDB to PostgreSQL RDS

## Database Connection Details
- Host: database-1.cjius0swscpx.us-east-1.rds.amazonaws.com
- Engine: PostgreSQL
- Region: us-east-1

## Required Changes

### 1. Schema Definition
```sql
CREATE TABLE notes (
    user_id VARCHAR(255) NOT NULL,
    note_id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_id ON notes(user_id);
CREATE INDEX idx_note_id ON notes(note_id);
```

### 2. Dependencies to Add (package.json)
```json
{
  "dependencies": {
    "pg": "^8.11.0",
    "pg-pool": "^3.6.0"
  }
}
```

### 3. Environment Variables to Add (serverless.yml)
```yaml
provider:
  environment:
    DB_HOST: database-1.cjius0swscpx.us-east-1.rds.amazonaws.com
    DB_PORT: 5432
    DB_NAME: notes_db
    DB_USER: ${ssm:/notes/db_user}
    DB_PASSWORD: ${ssm:/notes/db_password}
```

### 4. Required Code Changes

#### Create a new database utility file (api/db.js)
```javascript
const { Pool } = require('pg');

let pool;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
};

module.exports = {
  query: (text, params) => getPool().query(text, params)
};
```

#### Update API Handlers

Replace DynamoDB operations with PostgreSQL queries:

1. get-notes.js:
```javascript
const db = require('./db');

// Replace DynamoDB scan with
const result = await db.query(
  'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
  [userId]
);
```

2. add-note.js:
```javascript
const result = await db.query(
  'INSERT INTO notes (user_id, note_id, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
  [userId, noteId, title, content]
);
```

3. update-note.js:
```javascript
const result = await db.query(
  'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE note_id = $3 AND user_id = $4 RETURNING *',
  [title, content, noteId, userId]
);
```

4. delete-note.js:
```javascript
const result = await db.query(
  'DELETE FROM notes WHERE note_id = $1 AND user_id = $2',
  [noteId, userId]
);
```

### 5. Security Group Updates
- Create a new security group for RDS
- Allow inbound traffic on port 5432 from Lambda security group
- Update Lambda security group to allow outbound traffic to RDS security group

### 6. IAM Updates (serverless.yml)
Remove DynamoDB permissions and add:
```yaml
- Effect: Allow
  Action:
    - rds-db:connect
  Resource: arn:aws:rds:us-east-1:*:database-1
```

### 7. Migration Steps
1. Create PostgreSQL database and schema
2. Deploy new Lambda code with RDS connection
3. Migrate existing data from DynamoDB to PostgreSQL
4. Test all endpoints
5. Remove DynamoDB table after successful migration

### 8. Rollback Plan
- Keep DynamoDB table until successful verification
- Maintain old code version for quick rollback
- Monitor application metrics during migration
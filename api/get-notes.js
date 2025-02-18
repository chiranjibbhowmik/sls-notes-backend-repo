/**
 * Route: GET /notes
 */

const util = require('./util.js');
const db = require('./db');

exports.handler = async (event) => {
    try {
        let query = event.queryStringParameters;
        let limit = query && query.limit ? parseInt(query.limit) : 5;
        let user_id = util.getUserId(event.headers);

        const offset = query && query.start ? parseInt(query.start) : 0;
        const { rows } = await db.query(
            'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [user_id, limit, offset]
        );

        const data = {
            Items: rows,
            Count: rows.length,
            ScannedCount: rows.length
        };

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.log("Error", err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
};
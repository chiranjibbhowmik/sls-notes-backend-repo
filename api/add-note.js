/**
 * Route: POST /note
 */

const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const util = require('./util.js');
const db = require('./db');

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        item.user_id = util.getUserId(event.headers);
        item.user_name = util.getUserName(event.headers);
        item.note_id = uuidv4();
        item.timestamp = moment().unix();
        item.expires = moment().add(90, 'days').unix();

        const result = await db.query(
            'INSERT INTO notes (user_id, note_id, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
            [item.user_id, item.note_id, item.title, item.content]
        );

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                Item: result.rows[0]
            })
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
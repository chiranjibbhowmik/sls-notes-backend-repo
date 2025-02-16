/**
 * Route: POST /note
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const moment = require('moment');
const uuidv4 = require('uuid/v4');
const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        console.log('Parsed request body');

        item.user_id = util.getUserId(event.headers);
        item.user_name = util.getUserName(event.headers);
        console.log('Added user details');

        item.note_id = item.user_id + ':' + uuidv4()
        item.timestamp = moment().unix();
        item.expires = moment().add(90, 'days').unix();
        console.log('Added note metadata');

        let data = await dynamodb.put({
            TableName: tableName,
            Item: item
        }).promise();
        console.log('DynamoDB operation completed');

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(item)
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
}
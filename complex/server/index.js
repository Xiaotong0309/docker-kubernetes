const keys = require('./keys')

//express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors()); //get request from one domain to another domain
app.use(bodyParser.json());

//postgres client setup
const { Pool } = require('pg');
const pgClinet = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClinet.on('error', () => console.log('Lost PG connection'));

pgClinet.query('CREATE TABLE IF NOT EXISTS values (number INT)')
.catch(err => console.log(err));

//redis client setup
const redis = require('redis')

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000       //1s    
});
const redisPublisher = redisClient.duplicate();

//express route handlers
app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClinet.query('SELECT * FROM values');;
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;
    if(parseInt(index) > 40) {
        return res.status(422).send('Index too high');       
    }
    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClinet.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send( {working: true});
});

app.listen(5000, err => {
    console.log('Listening');
});

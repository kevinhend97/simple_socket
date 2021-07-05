var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');

  
var server   = require('http').Server(app);
var io       = require('socket.io')(server);

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	req.io = io;
	next();
});
  
  
// Default route
app.get('/', function (req, res) {
    res.sendfile('index.html');
});
// Konfigurasi koneksi
var dbConn = mysql.createConnection({
    host: 'localhost',
    port:'8889',
    user: 'root',
    password: 'root',
    database: 'logpdamc_pres'
});
  
// Koneksi ke database
dbConn.connect(); 
 
 
// Menampilkan data all user
app.get('/tekanan', function (req, res) {
    dbConn.query('SELECT * FROM tb_pdam9', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'List data users.' });
    });
});
 

 
 
// Menambahkan user baru 
app.post('/tekanan', function (req, res) {
  
    let tekanan = req.body.tek;
  
    if (!tekanan) {
        return res.status(400).send({ error:true, message: 'Silakan isikan parameter user' });
    }
  
    dbConn.query("INSERT INTO tb_pdam9 SET ? ", { tek: tekanan, wkt: req.body.wkt, tgl: req.body.tgl }, function (error, results, fields) {
        if (error) throw error;
        req.io.sockets.emit('valueDefault', [{tek: tekanan, wkt: req.body.wkt, tgl: req.body.tgl}]);
        return res.status(201).send({ error: false, data: results, message: 'Tekanan baru berhasil ditambahkan.' });
    });
});

io.on("connection", (socket) => {
    
    console.log("connect to Socket io");
    dbConn.query('SELECT wkt,tgl,tek FROM tb_pdam9', function (error, results, fields) {
        if (error) throw error;
        socket.emit('valueDefault', results)
        // return res.send(results);
    });
});

 

// Set port
// Start
server.listen(3000);
console.log('Open http://localhost:3000');
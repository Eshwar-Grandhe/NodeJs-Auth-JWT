const express = require('express');
const app = express();
const path = require('path');
const bodyParser =  require('body-parser');
const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const PORT = 3000;

const secretKey = "This is my secret key";
const jwtMw = exjwt({
    secret:secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id:1,
        username:'ash',
        password: '123'
    },
    {
        id:2,
        username:'sean',
        password: '321'
    },
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers','Content-type,Authorization');
    next();
})

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/api/dashboard', jwtMw, (req,res)=>{
    res.json({
        success:true,
        myContent:'Secret content that only logged in people can see',
    });
});

app.get('/api/prices', jwtMw, (req,res)=>{
    res.json({
        success:true,
        myContent:'This is the price $3.99',
    });
});

app.get('/api/settings', jwtMw, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the settings route'
    });
});

app.post('/api/login',(req,res)=>{
    const {username, password } = req.body;
    let token;
    for(let user of users){
        if(username == user.username && password == user.password){
            token = jwt.sign({id: user.id,username:user.username}, secretKey,{expiresIn: '60s'});
            break;
        }
    }
    if(token)
    {
        res.json({
            success:true,
            err:null,
            token
        });
    }else
    {
        res.status(401).json({
            success:false,
            token:null,
            err:'Username or password is incorrect'
        });
    }
});

app.use( (err, req, res, next)=>{
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    if(err.name === 'UnauthorizedError'){
        res.status(401).json({
            success:false,
            officalError:err,
            err: 'Username or password is incorrect 2'
        })
    }else{
        next(err);
    }
})

app.listen(PORT,(req, res)=>{
    console.log('Server is running on '+PORT);
});

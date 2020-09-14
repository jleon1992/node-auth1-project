const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

const usersRouter = require("../users/users-router.js");
const authRouter = require("../auth/auth-router.js");
const dbConnection = require("../data/connection.js");
const protected = require("../auth/protected-mw.js");

const server = express();

const sessionConfiguration = {
    name: "monster",
    secret: "keep it secret, keep it safe!",
    cookie: {
        maxAge: 1000 * 60 * 10, // after 10 mins the cookie expires
        secure: process.env.COOKIE_SECURE || false, // if true cookie is only sent over https
        httpOnly: true, // JS cannot touch this cookie
    },
    resave: false,
    saveUninitialized: true, // GDPR Compliance, the client should drive this
    store: new KnexSessionStore({
        knex: dbConnection,
        tablename: "sessions",
        sidfieldname: "sid",
        createtable: true,
        clearInterval: 1000 * 60 * 60, // delete expired sessions every hour
    }),
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfiguration));

server.use("/api/users", protected, usersRouter);
server.use("/api/auth", authRouter);

server.get("/", (req, res) => {
    res.json({ api: "up" });
});



module.exports = server;

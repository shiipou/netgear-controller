/**
 * Base Vars
 */
const PASSWORD = "MyVerySecuredPassword";

/**
 * Connexion Vars
 */
const SCHEMA = "http";
const HOST = 'm.home';
const ROUTER_URI = SCHEMA + '://' + HOST;

/**
 * API Vars
 */
const API_URI = ROUTER_URI + '/api';
const MODEL_URI = API_URI + '/model.json';
const INTERNALAPI = '?internalapi=1'
const CONFIG_URI = ROUTER_URI + '/Forms/config';

/* Get the Request Object to call Router */
const r = require('request');

let token = null; // Token to connect to router
let user_role = null;

let jar = r.jar(); //Cookie jar

r({
    method: 'GET',
    url: MODEL_URI + INTERNALAPI,
    jar: jar
}, (err, resp, body) => {
    if (err) throw new Error(err);

    let json = JSON.parse(body);
    token = json.session.secToken;
    user_role = json.session.userRole;
    console.log('4G status:', json.wwan.connection);
    if (json.wwan.connection != 'Connected') {
        if (user_role == 'Guest') {
            r.post({
                url: CONFIG_URI,
                jar: jar,
                form: {
                    "token": token,
                    "session.password": PASSWORD
                }
            }, function (err, resp, body) {
                if (err) throw new Error(err);

                r({
                    method: 'GET',
                    url: MODEL_URI + INTERNALAPI,
                    jar: jar
                }, (err, resp, body) => {
                    if (err) throw new Error(err);

                    let json = JSON.parse(body);
                    token = json.session.secToken;
                    user_role = json.session.userRole;

                    console.log('Connected as', user_role);
                    if (user_role == 'Admin') {
                        r.post({
                            url: CONFIG_URI,
                            jar: jar,
                            form: {
                                "token": token,
                                "general.shutdown": "restart"
                            }
                        }, function (err, resp, body) {
                            if (err) throw new Error(err);
                            console.log("Restarting...");
                        });
                    }
                });
            });
        }
    }
});

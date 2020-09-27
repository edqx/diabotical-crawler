const fetch = require("node-fetch");

const BASE_API = "https://diabotical.com/api/v0";

async function safeFetch(url, options) {
    try {
        return await fetch(url, options);
    } catch (e) {
        if (~e.toString().indexOf("ETIMEDOUT")) {
            console.error("Request timedout, retrying..");
            
            return await safeFetch(url, options);
        }

        throw e;
    }
}

async function getMatches(uid) {
    const res = await safeFetch(BASE_API + "/users/" + uid + "/matches");

    if (res.status !== 200) {
        return null;
    }

    const json = await res.json();

    return json.matches;
}

async function getMatch(mid) {
    const res = await safeFetch(BASE_API + "/match/" + mid);

    if (res.status !== 200) {
        return null;
    }

    const json = await res.json();

    return json.match;
}

module.exports = { getMatches, getMatch }
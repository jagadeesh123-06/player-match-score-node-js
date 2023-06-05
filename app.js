const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let db = null;


const initializeDbAndServer = async () => {
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server is started at http://localhost:3000/");
        })
    }
    catch(error){
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};
initializeDbAndServer();

const convertPlayerDbObjectIntoResponseObject = (dbObject) => {
    return {
        playerId: dbObject.player_id,
        playerName: dbObject.player_name,
    }
}
const convertMatchDbObjectIntoResponseObject = (dbObject) => {

  return {

    matchId: dbObject.match_id,

    match: dbObject.match,

    year: dbObject.year,

  };

};

const convertPlayerMatchDbjectIntoResponseObject = (dbObject) => {

  return {

    playerMatchId: dbObject.player_match_id,

    playerId: dbObject.player_id,

    matchId: dbObject.match_id,

    score: dbObject.score,

    fours: dbObject.fours,

    sixes: dbObject.sixes,

  };

};

app.get("/players/", async (request, response) => {
    const playersQuery = `
    SELECT 
        * 
    FROM 
        player_details;
    `;
    const playersArray = await db.all(playersQuery);
    response.send(
        playersArray.map((each) => convertPlayerDbObjectIntoResponseObject(each))
    );
})

app.get("/players/:playerId/", async (request, response) => {
    const {playerId} = request.params;
    const playerQuery = `
    SELECT 
        * 
    FROM 
        player_details
    WHERE 
        player_id = ${playerId};
    `;
    const playerArray = await db.get(playerQuery);
    response.send(convertPlayerDbObjectIntoResponseObject(playerArray));
});

app.put("/players/:playerId/", async (request, response) => {
    const {playerId} = request.params;
    const playerDetails = request.body;
    const {playerName} = playerDetails;
    const updatePlayerQuery = `
    UPDATE 
        player_details
    SET 
        player_name = '${playerName}'
    WHERE 
        player_id = '${playerId}';
    `;
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");    
});

app.get("/matches/:matchId/",async (request, response) => {
    const { matchId } = request.params;
    const matchQuery = `
    SELECT 
        * 
    FROM 
        match_details
    WHERE
        match_id = '${matchId}';
    `;
    const matchArray = await db.get(matchQuery);
    response.send(convertMatchDbObjectIntoResponseObject(matchArray));
});

app.get("/players/:playerId/matches",async (request, response) => {
    const {playerId} = request.params;
    const playerMatchQuery = `
    SELECT 
        *
    FROM 
        player_match_score NATURAL JOIN match_details
    WHERE 
        player_id = '${playerId}';
    `;
    const playerMatchDetailsArray = await db.all(playerMatchQuery);
    response.send(playerMatchDetailsArray.map((each) => convertMatchDbObjectIntoResponseObject(each)))
});

app.get("/matches/:matchId/players", async (request, response) => {
    const {matchId} = request.params;
    const playersQuery = `
    SELECT 
        *
    FROM 
        player_match_score NATURAL JOIN player_details
    WHERE 
        match_id = '${matchId}';
    `;
    const playersArray = await db.all(playersQuery);
    response.send(playersArray.map((each) => convertPlayerDbObjectIntoResponseObject(each)));
});

app.get("/players/:playerId/playerScores",async (request, response) => {
    const {playerId} = request.params;
    const ansQuery = `
    SELECT
        player_details.player_id AS playerId,

        player_details.player_name AS playerName,

        SUM(player_match_score.score) AS totalScore,

        SUM(fours) AS totalFours,

        SUM(sixes) AS totalSixes

    FROM

        player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id

    WHERE

        player_details.player_id = ${playerId}

    `;
    const reqArray =await db.get(ansQuery);
    response.send(reqArray);
});
module.exports = app;

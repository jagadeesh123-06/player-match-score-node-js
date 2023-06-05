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
const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const snakeToCamel = (list) => {
  return {
    playerId: list.player_id,
    playerName: list.player_name,
    jerseyNumber: list.jersey_number,
    role: list.role,
  };
};

// GET ALL PLAYERS

app.get("/players/", async (request, response) => {
  const query = `
    SELECT 
    * 
    FROM 
    cricket_team
    ORDER BY 
    player_id;`;
  const playerList = await db.all(query);
  response.send(playerList.map((list) => snakeToCamel(list)));
});

// POST CREATE A NEW PLAYER

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId, playerName, jerseyNumber, role } = playerDetails;
  const query = `
  INSERT INTO 
  cricket_team(player_id,player_name,jersey_number,role)
  VALUES (
    ${playerName},
    ${jerseyNumber},
    ${role}  
    );`;
  await db.run(query);
  response.send("Player Add Successfully");
});

// GET BY PLAYER ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `
  SELECT 
  * 
  FROM 
  cricket_team 
  WHERE 
  player_id = ${playerId};`;
  const dbResponse = await db.get(query);
  response.send(snakeToCamel(dbResponse));
});

// PUT UPDATED PLAYERS BY ID

app.put("/players/:playersId/", async (request, response) => {
  const { playersId } = request.params;
  const playerDetails = request.body;
  const { playerId, playerName, jerseyNumber, role } = playerDetails;
  const query = `
    UPDATE
      cricket_team
    SET
      player_id = ${playerId},
      player_name='${playerName}',
      jersey_number='${jerseyNumber}',
      role='${role}',
    WHERE 
      player_id = ${playersId};`;
  await db.run(query);
  response.send("Team Updated Successfully");
});

// DELETE BY PLAYER ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    DELETE FROM 
    cricket_team 
    WHERE 
    player_id = ${playerId};`;
  await db.run(query);
  response.send("Player Removed");
});

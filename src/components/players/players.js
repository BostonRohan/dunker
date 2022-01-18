import { useState } from "react";
import { getPlayerID } from "../../app/getPlayerId";
import Player from "./player";
import axios from "axios";
import "./styles.css";

function Players({ allPlayers, width }) {
  const defaultState = { id: 0, name: "", imageID: 0, stats: [] };
  const [firstPlayer, setFirstPlayer] = useState(defaultState);
  const [secondPlayer, setSecondPlayer] = useState(defaultState);
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);

  const handleSubmit = () => {
    //If there is not a first and/or second player fetch the api, when the user clicks submit
    if (firstPlayer.id === 0 || secondPlayer.id === 0) {
      axios
        .get(`https://www.balldontlie.io/api/v1/players?search=${input}`)
        .then((res) => {
          setResult(res.data.data);
          setInput("");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return;
    }
  };
  const handleClick = (player) => {
    if (player === "first") {
      setFirstPlayer(defaultState);
    } else {
      setSecondPlayer(defaultState);
    }
  };
  const handleSelect = (id, name, imageID) => {
    axios
      .get(
        `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${id}`
      )
      .then((res) => {
        let tempData = res.data.data.map((stat) => {
          //Fixing incorrect percentage data coming from api
          stat.fg_pct = (stat.fg_pct * 100).toFixed(1);
          stat.ft_pct = (stat.ft_pct * 100).toFixed(1);
          stat.fg3_pct = (stat.fg3_pct * 100).toFixed(1);
          delete stat.player_id;
          delete stat.season;
          return Object.values(stat);
        });
        const newState = {
          id: id,
          name: name,
          imageID: imageID,
          stats: [...tempData],
        };
        firstPlayer.id === 0
          ? setFirstPlayer(newState)
          : setSecondPlayer(newState);
      });
  };
  return (
    <section className="Players">
      <div className="container">
        <div className="compare">
          <div
            className="player"
            onClick={() => {
              handleClick("first");
            }}
          >
            <Player player={firstPlayer} />
          </div>
          <div className="player" onClick={handleClick}>
            <Player player={secondPlayer} />
          </div>
        </div>
        <section>
          <p>*Historic players or seasons currently not supported</p>
          <input
            type="text"
            placeholder="Name"
            value={input || ""}
            onChange={(e) => setInput(e.target.value)}
          />
          <input type="submit" value="Submit" onClick={handleSubmit} />
          <table className="select">
            <thead>
              <tr>
                <td>Player</td>
              </tr>
            </thead>
            <tbody>
              {result.map((player) => {
                const name = player.first_name + " " + player.last_name;
                const imageID = getPlayerID(allPlayers, name);
                return (
                  <tr
                    key={player.id}
                    onClick={() => handleSelect(player.id, name, imageID)}
                  >
                    <td>
                      {width > 600 && imageID && (
                        <img
                          src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${imageID}.png`}
                          alt=""
                        />
                      )}
                      {width < 600
                        ? `${player.first_name[0]}. ${player.last_name}`
                        : name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </section>
  );
}
export default Players;

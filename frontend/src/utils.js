export const getPlayerImage = (code, size = "110x140") =>
  `https://resources.premierleague.com/premierleague25/photos/players/${size}/${code}.png`;

export const handlePlayerImageError = (e, player, size = "110x140") => {
  const currentSrc = e.target.src;
  if (currentSrc.includes("premierleague/photos")) {
    // Try premierleague with 'p'
    e.target.src = `https://resources.premierleague.com/premierleague/photos/players/${size}/p${player.code}.png`;
  } else {
    // Fallback to shirt (if it was some other url)
    e.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.team_code}-66.png`;
  }
};

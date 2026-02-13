/**
 * Utilidades para la generación de Brackets (Llaves)
 */

export const getNextPowerOfTwo = (n) => {
    if (n <= 2) return 2;
    if (n <= 4) return 4;
    if (n <= 8) return 8;
    if (n <= 16) return 16;
    if (n <= 32) return 32;
    return 64;
};

export const generateInitialRounds = (teams) => {
    const numTeams = teams.length;
    const bracketSize = getNextPowerOfTwo(numTeams);
    const numMatches = bracketSize / 2;

    // Barajar equipos aleatoriamente para el sorteo
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    const matches = [];
    for (let i = 0; i < numMatches; i++) {
        matches.push({
            id: i + 1,
            team1: shuffledTeams[i * 2] || { nombre: 'POR DEFINIR', placeholder: true },
            team2: shuffledTeams[i * 2 + 1] || { nombre: 'POR DEFINIR', placeholder: true },
            score1: null,
            score2: null,
            winner: null,
            round: 1
        });
    }

    return matches;
};

export const getRoundName = (round, totalRounds) => {
    const remaining = totalRounds - round;
    if (remaining === 0) return "FINAL";
    if (remaining === 1) return "SEMIFINAL";
    if (remaining === 2) return "CUARTOS DE FINAL";
    if (remaining === 3) return "OCTAVOS DE FINAL";
    return `RONDA ${round}`;
};

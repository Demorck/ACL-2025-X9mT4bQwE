
export function routeLogOut(req, res) {
    // Suppression du cookies contenant le token
    res.cookie("accesToken", null);

    // Suppression du token dans la bdd
    const { token } = req.body;
    if(tokenExists(token)) {
        suppressionToken(token);
    } else {
        console.error("Erreur lors de la suppression du token dans la bdd (token toujours actif)");
    }

    res.redirect("/");
}

async function tokenExists(token) {
    try {
        const data = await fs.readFile("./server/database/accounts.json", "utf-8");
        const users = JSON.parse(data);
        const found = users.find((user) => user.token === token);
        return Boolean(found);
    } catch (error) {
        console.error("Erreur lors de la suppresion du token", error);
        return false;
    }
}

async function suppressionToken(token) {
    const data = await fs.readFile("./server/database/accounts.json", "utf-8");
    const users = JSON.parse(data);
    const user = users.find((user) => user.token === token);
    user.token="";
}
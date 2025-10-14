import { promises as fs } from "fs";



export function routeRegister(req, res) {

    res.render("register/register");
}

export async function routesCreateAccount(req, res){
    const { username, password } = req.body;
    let boolean = await loginExists(username);
    if(boolean){
        res.render("register/register", {
        username,
        message: "Ce nom n'est pas disponible.",
        });
    }else{
        const user = {
            id: await getNewID(),
            username,
            password,
            token: "",
        };
        await addUser(user);
        res.redirect("/agendas");
    }
}




async function loginExists(userName) {
  try {
    const data = await fs.readFile("./server/database/accounts.json", "utf-8");
    const users = JSON.parse(data);
    const found = users.find((user) => user.username === userName);
    return Boolean(found); 
  } catch (error) {
    console.error("Erreur de lecture du fichier :", error);
    return false;
  }
}

export async function addUser(newUser) {
  try {
    const data = await fs.readFile("./server/database/accounts.json", "utf-8");
    const users = JSON.parse(data);

    users.push(newUser);

    await fs.writeFile("./server/database/accounts.json", JSON.stringify(users, null, 4), "utf-8");
  } catch (error) {
    console.error("Erreur d’ajout :", error);
  }
}

export async function getNewID(){
    const data = await fs.readFile("./server/database/accounts.json", "utf-8");
    const users = JSON.parse(data);
    let nextId = 0;
    if (users.length === 0) {
        nextId = "1";
    } else {
        const lastId = Number(users[users.length - 1].id);
        nextId = String(lastId + 1);
    }
    console.log("ID : " + nextId);
    return nextId;

}

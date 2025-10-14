export function routeRegister(req, res) {



    res.render("login/login");
}

export function routesCreateAccount(req, res){
    
}

async function validateAccountCreation(accountForm){
    const passwordMessage = document.getElementById("passwordMessage");
    const passwordRepeated = document.getElementById("passwordRepeated");
    const passwordRepeatedMessage = document.getElementById("passwordRepeatedMessage");
    passwordMessage.textContent = "";
    passwordRepeatedMessage.textContent = "";
    if (accountForm.password.value.length < 8) {
        passwordMessage.textContent = "Le mot de passe doit contenir au moins 8 caractères.";
    } else if (accountForm.password.value != passwordRepeated.value) {
        passwordRepeatedMessage.textContent = "Les mots de passe ne correspondent pas.";
    } else {
    const rawValue = accountForm.password.value;
    //accountForm.password.value = await hashSHA256(rawValue);
    accountForm.submit();
    accountForm.password.value = rawValue;
    }

}
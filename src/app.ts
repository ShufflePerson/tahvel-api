import { Tara } from "./tara";
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

import dotenv from "dotenv"
import { Tahvel } from "./tahvel";
dotenv.config();


async function main() {
    const TAHVEL_INIT_TARA_SESSION_ENDPOINT = "https://tahvel.edu.ee/hois_back/taraLogin";
    const ID_CODE = process.env.ID_CODE;
    const jar = new CookieJar();
    const sharedAxios = wrapper(axios.create({
        jar,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
        }
    }));

    if (!ID_CODE) {
        console.error(".env must contain ID_CODE");
        return;
    }

    const tara = new Tara(TAHVEL_INIT_TARA_SESSION_ENDPOINT, sharedAxios, true);
    const loginResult = await tara.loginViaSmartID(ID_CODE);
    if (!loginResult.controlCode) {
        console.error("login via smartID failed");
        return;
    }

    console.log(`Control Code: ${loginResult.controlCode}`);
    console.log("Check your phone and authenticate via the app.");

    const tahvelAuthToken = await tara.waitForAuthentication();
    const tahvel = new Tahvel(tahvelAuthToken, sharedAxios);
    const userData = await tahvel.getUser();

    console.log(`Tere '${userData.fullname}'`);
    console.log(JSON.stringify(userData, null, 4));
}

main();
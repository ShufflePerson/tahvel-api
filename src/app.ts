import { Tara } from "./tara";
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as fs from 'fs';

import dotenv from "dotenv"
import { Tahvel } from "./tahvel";
dotenv.config();


async function main() {
    const TAHVEL_INIT_TARA_SESSION_ENDPOINT = "https://tahvel.edu.ee/hois_back/taraLogin";
    const ID_CODE = process.env.ID_CODE;
    const SESSION_FILE = 'session.json';

    let jar = new CookieJar();
    const sharedAxios = wrapper(axios.create({
        jar,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
        }
    }));

    let tahvelAuthToken: string | null = null;

    try {
        if (fs.existsSync(SESSION_FILE)) {
            throw new Error("Disabled due to issues.");
            const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
            if (sessionData.cookieJar && sessionData.tahvelAuthToken) {
                jar = CookieJar.fromJSON(JSON.stringify(sessionData.cookieJar));
                sharedAxios.defaults.jar = jar;
                tahvelAuthToken = sessionData.tahvelAuthToken;
                console.log("Loaded session from session.json");
            }
        }
    } catch (error) {
        console.error("Could not load session file, proceeding with login.", error);
    }


    if (!tahvelAuthToken) {
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

        tahvelAuthToken = await tara.waitForAuthentication();

        const sessionData = {
            cookieJar: jar.toJSON(),
            tahvelAuthToken: tahvelAuthToken
        };
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
        console.log("Saved session to session.json");
    }

    const tahvel = new Tahvel(tahvelAuthToken, sharedAxios);
    const userData = await tahvel.getUser();
    const userAttributes = await tahvel.getUserAttributes();
    const studentGroupUuid = userAttributes.studentGroupUuid;
    const timetable = await tahvel.getTimetable(studentGroupUuid, userAttributes.schoolId, new Date("2025-08-25T03:00:00.000Z"), new Date("2026-08-23T03:00:00.000Z"));

    console.log(`Tere '${userData.fullname}'`);
    console.log(timetable);
}

main();
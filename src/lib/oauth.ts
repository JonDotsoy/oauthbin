import { OAthProvider } from "./oauth-provider/oauth-provider";
import { AstroDb } from "./oauth-provider/stores/astro-db";

export const oauth = new OAthProvider({
    db: new AstroDb()
})

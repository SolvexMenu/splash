import { SplashClient } from "../src/client";
import { APIKeyAuth } from "../src/core/auth";

const client = new SplashClient({
    baseUrl: "https://api.unsplash.com/",
    auth: new APIKeyAuth("Authorization", `Client-ID ${process.env.CLIENT_ID}`),
    retry: true
});

// const result = await client.photos.list()
// const result = await client.photos.get("H0msexrWl_0")
// const result = await client.photos.random()
// const result = await client.photos.statistics("H0msexrWl_0")
// const result = await client.photos.download("H0msexrWl_0")
// const result = await client.search.photos({ query: "Stone house" })
// const result = await client.search.collections({ query: "Food" })
// const result = await client.collections.list({})
const result = await client.collections.get("")
console.log(result);

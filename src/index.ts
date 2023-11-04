import app from "./app";

const main = async () => {
    app.listen(8080, () => console.log("Listening on port 8080"));
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

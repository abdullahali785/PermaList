import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import fs from "fs";

const app = express();
const port = 3000;
let items = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: fs.readFileSync("password.txt", "utf8"),
  port: 5432,
});
db.connect();


app.get("/", async (req, res) => {
  try {
    let data = await db.query(
    "SELECT * FROM items ORDER BY id ASC;"
    );
    items = data.rows;

    res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
    });

  } catch (err) {
    console.log(`Get Route Error: ${err}`);
  };

});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  //console.log(item);

  try {
    await db.query(
      "INSERT INTO items (title) VALUES ($1)",
      [item]
    );
    res.redirect("/");

  } catch (err) {
    console.log(`Post /add Route Error: ${err}`);
  };

});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query(
      "UPDATE items SET title = $1 WHERE id = $2;",
      [item, id]
    );
    res.redirect("/");

  } catch (err) {
    console.log(`Post /edit Route Error: ${err}`);
  };

});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  //console.log(itemID);

  try {
    await db.query(
      "DELETE FROM items WHERE id = $1",
      [id]
    );
    res.redirect("/");

  } catch (err) {
    console.log(`Delete Route Error: ${err}`);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});